import { localMockPayments } from "@/lib/local-mock-payments";
import { enabled as generationEnabled } from "@/lib/video-access";
import { parseTemplate } from "@/lib/video-templates";
import { NextResponse } from "next/server";
import { catalog, consumeLimit } from "@/lib/billing-catalog";
import { ordersFor, orderFor, publicOrder, reconcileOrder } from "@/lib/billing-orders";
import { newVisitor, visitorFrom } from "@/lib/video-visitor";
import { checkoutReady } from "@/lib/billing-ready";
import { stripeEnvironment, stripeConfigured } from "@/lib/stripe";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request:Request) {
 try {
  const templateId=parseTemplate(new URL(request.url).searchParams.get("template"));
  if(!templateId) return json({error:"Unknown video template."},400);
  const mockPayment=localMockPayments(request,templateId);
  const prices=(await catalog(templateId)).map(price=>({...price,purchasable:price.purchasable || mockPayment && price.duration_seconds===15}));
  const enabled=(mockPayment ? generationEnabled() : checkoutReady()) && prices.some(price=>price.purchasable);
  const visitor=visitorFrom(request);
  if(!visitor) {const response=json({enabled,mockPayment,testMode:!mockPayment && stripeConfigured() && stripeEnvironment()==="test",prices,orders:[]});newVisitor(response);return response;}
  const code=new URL(request.url).searchParams.get("code");
  if(code) {
   if(!/^[A-F0-9]{32}$/.test(code)) return json({error:"Invalid video code."},400);
   let order=await orderFor(visitor,code);
   if(!order || order.template_id!==templateId) return json({error:"This purchase is not available in this browser. Keep the original browser cookie."},404);
   if(order.status==="pending" && order.provider!=="local_mock" && stripeConfigured() && await consumeLimit("reconcile",visitor+code,1,10)) {
    await reconcileOrder(order);order=(await orderFor(visitor,code))!;
   }
   return json({order:publicOrder(order)});
  }
  return json({enabled,mockPayment,testMode:!mockPayment && stripeConfigured() && stripeEnvironment()==="test",prices,orders:(await ordersFor(visitor,templateId)).map(publicOrder)});
 } catch {return json({error:"Payment status is temporarily unavailable. Do not pay again; check this browser later."},503);}
}
