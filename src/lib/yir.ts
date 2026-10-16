import { buildVideoPrompt, type PromptScenario } from "./video-prompt";
import { isIP } from "node:net";
import type { Resolution, AspectRatio } from "./poyo";

// Official API: https://yir.ai/docs/reference/videos/quote-video-generation
// https://yir.ai/docs/reference/videos/submit-video-generation
// https://yir.ai/docs/reference/files/create-files
const base = "https://gateway.yir.ai";
const fileIdPattern = /^file_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid YIR response.");
  return value as Record<string, unknown>;
}
function secureUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 4096) throw new Error("YIR returned an invalid URL.");
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || isIP(url.hostname) || /^(localhost|.*\.(?:localhost|local|internal))$/i.test(url.hostname)) throw new Error("YIR returned an unsafe URL.");
  return url.href;
}
function fileId(value: unknown): string {
  if (typeof value !== "string" || !fileIdPattern.test(value)) throw new Error("YIR did not return a valid file ID.");
  return value;
}
function key(): string {
  const token = process.env.YIR_API_KEY?.trim();
  if (!token) throw new Error("YIR_API_KEY is not configured.");
  return token;
}
async function api(path: string, init: RequestInit, timeout = 30000): Promise<Record<string, unknown>> {
  const response = await fetch(`${base}${path}`, {
    ...init, headers: { Authorization: `Bearer ${key()}`, ...init.headers },
    cache: "no-store", signal: AbortSignal.timeout(timeout),
  });
  let payload: unknown;
  try { payload = await response.json(); } catch { throw new Error(`YIR returned HTTP ${response.status}.`); }
  if (!response.ok) {
    const error = object(payload).error;
    const detail = error && typeof error === "object" ? error as Record<string, unknown> : {};
    const code = typeof detail.code === "string" ? detail.code : `HTTP ${response.status}`;
    // Never reflect untrusted provider messages or input echoes to the browser.
    throw new Error(`YIR ${code}. ${response.status === 401 ? "Check YIR_API_KEY." : "Check model support, wallet balance and cost limit."}`);
  }
  return object(payload);
}
function json(body: unknown): RequestInit {
  return { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) };
}
export function makeYirRequest(ids: string[], resolution: Resolution, aspectRatio: AspectRatio = "9:16", scenario: PromptScenario = "gender_neutral") {
  if (ids.length !== 2 || (resolution !== "480p" && resolution !== "720p")) throw new Error("Two photos and a supported resolution are required.");
  if (aspectRatio !== "9:16" && aspectRatio !== "16:9") throw new Error("Unsupported aspect ratio.");
  return {
    model: process.env.YIR_MODEL_ID?.trim() || "bytedance/seedance-2.0",
    input: {
      type: "reference", prompt: buildVideoPrompt(scenario, aspectRatio, process.env.YIR_REFERENCE_SUBJECTS === "true"),
      references: ids.map((id, index) => ({ role: "reference_image", file_id: fileId(id), ...(process.env.YIR_REFERENCE_SUBJECTS === "true" ? { subject: `Image${index + 1}` } : {}) })),
    },
    parameters: { duration: 8, resolution, aspect_ratio: aspectRatio },
    routing: { preference: "cost", fallback: true },
  };
}
export function parseYirJobId(response: unknown): string {
  const id = object(response).id;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw new Error("YIR returned an invalid job ID.");
  return id;
}
export function parseYirJob(response: unknown) {
  const job = object(response);
  const status = job.status;
  if (status === "failed" || status === "cancelled") {
    const error = job.error && typeof job.error === "object" ? job.error as Record<string, unknown> : {};
    return { status: "failed", progress: 0, error: typeof error.code === "string" ? `YIR ${error.code}.` : "Generation failed or was cancelled." };
  }
  if (status === "succeeded") {
    const result = object(job.result);
    if (result.availability !== "available") throw new Error("YIR video result has expired.");
    const files = Array.isArray(result.files) ? result.files : [];
    const video = files.map(object).find(file => typeof file.media_type === "string" && file.media_type.startsWith("video/"));
    if (!video) throw new Error("YIR completed without a playable video.");
    return { status: "finished", progress: 100, videoUrl: secureUrl(video.url) };
  }
  if (!["queued", "running", "delivering"].includes(String(status))) throw new Error("Unknown YIR job status.");
  return { status: "running", progress: status === "queued" ? 2 : status === "delivering" ? 94 : 15 };
}

// YIR issues presigned multipart PUT URLs. Complete with {} and wait until status=ready.
export async function uploadYirPortrait(file: File): Promise<string> {
  const response = await api("/v1/files", json({ files: [{ name: file.name.slice(0, 255) || "portrait.jpg", media_type: file.type, size: file.size }] }));
  const info = object((response.files as unknown[])?.[0]);
  const id = fileId(info.id);
  const upload = object(info.upload);
  if (upload.type !== "multipart" || !Array.isArray(upload.parts) || upload.parts.length === 0) throw new Error("Unsupported YIR upload plan.");
  let offset = 0;
  for (const part of upload.parts) {
    const entry = object(part);
    const size = entry.size;
    if (typeof size !== "number" || !Number.isInteger(size) || size < 1 || offset + size > file.size) throw new Error("Invalid YIR upload part size.");
    const target = secureUrl(entry.url);
    const result = await fetch(target, { method: "PUT", body: file.slice(offset, offset + size), signal: AbortSignal.timeout(60000) });
    if (!result.ok) throw new Error(`YIR file upload returned HTTP ${result.status}.`);
    offset += size;
  }
  if (offset !== file.size) throw new Error("YIR upload plan does not match photo size.");
  let state = await api(`/v1/files/${id}/complete`, json({}));
  for (let n = 0; n < 12 && state.status === "processing"; n++) {
    await new Promise(resolve => setTimeout(resolve, 2500));
    state = await api(`/v1/files/${id}`, { method: "GET" });
  }
  if (state.status !== "ready") throw new Error("YIR did not finish processing the uploaded photo.");
  return id;
}
export async function submitYirVideo(ids: string[], resolution: Resolution, idempotencyKey: string, aspectRatio: AspectRatio = "9:16", scenario: PromptScenario = "gender_neutral"): Promise<string> {
  const maxCost = process.env.YIR_MAX_COST_USD?.trim();
  if (!maxCost || !/^(?:0|[1-9]\d{0,12})(?:\.\d{1,6})?$/.test(maxCost) || Number(maxCost) <= 0) throw new Error("YIR_MAX_COST_USD must be a positive USD amount before generation.");
  const input = makeYirRequest(ids, resolution, aspectRatio, scenario);
  const quote = await api("/v1/videos/quotes", json(input));
  if (object(quote.supply).available !== true) throw new Error("No YIR route supports these reference photos and video settings.");
  const notices = Array.isArray(quote.parameter_notices) ? quote.parameter_notices : [];
  if (notices.some(item => object(item).disposition === "ignored")) throw new Error("YIR cannot honor all requested video parameters.");
  const estimate = quote.expected_amount;
  if (typeof estimate !== "string" || !/^\d+(?:\.\d+)?$/.test(estimate) || Number(estimate) > Number(maxCost)) throw new Error("YIR quote is unavailable or exceeds YIR_MAX_COST_USD.");
  return parseYirJobId(await api("/v1/videos/generations", {
    ...json({ ...input, max_cost: maxCost }), headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
  }, 45000));
}
export async function getYirStatus(id: string) {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) throw new Error("Invalid YIR job ID.");
  return parseYirJob(await api(`/v1/jobs/${id}`, { method: "GET" }));
}
