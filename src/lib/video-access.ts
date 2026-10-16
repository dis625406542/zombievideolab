import "server-only";
import { storageConfigured } from "./r2";
import { createHmac, timingSafeEqual } from "node:crypto";
import { configured, selectedProvider, type ProviderName } from "./video-provider";

export type Job = { provider: ProviderName; taskId: string };
const testJobs = new Map<string, { job: Job; expiresAt: number }>();
const attemptedCodes = new Set<string>();
let used = 0;
let since = Date.now();

export function enabled() {
  if (process.env.VIDEO_GENERATION_ENABLED !== "true") return false;
  try { return !!(process.env.ANTHROPIC_AUTH_TOKEN && process.env.ANTHROPIC_BASE_URL && process.env.ANTHROPIC_MODEL) && configured(selectedProvider()) && storageConfigured() && !!(process.env.DATABASE_PRO_URL || process.env.DIRECT_PRO_URL) && (process.env.VIDEO_HANDLE_SECRET?.length ?? 0) >= 32; } catch { return false; }
}
export function saveTestJob(code: string, job: Job) {
  testJobs.set(code, { job, expiresAt: Date.now() + 12 * 3600000 });
}
export function findTestJob(code: string): Job | null {
  if (!/^[A-F0-9]{32}$/.test(code)) return null;
  const item = testJobs.get(code);
  if (!item) return null;
  if (item.expiresAt < Date.now()) { testJobs.delete(code); return null; }
  return item.job;
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try { const url = new URL(origin); return url.host === request.headers.get("host") && (url.protocol === "http:" || url.protocol === "https:"); } catch { return false; }
}
export function reserve(code: string) {
  if (attemptedCodes.has(code)) return false;
  if (Date.now() - since > 86400000) { used = 0; since = Date.now(); }
  if (used >= 2) return false;
  used += 1; // Conservative: failed uploads still consume a slot.
  attemptedCodes.add(code); // Do not resubmit a potentially accepted paid job with a new request.

  return true;
}
function sign(secret: string, message: string) {
  return createHmac("sha256", secret).update(message).digest("hex");
}
function secret(): string {
  const value = process.env.VIDEO_HANDLE_SECRET || process.env.poyo_seedance_token || process.env.POYO_API_KEY;
  if (!value) throw new Error("VIDEO_HANDLE_SECRET is required for YIR task handles.");
  return value;
}
export function issueHandle(job: Job) {
  const id = `zvl${job.provider}_${job.taskId}`;
  if (!/^zvl(?:poyo|yir)_[a-zA-Z0-9_-]{1,128}$/.test(id)) throw new Error("Invalid provider job ID.");
  const data = `${id}.${Date.now() + 12 * 3600000}`;
  return `${data}.${sign(secret(), data)}`;
}
export function verifyHandle(handle: string): Job | null {
  const match = /^([a-zA-Z0-9_-]{1,150})\.(\d{13})\.([0-9a-f]{64})$/.exec(handle);
  if (!match || Number(match[2]) < Date.now()) return null;
  const message = `${match[1]}.${match[2]}`;
  // Also accept the legacy PoYo-key signature until existing 12-hour handles expire.
  const secrets = [process.env.VIDEO_HANDLE_SECRET, process.env.poyo_seedance_token, process.env.POYO_API_KEY].filter((s): s is string => !!s);
  const actual = Buffer.from(match[3], "hex");
  if (!secrets.some(s => timingSafeEqual(Buffer.from(sign(s, message), "hex"), actual))) return null;
  const prefix = /^zvl(poyo|yir)_(.+)$/.exec(match[1]);
  return prefix ? { provider: prefix[1] as ProviderName, taskId: prefix[2] } : { provider: "poyo", taskId: match[1] };
}
export function safeError(error: unknown): string {
  if (error instanceof Error && /YIR|PoYo|provider|configured|resolution|photo|upload|cost|VIDEO_PROVIDER|route|file|result|budget|Unsupported/.test(error.message)) return error.message.slice(0, 180);
  return "The provider could not process this request. Please try again later.";
}
