import "server-only";
import { pool } from "./db";
import type { ProviderName, Resolution, AspectRatio } from "./video-provider";

import { DEFAULT_TEMPLATE, videoSpec, type TemplateId } from "./video-templates";

export type VideoJob = { template_id: TemplateId; prompt_version: string;
  code: string; provider: ProviderName; task_id: string | null;
  status: "submitting" | "running" | "finished" | "failed" | "unknown";
  resolution: Resolution; aspect_ratio: AspectRatio; progress: number; video_url: string | null;
  completed_at: Date | null; storage_attempts: number; storage_retry_at: Date | null; storage_error: string | null;
  error: string | null; r2_key: string | null; stored_at: Date | null; created_at: Date;
};

export async function addJob(visitor: string, code: string, provider: ProviderName, resolution: Resolution, aspectRatio: AspectRatio) {
  return pool().query("INSERT INTO zombievideolab_pro.video_jobs(code,visitor_hash,provider,status,resolution,aspect_ratio) VALUES($1,$2,$3,'submitting',$4,$5) ON CONFLICT DO NOTHING RETURNING code", [code, visitor, provider, resolution, aspectRatio]);
}
export async function changeJob(visitor: string, code: string, patch: { status: VideoJob["status"]; taskId?: string; progress?: number; videoUrl?: string; error?: string }) {
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET status=$3::varchar, task_id=COALESCE($4,task_id), progress=COALESCE($5,progress), video_url=COALESCE($6,video_url), completed_at=CASE WHEN $3::varchar='finished' THEN COALESCE(completed_at,now()) ELSE completed_at END, error=$7, updated_at=now() WHERE code=$1 AND visitor_hash=$2", [code, visitor, patch.status, patch.taskId ?? null, patch.progress ?? null, patch.videoUrl ?? null, patch.error ?? null]);
}
export async function withVideoLock<T>(code: string, action: () => Promise<T>): Promise<T | null> {
  const lease = crypto.randomUUID();
  const claim = await pool().query(`UPDATE zombievideolab_pro.video_jobs SET delivery_lease=$2,
    delivery_locked_until=now()+interval '10 minutes' WHERE code=$1
    AND (delivery_locked_until IS NULL OR delivery_locked_until<now()) RETURNING code`, [code, lease]);
  if (!claim.rowCount) return null;
  try { return await action(); }
  finally { await pool().query("UPDATE zombievideolab_pro.video_jobs SET delivery_lease=NULL,delivery_locked_until=NULL WHERE code=$1 AND delivery_lease=$2", [code,lease]); }
}
export async function saveStoredVideo(visitor: string, code: string, key: string) {
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET status='finished', progress=100, r2_key=$3, stored_at=now(), completed_at=COALESCE(completed_at,now()), storage_error=NULL, storage_retry_at=NULL, error=NULL, updated_at=now() WHERE code=$1 AND visitor_hash=$2 AND r2_key IS NULL", [code, visitor, key]);
}
export async function findJob(visitor: string, code: string): Promise<VideoJob | null> {
  const result = await pool().query<VideoJob>("SELECT template_id,prompt_version,code,provider,task_id,status,resolution,aspect_ratio,progress,video_url,r2_key,stored_at,completed_at,storage_attempts,storage_retry_at,storage_error,error,created_at FROM zombievideolab_pro.video_jobs WHERE visitor_hash=$1 AND code=$2", [visitor, code]);
  return result.rows[0] ?? null;
}
export async function listJobs(visitor: string, templateId: TemplateId = DEFAULT_TEMPLATE): Promise<VideoJob[]> {
  // A process may exit after reserving a code, even after the provider accepted it.
  // Never relabel uncertain submission as a free retry.
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET status='unknown', error='Submission was interrupted. Contact support with your video code before retrying.', updated_at=now() WHERE visitor_hash=$1 AND status='submitting' AND updated_at < now() - interval '15 minutes'", [visitor]);
  const result = await pool().query<VideoJob>("SELECT template_id,prompt_version,code,provider,task_id,status,resolution,aspect_ratio,progress,video_url,r2_key,stored_at,completed_at,storage_attempts,storage_retry_at,storage_error,error,created_at FROM zombievideolab_pro.video_jobs WHERE visitor_hash=$1 AND template_id=$2 ORDER BY created_at DESC, code DESC LIMIT 50", [visitor, templateId]);
  return result.rows;
}
// A delayed copy must never extend the three-day download window.
export function videoAvailable(row: VideoJob) {
  const completed = row.completed_at ?? row.stored_at ?? row.created_at;
  return row.status === "finished" && Boolean(row.r2_key || row.video_url) &&
    Date.now() < new Date(completed).getTime() + 3 * 86400000;
}
export function publicJob(row: VideoJob) {
  return { code: row.code, templateId: row.template_id, status: row.status, resolution: row.resolution, durationSeconds: videoSpec({ templateId: row.template_id, promptVersion: row.prompt_version }).durationSeconds, aspectRatio: row.aspect_ratio, progress: row.progress, videoUrl: videoAvailable(row) ? `/api/video/file?code=${row.code}` : null, error: row.error, createdAt: row.created_at.toISOString() };
}

export async function claimStorageAttempt(visitor: string, code: string): Promise<boolean> {
  // Persist the retry time BEFORE I/O, so a killed serverless invocation also backs off.
  const result = await pool().query(`UPDATE zombievideolab_pro.video_jobs
    SET storage_attempts=storage_attempts+1, storage_error=NULL,
      storage_retry_at=now()+make_interval(secs => LEAST(3600,60*power(2,LEAST(storage_attempts,6)))::int), updated_at=now()
    WHERE code=$1 AND visitor_hash=$2 AND status='finished' AND r2_key IS NULL AND video_url IS NOT NULL
      AND COALESCE(completed_at,created_at)>now()-interval '3 days'
      AND (storage_retry_at IS NULL OR storage_retry_at<=now()) RETURNING code`, [code,visitor]);
  return Boolean(result.rowCount);
}
export async function recordStorageError(visitor: string, code: string, error: string) {
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET storage_error=$3,updated_at=now() WHERE code=$1 AND visitor_hash=$2 AND r2_key IS NULL", [code,visitor,error]);
}
