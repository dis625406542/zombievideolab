import { ImageModerationError, moderatePortraits } from "@/lib/image-moderation";
import { enabled, sameOrigin } from "@/lib/video-access";
import { consumeLimit } from "@/lib/billing-catalog";
import { visitorFrom } from "@/lib/video-visitor";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 180;
export async function POST(request: Request) {
  const reply = (data: unknown, status: number) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
  if (!enabled()) return reply({ error: "Image safety screening is temporarily unavailable. No payment has been taken." }, 403);
  if (!sameOrigin(request)) return reply({ error: "Invalid request origin." }, 403);
  if (Number(request.headers.get("content-length") || 0) > 11 * 1024 * 1024) return reply({ error: "Photo exceeds the 10 MB limit." }, 413);
  const visitor=visitorFrom(request);
  if(!visitor) return reply({error:"Refresh the page first and allow the browser cookie."},401);
  try {
    if(!await consumeLimit("moderation",visitor,30) || !await consumeLimit("moderation-global","all",300,86400)) return reply({error:"Too many photo checks. Please try again later."},429);
  } catch {return reply({error:"Image safety check unavailable."},503);}
  let file: FormDataEntryValue | null;
  try { file = (await request.formData()).get("photo"); } catch { return reply({ error: "Upload a valid photo." }, 400); }
  if (!(file instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size < 1 || file.size > 10 * 1024 * 1024) return reply({ error: "Use a JPG, PNG or WebP photo under 10 MB." }, 400);
  const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
  const webp = String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
  if (!(file.type === "image/jpeg" && jpeg || file.type === "image/png" && png || file.type === "image/webp" && webp)) return reply({ error: "File content does not match its image type." }, 400);
  try {
    await moderatePortraits([file]);
    return reply({ approved: true }, 200);
  } catch (error) {
    return reply({ error: error instanceof ImageModerationError ? error.message : "Image safety check unavailable. Please try again." }, error instanceof ImageModerationError ? error.status : 503);
  }
}
