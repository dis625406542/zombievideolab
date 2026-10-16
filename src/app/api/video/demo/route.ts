import { getDemoVideoSource } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" };

// This public endpoint exposes ONLY the site's intentionally public demo, never user videos.
// Query parameters are deliberately ignored: callers cannot select a bucket or object key.
export async function GET() {
  try {
    const source = await getDemoVideoSource();
    if (!source) return Response.json({ available: false }, { headers });
    return Response.json({ available: true, ...source }, { headers });
  } catch {
    // Do not leak credentials, signed URLs or internal storage configuration in errors/logs.
    return Response.json({ available: false }, { status: 503, headers });
  }
}
