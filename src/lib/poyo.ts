import { type PromptScenario } from "./video-prompt";
import { templatePrompt } from "./template-prompt";
import { videoSpec, type PromptContext } from "./video-templates";

// PoYo API contract: https://docs.poyo.ai/api-manual/video-series/seedance-2.5
export type Resolution = "480p" | "720p";
export type AspectRatio = "9:16" | "16:9";
const api = "https://api.poyo.ai";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid provider response.");
  return value as Record<string, unknown>;
}
function httpsUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 4096) throw new Error("Missing secure media URL from provider.");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Provider returned an insecure media URL.");
  return url.href;
}
export function makeSeedanceInput(urls: string[], resolution: Resolution, aspectRatio: AspectRatio = "9:16", scenario: PromptScenario = "gender_neutral", context?: PromptContext, referenceVideo?: string) {
  const spec = videoSpec(context);
  if (spec.referenceVideo && !referenceVideo) throw new Error("The dance reference video is required.");
  if (resolution !== "480p" && resolution !== "720p") throw new Error("Unsupported resolution.");
  if (urls.length !== 2) throw new Error("Two portraits are required.");
  if (aspectRatio !== "9:16" && aspectRatio !== "16:9") throw new Error("Unsupported aspect ratio.");
  return { prompt: templatePrompt(scenario, aspectRatio, true, context), reference_image_urls: urls.map(httpsUrl), ...(spec.referenceVideo ? { reference_video_urls: [httpsUrl(referenceVideo)] } : {}), duration: spec.durationSeconds, resolution, aspect_ratio: aspectRatio, generate_audio: false };
}
export function parseUpload(response: unknown): string {
  const body = record(response);
  if (body.success !== true || body.code !== undefined && body.code !== 200) throw new Error("Photo upload was rejected by the provider.");
  return httpsUrl(record(body.data).file_url);
}
export function parseSubmit(response: unknown): string {
  const body = record(response);
  if (body.code !== undefined && body.code !== 200) throw new Error("The video provider rejected the request.");
  const data = record(body.data);
  const id = data.task_id;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{6,128}$/.test(id)) throw new Error("Provider did not return a valid task ID.");
  return id;
}
export function parseTask(response: unknown): { status: string; progress: number; videoUrl?: string; error?: string } {
  const body = record(response);
  if (body.code !== undefined && body.code !== 200) throw new Error("Unable to check video status.");
  const data = record(body.data);
  const status = data.status;
  if (!["not_started", "running", "finished", "failed"].includes(String(status))) throw new Error("Unknown provider task status.");
  const progress = typeof data.progress === "number" && Number.isFinite(data.progress) ? Math.max(0, Math.min(100, Math.floor(data.progress))) : 0;
  if (status === "failed") return { status, progress, error: typeof data.error_message === "string" ? data.error_message.slice(0, 300) : "Generation failed. Please try again later." };
  if (status === "finished") {
    const files = Array.isArray(data.files) ? data.files : [];
    const file = files.map((item: unknown) => record(item)).find((item) => item.file_type === "video" || item.format === "mp4" || item.content_type === "video/mp4");
    if (!file) throw new Error("Provider finished without a playable video.");
    return { status, progress: 100, videoUrl: httpsUrl(file.file_url) };
  }
  return { status: String(status), progress };
}
async function request(path: string, init: RequestInit, timeout = 25000): Promise<unknown> {
  const token = process.env.poyo_seedance_token || process.env.POYO_API_KEY;
  if (!token) throw new Error("PoYo API key is not configured on the server.");
  const result = await fetch(`${api}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init.headers }, cache: "no-store", signal: AbortSignal.timeout(timeout) });
  if (!result.ok) throw new Error(`PoYo returned HTTP ${result.status}. ${result.status === 401 ? "Check the API key." : "Check provider availability or balance."}`);
  return result.json();
}
export async function uploadPortrait(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file, file.name);
  return parseUpload(await request("/api/common/upload/stream", { method: "POST", body: form }, 45000));
}
export async function submitVideo(urls: string[], resolution: Resolution, aspectRatio: AspectRatio = "9:16", scenario: PromptScenario = "gender_neutral", context?: PromptContext, options?: { referenceVideo?: string; beforeSubmit?: () => Promise<void> }): Promise<string> {
  const input = makeSeedanceInput(urls, resolution, aspectRatio, scenario, context, options?.referenceVideo);
  await options?.beforeSubmit?.();
  return parseSubmit(await request("/api/generate/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "seedance-2.5", input }) }));
}
export async function getVideoStatus(taskId: string) {
  return parseTask(await request(`/api/generate/status/${encodeURIComponent(taskId)}`, { method: "GET" }));
}
