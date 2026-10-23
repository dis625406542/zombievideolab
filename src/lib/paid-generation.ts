import "server-only";
import { localMockRuntimeEnabled } from "./local-mock-payments";
import { pool } from "./db";
import { orderById, type Order, randomId } from "./billing-orders";
import { readInputPhotos, deleteInputPhotos } from "./r2";
import { moderatePortraits, ImageModerationError } from "./image-moderation";
import { configured, submitForProvider } from "./video-provider";
import { selectPromptScenario, type PromptScenario } from "./video-prompt";
import { DEFAULT_TEMPLATE, requiredPhotoCount } from "./video-templates";
import { enabled } from "./video-access";

// Database row locks are the authority; neither a redirect nor a client flag grants generation.
export async function startPaidOrder(id:string, retry=false) {
  if(!enabled()) throw new Error("Video generation is temporarily unavailable. Your payment remains recorded.");
  const db=await pool().connect();
  let order:Order|undefined;
  try {
    await db.query("BEGIN");
    order=(await db.query<Order>("SELECT * FROM zombievideolab_pro.billing_orders WHERE id=$1 FOR UPDATE",[id])).rows[0];
    if(!order || order.status!=="paid") throw new Error("A verified payment is required.");
    if(order.provider==="local_mock" && !localMockRuntimeEnabled()) throw new Error("Simulated purchases are available only in local development.");
    const eligible=order.generation_status==="ready" || retry && order.generation_status==="failed";
    if(!eligible) { await db.query("COMMIT"); return; }
    if(order.attempts>=3 || new Date(order.input_expires_at).getTime()<=Date.now() || order.input_photos.length!==requiredPhotoCount(order.template_id,order.scene_id))
      throw new Error("This purchase needs support assistance. Do not pay again; contact us with your video code.");
    if(!configured(order.video_provider)) throw new Error("The original video provider is unavailable. Your paid order is saved.");
    // Cross-instance cost ceiling. Retry attempts count too; a deploy cannot reset this counter.
    await db.query("SELECT pg_advisory_xact_lock(hashtext('zvl-daily-submissions'))");
    const count=Number((await db.query("SELECT count(*) AS n FROM zombievideolab_pro.video_generation_attempts WHERE created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'")).rows[0].n);
    const limit=Math.max(1,Math.min(10000,Number(process.env.VIDEO_DAILY_SUBMISSION_LIMIT)||20));
    if(count>=limit) throw new Error("Generation is queued because today's capacity is full. Your payment is saved; do not pay again.");
    order=(await db.query<Order>("UPDATE zombievideolab_pro.billing_orders SET generation_status='preparing',attempts=attempts+1,error=NULL,updated_at=now() WHERE id=$1 RETURNING *",[id])).rows[0];
    await db.query("INSERT INTO zombievideolab_pro.video_generation_attempts(id,order_id,attempt_number,status) VALUES($1,$2,$3,'preparing')",[randomId(),id,order.attempts]);
    await db.query(`INSERT INTO zombievideolab_pro.video_jobs(code,visitor_hash,provider,status,resolution,aspect_ratio,template_id,prompt_version)
      VALUES($1,$2,$3,'submitting',$4,$5,$6,$7) ON CONFLICT(code) DO UPDATE SET status='submitting',task_id=NULL,progress=0,
      video_url=NULL,completed_at=NULL,storage_attempts=0,storage_retry_at=NULL,storage_error=NULL,error=NULL,updated_at=now() WHERE video_jobs.visitor_hash=EXCLUDED.visitor_hash AND video_jobs.r2_key IS NULL`,
      [order.code,order.visitor_hash,order.video_provider,order.resolution,order.aspect_ratio,order.template_id,order.prompt_version]);
    await db.query("COMMIT");
  } catch(e) { await db.query("ROLLBACK"); throw e; } finally {db.release();}
  let submitted=false;
  try {
    const files=await readInputPhotos(order.input_photos);
    const assessments=await moderatePortraits(files); // Fail closed; upload-time approval is not trusted.
    const scenario=order.template_id === DEFAULT_TEMPLATE ? (order.prompt_scenario ?? selectPromptScenario(assessments)) : "gender_neutral";
    const task=await submitForProvider(order.video_provider,files,order.resolution,`${order.code}-${order.attempts}`,order.aspect_ratio,scenario,{templateId:order.template_id,promptVersion:order.prompt_version,sceneId:order.scene_id,promptSnapshot:order.prompt_snapshot},async()=>{
      // Uploads and YIR quote are preparation. Only the final chargeable submit is ambiguous on timeout.
      const gate=await pool().query(`UPDATE zombievideolab_pro.billing_orders SET generation_status='submitting',prompt_scenario=COALESCE(prompt_scenario,$3),updated_at=now()
        WHERE id=$1 AND status='paid' AND generation_status='preparing' AND attempts=$2 RETURNING id`,[id,order.attempts,scenario]);
      if(!gate.rowCount) throw new Error("This order can no longer be generated. Contact support; do not pay again.");
      await pool().query("UPDATE zombievideolab_pro.video_generation_attempts SET status='submitting',updated_at=now() WHERE order_id=$1 AND attempt_number=$2",[id,order.attempts]);
      submitted=true; // A subsequent submit timeout is NOT permission for a free resubmission.
    });
    const tx=await pool().connect();
    try {
      await tx.query("BEGIN");
      await tx.query("UPDATE zombievideolab_pro.video_jobs SET status='running',task_id=$2,error=NULL,updated_at=now() WHERE code=$1",[order.code,task]);
      await tx.query("UPDATE zombievideolab_pro.billing_orders SET generation_status='running',error=NULL,updated_at=now() WHERE id=$1 AND attempts=$2",[id,order.attempts]);
      await tx.query("UPDATE zombievideolab_pro.video_generation_attempts SET status='running',provider_task_id=$3,updated_at=now() WHERE order_id=$1 AND attempt_number=$2",[id,order.attempts,task]);
      await tx.query("COMMIT");
    } catch(e) {await tx.query("ROLLBACK");throw e;} finally {tx.release();}
  } catch(e) {
    const status=submitted?"unknown":"failed";
    const error=submitted?"Submission status is uncertain. Contact support with your video code; do not pay or submit again.":e instanceof ImageModerationError?e.message:"Could not prepare this paid video. Retry this purchase without paying again, or contact support.";
    await recordGeneration(order.code,status,error,order.attempts);
  }
}
export async function recordGeneration(code:string,status:"running"|"finished"|"failed"|"unknown",error:string|null=null,attempt?:number,expectedState?:string) {
  const db=await pool().connect();
  try {
    await db.query("BEGIN");
    const order=(await db.query<Order>("UPDATE zombievideolab_pro.billing_orders SET generation_status=$2,error=$3,updated_at=now() WHERE code=$1 AND ($4::int IS NULL OR attempts=$4) AND ($5::text IS NULL OR (generation_status=$5 AND updated_at<now()-interval '15 minutes')) RETURNING *",[code,status,error,attempt??null,expectedState??null])).rows[0];
    if(order) {
      await db.query("UPDATE zombievideolab_pro.video_generation_attempts SET status=$3,error=$4,updated_at=now() WHERE order_id=$1 AND attempt_number=$2",[order.id,order.attempts,status,error]);
      if(status==="unknown" || status==="failed") await db.query("UPDATE zombievideolab_pro.video_jobs SET status=$2,error=$3,updated_at=now() WHERE code=$1",[code,status,error]);
    }
    await db.query("COMMIT");
  } catch(e) {await db.query("ROLLBACK");throw e;} finally {db.release();}
}
export async function purgeOrderInputs(id:string) {
  const order=await orderById(id);
  if(!order?.input_photos.length) return;
  await deleteInputPhotos(order.input_photos);
  await pool().query("UPDATE zombievideolab_pro.billing_orders SET input_photos='[]',updated_at=now() WHERE id=$1",[id]);
}
export async function recoverStaleOrders() {
  const stale=(await pool().query<Order>(`SELECT * FROM zombievideolab_pro.billing_orders WHERE generation_status IN ('preparing','submitting')
    AND updated_at<now()-interval '15 minutes' LIMIT 50`)).rows;
  for(const order of stale) await recordGeneration(order.code,order.generation_status==="submitting"?"unknown":"failed",
    order.generation_status==="submitting"?"Submission was interrupted. Contact support before retrying; do not pay again.":"Preparation was interrupted. You can retry this paid order at no extra charge.",order.attempts,order.generation_status);
}
