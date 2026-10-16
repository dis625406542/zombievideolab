import "server-only";
import { findJob, publicJob, videoAvailable, withVideoLock, changeJob, saveStoredVideo, claimStorageAttempt, recordStorageError } from "./video-jobs";
import { configured, statusForProvider } from "./video-provider";
import { fetchProviderVideo } from "./provider-video";
import { putGeneratedVideo } from "./r2";
import { recordGeneration, purgeOrderInputs } from "./paid-generation";
import { orderFor } from "./billing-orders";
import { safeError } from "./video-access";

// Only provider polling / readiness is on the response path. Never download or upload here.
export async function refreshVideo(visitor: string, code: string) {
  const row = await findJob(visitor, code);
  if (!row) return null;
  if (row.status === "finished" && (row.r2_key || row.video_url)) return publicJob(row);
  if (!row.task_id || row.status === "failed" || row.status === "unknown") return publicJob(row);
  try {
    const result = await withVideoLock(code, async () => {
      const current = await findJob(visitor, code);
      if (!current) return null;
      if (current.status === "failed" || current.status === "unknown" || current.status === "finished") return publicJob(current);
      let source = current.video_url;
      if (!source && !current.r2_key) {
        if (!configured(current.provider)) throw new Error("The original provider API key is required to check this video.");
        const status = await statusForProvider(current.provider, current.task_id!);
        if (status.status === "failed") {
          await changeJob(visitor, code, { status: "failed", progress: status.progress, error: status.error });
          await recordGeneration(code, "failed", status.error || "The video provider could not finish this request. Retry your paid order without paying again.");
          return publicJob((await findJob(visitor, code))!);
        }
        if (status.status !== "finished" || !status.videoUrl) {
          await changeJob(visitor, code, { status: "running", progress: status.progress });
          return publicJob((await findJob(visitor, code))!);
        }
        source = status.videoUrl;
      }
      // Keep the source in the DB for immediate playback and durable archival retries.
      await changeJob(visitor, code, { status: "finished", progress: 100, ...(source ? { videoUrl: source } : {}) });
      await recordGeneration(code, "finished");
      return publicJob((await findJob(visitor, code))!);
    });
    // Another request may have completed the video while holding the lease.
    return result ?? publicJob((await findJob(visitor, code)) ?? row);
  } catch (error) {
    console.error("Video status unavailable", { code, error: safeError(error) });
    const current = (await findJob(visitor, code)) ?? row;
    return videoAvailable(current) ? publicJob(current) : { ...publicJob(current), error: safeError(error) };
  }
}

// Invoke using Next after() or the authenticated worker, NEVER an untracked promise.
// A finished video stays finished even when storage is unavailable.
export async function archiveVideo(visitor: string, code: string) {
  try {
    await withVideoLock(code, async () => {
      const row = await findJob(visitor, code);
      if (!row || row.status !== "finished" || (!row.video_url && !row.r2_key)) return;
      const order = await orderFor(visitor, code);
      if (order && order.status !== "paid") return;
      if (order && order.generation_status !== "finished") await recordGeneration(code, "finished");
      // The provider has finished consuming the inputs; do not retain portraits for archival retries.
      if (order?.input_photos.length) await purgeOrderInputs(order.id).catch(() => undefined);
      if (row.r2_key || !videoAvailable(row) || !row.video_url) return;
      if (!await claimStorageAttempt(visitor, code)) return;
      try {
        const bytes = await fetchProviderVideo(row.video_url);
        const key = await putGeneratedVideo(code, bytes);
        await saveStoredVideo(visitor, code, key);
        console.info("Video archived to R2", { code, key, bytes: bytes.length });
      } catch (error) {
        // Do not leak signed URLs / query tokens into logs or browser responses.
        const detail = (error instanceof Error ? error.message : "Unknown storage error")
          .replace(/https?:\/\/[^\s]+/g, "[redacted URL]").slice(0, 500);
        await recordStorageError(visitor, code, detail);
        console.error("R2 video archival pending; playback remains available", { code, error: detail });
      }
    });
  } catch {
    console.error("Video archival worker unavailable; persistent job retained", { code });
  }
}
