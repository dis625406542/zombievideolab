import "server-only";
import { Pool } from "pg";
import type { ProviderName, Resolution, AspectRatio } from "./video-provider";

export type VideoJob = {
  code: string; provider: ProviderName; task_id: string | null;
  status: "submitting" | "running" | "finished" | "failed" | "unknown";
  resolution: Resolution; aspect_ratio: AspectRatio; progress: number; video_url: string | null;
  error: string | null; r2_key: string | null; stored_at: Date | null; created_at: Date;
};

const globalPool = globalThis as typeof globalThis & { __zvlPoolV2?: Pool };
function pool() {
  if (!globalPool.__zvlPoolV2) {
    const connectionString = process.env.DATABASE_PRO_URL || process.env.DIRECT_PRO_URL;
    if (!connectionString) throw new Error("DATABASE_PRO_URL is required to save video history.");
    const url = new URL(connectionString);
    // Honor the existing libpq sslmode=require semantics on the configured Supabase pooler.
    // For certificate validation use sslmode=verify-full and a trusted CA instead.
    const requireTls = url.searchParams.get("sslmode") === "require";
    if (requireTls) { url.searchParams.delete("sslmode"); url.searchParams.delete("uselibpqcompat"); }
    globalPool.__zvlPoolV2 = new Pool({ connectionString: url.toString(), ...(requireTls ? { ssl: { rejectUnauthorized: false } } : {}), max: 5, connectionTimeoutMillis: 8000 });
  }
  return globalPool.__zvlPoolV2;
}
export async function addJob(visitor: string, code: string, provider: ProviderName, resolution: Resolution, aspectRatio: AspectRatio) {
  return pool().query("INSERT INTO zombievideolab_pro.video_jobs(code,visitor_hash,provider,status,resolution,aspect_ratio) VALUES($1,$2,$3,'submitting',$4,$5) ON CONFLICT DO NOTHING RETURNING code", [code, visitor, provider, resolution, aspectRatio]);
}
export async function changeJob(visitor: string, code: string, patch: { status: VideoJob["status"]; taskId?: string; progress?: number; videoUrl?: string; error?: string }) {
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET status=$3, task_id=COALESCE($4,task_id), progress=COALESCE($5,progress), video_url=COALESCE($6,video_url), error=$7, updated_at=now() WHERE code=$1 AND visitor_hash=$2", [code, visitor, patch.status, patch.taskId ?? null, patch.progress ?? null, patch.videoUrl ?? null, patch.error ?? null]);
}
export async function withVideoLock<T>(code: string, action: () => Promise<T>): Promise<T | null> {
  const client = await pool().connect();
  let locked = false;
  try {
    const result = await client.query<{ locked: boolean }>("SELECT pg_try_advisory_lock(hashtext($1), hashtext($2)) AS locked", ["zvl-r2", code]);
    locked = result.rows[0]?.locked === true;
    if (!locked) return null;
    return await action();
  } finally {
    if (locked) await client.query("SELECT pg_advisory_unlock(hashtext($1), hashtext($2))", ["zvl-r2", code]).catch(console.error);
    client.release();
  }
}
export async function saveStoredVideo(visitor: string, code: string, key: string) {
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET status='finished', progress=100, r2_key=$3, stored_at=now(), video_url=NULL, error=NULL, updated_at=now() WHERE code=$1 AND visitor_hash=$2 AND r2_key IS NULL", [code, visitor, key]);
}
export async function findJob(visitor: string, code: string): Promise<VideoJob | null> {
  const result = await pool().query<VideoJob>("SELECT code,provider,task_id,status,resolution,aspect_ratio,progress,video_url,r2_key,stored_at,error,created_at FROM zombievideolab_pro.video_jobs WHERE visitor_hash=$1 AND code=$2", [visitor, code]);
  return result.rows[0] ?? null;
}
export async function listJobs(visitor: string): Promise<VideoJob[]> {
  // A process may exit after reserving a code, even after the provider accepted it.
  // Never relabel uncertain submission as a free retry.
  await pool().query("UPDATE zombievideolab_pro.video_jobs SET status='unknown', error='Submission was interrupted. Contact support with your video code before retrying.', updated_at=now() WHERE visitor_hash=$1 AND status='submitting' AND created_at < now() - interval '15 minutes'", [visitor]);
  const result = await pool().query<VideoJob>("SELECT code,provider,task_id,status,resolution,aspect_ratio,progress,video_url,r2_key,stored_at,error,created_at FROM zombievideolab_pro.video_jobs WHERE visitor_hash=$1 ORDER BY created_at DESC, code DESC LIMIT 50", [visitor]);
  return result.rows;
}
export function publicJob(row: VideoJob) {
  return { code: row.code, status: row.status, resolution: row.resolution, aspectRatio: row.aspect_ratio, progress: row.progress, videoUrl: row.r2_key && row.stored_at && Date.now() < new Date(row.stored_at).getTime() + 3 * 86400000 ? `/api/video/file?code=${row.code}` : null, error: row.error, createdAt: row.created_at.toISOString() };
}
