import { localMockPayments } from "@/lib/local-mock-payments";
import { parseTemplate } from "@/lib/video-templates";
import { after, NextResponse } from "next/server";
import { enabled, sameOrigin } from "@/lib/video-access";
import { listJobs, findJob } from "@/lib/video-jobs";
import { publicJob, videoAvailable } from "@/lib/video-jobs";
import { newVisitor, visitorFrom } from "@/lib/video-visitor";
import { orderFor } from "@/lib/billing-orders";
import { refreshVideo, archiveVideo } from "@/lib/video-delivery";
import { startPaidOrder } from "@/lib/paid-generation";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=300;
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request:Request) {
 try {
  const templateId=parseTemplate(new URL(request.url).searchParams.get("template"));
  if(!templateId) return json({error:"Unknown video template."},400);
  const visitor=visitorFrom(request);
  if(!visitor) {const response=json({enabled:enabled(),jobs:[]});newVisitor(response);return response;}
  const code=new URL(request.url).searchParams.get("code");
  if(!code) {
   const jobs=await listJobs(visitor,templateId);
   const pending=jobs.find(job=>videoAvailable(job) && job.video_url && !job.r2_key &&
    (!job.storage_retry_at || new Date(job.storage_retry_at).getTime()<=Date.now()));
   if(pending) after(()=>archiveVideo(visitor,pending.code));
   return json({enabled:enabled(),jobs:jobs.map(publicJob)});
  }
  if(!/^[A-F0-9]{32}$/.test(code)) return json({error:"Invalid video code."},400);
  const saved=await findJob(visitor,code);
  if(!saved || saved.template_id!==templateId) return json({error:"This video is not available for this browser and template."},404);
  const job=await refreshVideo(visitor,code);
  if(job?.status==="finished") after(()=>archiveVideo(visitor,code));
  return job?json(job):json({error:"This video is not available for this browser."},404);
 } catch {return json({error:"Video history is temporarily unavailable. Your saved orders have not been changed."},503);}
}
export async function POST(request:Request) {
 if(!sameOrigin(request)) return json({error:"Invalid request origin."},403);
 const visitor=visitorFrom(request);
 if(!visitor) return json({error:"Keep your browser cookie and refresh the page first."},401);
 if(Number(request.headers.get("content-length")||0)>2048) return json({error:"Invalid request."},413);
 try {
  const body=await request.json();
  const templateId=parseTemplate(body.template);
  if(!templateId) return json({error:"Unknown video template."},400);
  if(typeof body.code!=="string" || !/^[A-F0-9]{32}$/.test(body.code)) return json({error:"Invalid video code."},400);
  const order=await orderFor(visitor,body.code);
  if(!order || order.template_id!==templateId || order.status!=="paid") return json({error:"Verified payment is required for this browser's order."},403);
  if(order.provider==="local_mock" && !localMockPayments(request,templateId)) return json({error:"Simulated checkout is available only in local development."},403);
  await startPaidOrder(order.id,body.retry===true);
  return json({code:order.code});
 } catch(error) {
  return json({error:error instanceof Error && /payment|purchase|capacity|provider|unavailable|support/.test(error.message)?error.message:"Could not start this paid video. Check your orders; do not pay again."},409);
 }
}
