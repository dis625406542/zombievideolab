import { timingSafeEqual } from "node:crypto";
import { pool } from "@/lib/db";
import { startPaidOrder, recoverStaleOrders, purgeOrderInputs } from "@/lib/paid-generation";
import { refreshVideo, archiveVideo } from "@/lib/video-delivery";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export const maxDuration=300;
export async function GET(request:Request) {
 const secret=process.env.CRON_SECRET||"";
 const supplied=request.headers.get("authorization")||"";
 const expected=`Bearer ${secret}`;
 if(secret.length<32 || supplied.length!==expected.length || !timingSafeEqual(Buffer.from(supplied),Buffer.from(expected))) return new Response(null,{status:401});
 let started=0,polled=0,cleaned=0;
 try {
  await recoverStaleOrders();
  const ready=(await pool().query("SELECT id FROM zombievideolab_pro.billing_orders WHERE status='paid' AND generation_status='ready' ORDER BY paid_at LIMIT 1")).rows;
  for(const row of ready) {await startPaidOrder(row.id).catch(()=>{});started++;}
  const active=(await pool().query("SELECT visitor_hash,code FROM zombievideolab_pro.video_jobs WHERE (r2_key IS NULL AND (status='running' OR (status='finished' AND video_url IS NOT NULL AND COALESCE(completed_at,created_at)>now()-interval '3 days' AND (storage_retry_at IS NULL OR storage_retry_at<=now())))) OR (r2_key IS NOT NULL AND code IN (SELECT code FROM zombievideolab_pro.billing_orders WHERE generation_status<>'finished')) ORDER BY updated_at LIMIT 1")).rows;
  for(const row of active) {await refreshVideo(row.visitor_hash,row.code).catch(()=>{});await archiveVideo(row.visitor_hash,row.code);polled++;}
  const expired=(await pool().query("SELECT id FROM zombievideolab_pro.billing_orders WHERE input_photos<>'[]'::jsonb AND (input_expires_at<now() OR generation_status='finished') LIMIT 20")).rows;
  for(const row of expired) {try {await purgeOrderInputs(row.id);cleaned++;} catch {/* lifecycle is the independent fallback */}}
  await pool().query("DELETE FROM zombievideolab_pro.request_limits WHERE window_start<now()-interval '3 days'");
  return Response.json({started,polled,cleaned},{headers:{"Cache-Control":"no-store"}});
 } catch {return Response.json({error:"Worker failed. Paid orders remain recorded."},{status:503});}
}
