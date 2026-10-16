import "server-only";
import { getVideoStatus as poyoStatus, submitVideo as poyoSubmit, uploadPortrait as poyoUpload, type Resolution, type AspectRatio } from "./poyo";
import { getYirStatus, submitYirVideo, uploadYirPortrait } from "./yir";

export type ProviderName = "poyo" | "yir";
export function selectedProvider(): ProviderName {
  const name = process.env.VIDEO_PROVIDER?.trim().toLowerCase() || "poyo";
  if (name !== "poyo" && name !== "yir") throw new Error("VIDEO_PROVIDER must be poyo or yir.");
  return name;
}
export function configured(provider: ProviderName) {
  const cap = process.env.YIR_MAX_COST_USD?.trim();
  return provider === "poyo"
    ? !!(process.env.poyo_seedance_token || process.env.POYO_API_KEY)
    : !!(process.env.YIR_API_KEY && cap && /^(?:0|[1-9]\d{0,12})(?:\.\d{1,6})?$/.test(cap) && Number(cap) > 0 && process.env.VIDEO_HANDLE_SECRET?.length && process.env.VIDEO_HANDLE_SECRET.length >= 32);
}
export async function submitForProvider(provider: ProviderName, files: File[], resolution: Resolution, code: string, aspectRatio: AspectRatio = "9:16"): Promise<string> {
  const upload = provider === "poyo" ? poyoUpload : uploadYirPortrait;
  const urls = [];
  for (const file of files) urls.push(await upload(file));
  return provider === "poyo" ? poyoSubmit(urls, resolution, aspectRatio) : submitYirVideo(urls, resolution, `zvl-${code}`, aspectRatio);
}
export async function statusForProvider(provider: ProviderName, id: string) {
  return provider === "poyo" ? poyoStatus(id) : getYirStatus(id);
}
export type { Resolution, AspectRatio };
