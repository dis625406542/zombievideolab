import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/video-access";
import { visitorFrom } from "@/lib/video-visitor";
import { checkoutReady } from "@/lib/billing-ready";
import { createOrder, saveOrderPhotos, checkoutFor, orderFor } from "@/lib/billing-orders";
import { consumeLimit } from "@/lib/billing-catalog";
import { ImageModerationError, moderatePortraits } from "@/lib/image-moderation";
import { validatePhotos, validatePhotoBytes } from "@/lib/photo-validation";
import { selectPromptScenario } from "@/lib/video-prompt";
import { SITE_URL } from "@/lib/site";
import { checkoutReturnOrigin } from "@/lib/checkout-origin";
export const runtime="nodejs";
export const maxDuration=300;
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:Request) {
 if(!sameOrigin(request)) return json({error:"Invalid request origin."},403);
 const visitor=visitorFrom(request);
 if(!visitor) return json({error:"Refresh this page first and keep your browser cookie."},401);
 if(!checkoutReady()) return json({error:"Secure checkout is not configured yet. No payment was taken."},503);
 if(Number(request.headers.get("content-length")||0)>4000000) return json({error:"Please use smaller photos."},413);
 try {
  if(!await consumeLimit("checkout",visitor,10) || !await consumeLimit("checkout-global","all",100,86400)) return json({error:"Too many checkout requests. Please try again later."},429);
  const form=await request.formData();
  const code=String(form.get("code")||"");
  if(!/^[A-F0-9]{32}$/.test(code)) return json({error:"Invalid video code."},400);
  // An existing pending order resumes its original immutable photo/price snapshot.
  let order=await orderFor(visitor,code);
  if(!order || order.status==="pending" && order.input_photos.length!==2) {
   const resolution=form.get("resolution"),aspect=form.get("aspectRatio");
   if(!["480p","720p"].includes(String(resolution)) || !["9:16","16:9"].includes(String(aspect)) || form.get("consent")!=="yes") return json({error:"Confirm your photo permissions and choose a video format."},400);
   const files=[form.get("zombie"),form.get("survivor")];
   validatePhotos(files);await Promise.all(files.map(validatePhotoBytes));
   const assessments=await moderatePortraits(files);
   const scenario=selectPromptScenario(assessments);
   if(order && (order.resolution!==resolution || order.aspect_ratio!==aspect)) return json({error:"This order keeps its original format. Use a new video code to change formats."},409);
   const created=order?{order,created:true}:await createOrder(visitor,code,resolution as "480p"|"720p",aspect as "9:16"|"16:9");
   order=created.created?await saveOrderPhotos(created.order,files,scenario):created.order;
  }
  const origin=checkoutReturnOrigin(request,{
   production:process.env.NODE_ENV==="production",siteUrl:SITE_URL,
   allowedDevOrigins:process.env.DEV_ALLOWED_ORIGINS || "frontpage-rice-stem-stripes.trycloudflare.com"
  });
  const url=await checkoutFor(order,origin);
  return json({checkoutUrl:url,code:order.code});
 } catch(error) {
  if(error instanceof ImageModerationError) return json({error:error.message},error.status);
  const message=error instanceof Error?error.message:"";
  const safe=/^(Invalid checkout origin|Upload|Use two|File content|This video code|This code|This video option|This order|Photos are still|Checkout expired|This checkout expired|Payment environment)/.test(message);
  return json({error:safe?message:"Unable to open secure checkout. No video was ordered. Check your orders before trying again."},safe?409:503);
 }
}
