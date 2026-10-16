import { findJob } from "@/lib/video-jobs";
import { visitorFrom } from "@/lib/video-visitor";
import { getGeneratedVideoUrl } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const visitor = visitorFrom(request);
  if (!visitor || !code || !/^[A-F0-9]{32}$/.test(code)) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const job = await findJob(visitor, code);
    if (!job?.r2_key || !job.stored_at || Date.now() >= new Date(job.stored_at).getTime() + 3 * 86400000) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    const url = await getGeneratedVideoUrl(job.r2_key, new URL(request.url).searchParams.get("download") === "1");
    return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" } });
  } catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
