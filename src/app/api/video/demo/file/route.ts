import { getDemoVideoObject } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// A fixed, deliberately public 720p landscape sample (under 12 MB); visitor-controlled object keys are never accepted.
// Same-origin full response enables explicit browser Cache Storage and fast reloads.
export async function GET() {
  try {
    const video = await getDemoVideoObject();
    if (!video?.Body || !video.ContentLength || video.ContentLength > 12 * 1024 * 1024) {
      return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    return new Response(video.Body.transformToWebStream(), {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "inline",
        "Content-Length": String(video.ContentLength),
        "Cache-Control": "private, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
