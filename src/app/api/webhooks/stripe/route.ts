import { NextResponse, after } from "next/server";
import { stripeClient, stripeConfigured, stripeEnvironment } from "@/lib/stripe";
import { processStripeEvent } from "@/lib/billing-orders";
import { startPaidOrder } from "@/lib/paid-generation";
export const runtime="nodejs";
export const maxDuration=300;
export async function POST(request:Request) {
 if(!stripeConfigured()) return NextResponse.json({error:"Stripe is not configured."},{status:503});
 if(Number(request.headers.get("content-length")||0)>262144) return new Response(null,{status:413});
 const raw=await request.text();
 if(raw.length>262144) return new Response(null,{status:413});
 let event;
 try {event=stripeClient().webhooks.constructEvent(raw,request.headers.get("stripe-signature")||"",process.env.STRIPE_WEBHOOK_SECRET!.trim());}
 catch {return NextResponse.json({error:"Invalid webhook signature."},{status:400});}
 if(event.livemode!==(stripeEnvironment()==="live")) return NextResponse.json({error:"Wrong payment environment."},{status:400});
 try {
  const ready=await processStripeEvent(event);
  // 'ready' is already durable in Postgres. after() reduces latency, NOT the only recovery path.
  if(ready) after(async()=>{try {await startPaidOrder(ready);} catch {console.warn("Paid order awaits worker recovery.");}});
  return NextResponse.json({received:true});
 } catch {return NextResponse.json({error:"Webhook processing failed; retry this event."},{status:500});}
}
