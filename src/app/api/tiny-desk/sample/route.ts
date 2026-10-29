import { getTinyDeskSampleObject } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // Limit requested ranges so this route cannot be used for arbitrary R2 reads.
    const range = request.headers.get("range");
    if (range && !/^bytes=\d+-\d*$/.test(range)) return new Response(null, { status: 416 });
    const video = await getTinyDeskSampleObject(range || undefined);
    if (!video?.Body || !video.ContentLength) return new Response(null, { status: 404 });
    return new Response(video.Body.transformToWebStream(), {
      status: video.ContentRange ? 206 : 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(video.ContentLength),
        "Accept-Ranges": "bytes",
        ...(video.ContentRange ? { "Content-Range": video.ContentRange } : {}),
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
