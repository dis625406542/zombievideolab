import { after } from "next/server";
import { findJob, videoAvailable } from "@/lib/video-jobs";
import { orderFor } from "@/lib/billing-orders";
import { visitorFrom } from "@/lib/video-visitor";
import { getGeneratedVideoUrl } from "@/lib/r2";
import { checkedProviderVideoUrl } from "@/lib/provider-video";
import { archiveVideo } from "@/lib/video-delivery";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");
  const visitor = visitorFrom(request);
  if (!visitor || !code || !/^[A-F0-9]{32}$/.test(code)) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const [job, order] = await Promise.all([findJob(visitor, code), orderFor(visitor, code)]);
    if (order && order.status !== "paid") return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    if (!job || !videoAvailable(job)) return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    // Prefer the original provider source; archival is a backup, not a playback gate.
    // Keep ownership, payment, retention and exact-host checks on this stable route.
    // The player can request source=r2 once if the provider URL has expired.
    if (!job.r2_key) after(() => archiveVideo(visitor, code));
    let url: string | undefined;
    if (new URL(request.url).searchParams.get("source") !== "r2" && job.video_url) {
      try { url = await checkedProviderVideoUrl(job.video_url); }
      catch (error) { if (!job.r2_key) throw error; }
    }
    if (!url && job.r2_key) {
      url = await getGeneratedVideoUrl(job.r2_key, new URL(request.url).searchParams.get("download") === "1");
    }
    if (!url) return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
    return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" } });
  } catch { return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
