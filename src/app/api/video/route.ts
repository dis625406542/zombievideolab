import { ImageModerationError, moderatePortraits } from "@/lib/image-moderation";
import { fetchProviderVideo } from "@/lib/provider-video";
import { putGeneratedVideo } from "@/lib/r2";
import { NextResponse } from "next/server";
import { enabled, reserve, sameOrigin, safeError } from "@/lib/video-access";
import { addJob, changeJob, findJob, listJobs, publicJob, saveStoredVideo, withVideoLock } from "@/lib/video-jobs";
import { newVisitor, visitorFrom } from "@/lib/video-visitor";
import { configured, selectedProvider, statusForProvider, submitForProvider, type Resolution } from "@/lib/video-provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noStore = { "Cache-Control": "no-store" };
function json(data: unknown, status = 200) { return NextResponse.json(data, { status, headers: noStore }); }

export async function GET(request: Request) {
  try {
    let visitor = visitorFrom(request);
    if (!visitor) {
      // Establish an anonymous identity before any POST; a forged fingerprint or video code is never authorization.
      const response = json({ enabled: enabled(), jobs: [] });
      visitor = newVisitor(response);
      return response;
    }
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    if (!code) return json({ enabled: enabled(), jobs: (await listJobs(visitor)).map(publicJob) });
    if (!/^[A-F0-9]{32}$/.test(code)) return json({ error: "Invalid video code." }, 400);
    const row = await findJob(visitor, code);
    if (!row) return json({ error: "This video is not available for this browser." }, 404);
    if (!row.task_id || row.status === "failed" || row.status === "unknown" || row.r2_key) return json(publicJob(row));
    try {
      // A DB advisory lock stops concurrent polls from downloading/uploading the same result twice.
      const result = await withVideoLock(code, async () => {
        const current = await findJob(visitor, code);
        if (!current || current.r2_key) return current ? publicJob(current) : null;
        let source = current.video_url;
        if (!source) {
          if (!configured(current.provider)) throw new Error("The original provider API key is required to check this video.");
          const status = await statusForProvider(current.provider, current.task_id!);
          if (status.status === "failed") {
            await changeJob(visitor, code, { status: "failed", progress: status.progress, error: status.error });
            return publicJob((await findJob(visitor, code))!);
          }
          if (status.status !== "finished" || !status.videoUrl) {
            await changeJob(visitor, code, { status: "running", progress: status.progress });
            return publicJob((await findJob(visitor, code))!);
          }
          source = status.videoUrl;
          // Save the provider source only server-side, so an interrupted copy can be retried without regeneration.
          await changeJob(visitor, code, { status: "running", progress: 99, videoUrl: source });
        }
        try {
          const bytes = await fetchProviderVideo(source);
          const key = await putGeneratedVideo(code, bytes);
          await saveStoredVideo(visitor, code, key);
          return publicJob((await findJob(visitor, code))!);
        } catch (error) {
          console.error("R2 video ingestion failed", error instanceof Error ? error.message : "unknown error");
          return { ...publicJob((await findJob(visitor, code))!), error: "Video generated; secure storage is pending. We will retry on your next status check. No new generation was ordered." };
        }
      });
      return json(result ?? { ...publicJob(row), status: "running", progress: 99 });
    } catch (error) { console.error("Video status unavailable", error instanceof Error ? error.message : "unknown error"); return json({ error: safeError(error) }, 502); }
  } catch (error) { console.error("Video history unavailable", error); return json({ error: "Video history is temporarily unavailable. Check the database connection." }, 503); }
}

export async function POST(request: Request) {
  if (!enabled()) return json({ error: "Generation is limited to local private testing until payments and durable cost limits are ready." }, 403);
  if (!sameOrigin(request)) return json({ error: "Invalid request origin." }, 403);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 21 * 1024 * 1024) return json({ error: "Photos exceed the 20 MB combined limit." }, 413);
  let data: FormData;
  try { data = await request.formData(); } catch { return json({ error: "Upload two valid photos." }, 400); }
  const files = [data.get("zombie"), data.get("survivor")];
  if (files.some((f) => !(f instanceof File))) return json({ error: "Two photos are required." }, 400);
  const images = files as File[];
  if (images.some((f) => f.size < 1 || f.size > 10 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(f.type))) return json({ error: "Each portrait must be a JPG, PNG or WebP under 10 MB." }, 400);
  // Validate file signatures before sending images to the provider.
  for (const file of images) {
    const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const png = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    const webp = String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP";
    if (!(file.type === "image/jpeg" && jpeg || file.type === "image/png" && png || file.type === "image/webp" && webp)) return json({ error: "File content does not match its image type." }, 400);
  }
  const code = data.get("code");
  if (typeof code !== "string" || !/^[A-F0-9]{32}$/.test(code)) return json({ error: "A valid 32-character video code is required." }, 400);

  const resolution = data.get("resolution");
  if (resolution !== "480p" && resolution !== "720p") return json({ error: "Choose 480p or 720p." }, 400);
  const aspectRatio = data.get("aspectRatio");
  if (aspectRatio !== "9:16" && aspectRatio !== "16:9") return json({ error: "Choose a portrait or landscape format." }, 400);
  if (data.get("consent") !== "yes") return json({ error: "Confirm that you have rights to both adult portraits." }, 400);
  const visitor = visitorFrom(request);
  if (!visitor) return json({ error: "Please refresh the page to initialize your private video history." }, 403);
  let provider;
  try {
    provider = selectedProvider();
    if (!(await addJob(visitor, code, provider, resolution as Resolution, aspectRatio)).rowCount) return json({ error: "This video code is already in use. Generate a new one." }, 409);
  } catch (error) { console.error("Video job initialization failed", error); return json({ error: "Could not save your video request. No provider request was sent." }, 503); }
  if (!reserve(code)) {
    await changeJob(visitor, code, { status: "failed", error: "Private testing limit reached. No request was sent." });
    return json({ error: "Private testing limit reached. No provider request was sent." }, 429);
  }
  // Fail closed: neither original image is sent to a video provider until AI screening approves both.
  try { await moderatePortraits(images); } catch (error) {
    const message = error instanceof ImageModerationError ? error.message : "Image safety check unavailable; no video request was sent.";
    try { await changeJob(visitor, code, { status: "failed", error: message }); } catch (databaseError) { console.error("Could not record blocked video submission", databaseError); }
    return json({ error: message }, error instanceof ImageModerationError ? error.status : 503);
  }
  try {
    const taskId = await submitForProvider(provider, images, resolution as Resolution, code, aspectRatio);
    await changeJob(visitor, code, { status: "running", taskId });
    return json({ code, status: "running" });
  } catch (error) {
    // A timeout can mean the provider accepted the request: never retry automatically or charge again.
    try { await changeJob(visitor, code, { status: "unknown", error: "Submission could not be confirmed. Contact support before attempting another request." }); } catch (databaseError) { console.error("Could not record uncertain video submission", databaseError); }
    return json({ error: `${safeError(error)} Submission may have succeeded; do not pay or resubmit automatically. Keep your video code for support.` }, 502);
  }
}
