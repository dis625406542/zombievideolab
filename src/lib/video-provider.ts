import "server-only";
import { getVideoStatus as poyoStatus, submitVideo as poyoSubmit, uploadPortrait as poyoUpload, type Resolution, type AspectRatio } from "./poyo";
import { getYirStatus, submitYirVideo, uploadYirPortrait } from "./yir";

import type { PromptScenario } from "./video-prompt";

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { requiredPhotoCount, DEFAULT_TEMPLATE, videoSpec, type PromptContext } from "./video-templates";

export type ProviderName = "poyo" | "yir";
export function selectedProvider(): ProviderName {
  const name = process.env.VIDEO_PROVIDER?.trim().toLowerCase() || "poyo";
  if (name !== "poyo" && name !== "yir") throw new Error("VIDEO_PROVIDER must be poyo or yir.");
  return name;
}
export function configured(provider: ProviderName) {
  return provider === "poyo"
    ? !!(process.env.poyo_seedance_token || process.env.POYO_API_KEY)
    : !!(process.env.YIR_API_KEY && process.env.VIDEO_HANDLE_SECRET?.length && process.env.VIDEO_HANDLE_SECRET.length >= 32);
}
export async function submitForProvider(provider: ProviderName, files: File[], resolution: Resolution, code: string, aspectRatio: AspectRatio = "9:16", scenario: PromptScenario = "gender_neutral", context?: PromptContext, beforeSubmit?: () => Promise<void>): Promise<string> {
  const spec = videoSpec(context);
  if (files.length !== requiredPhotoCount(context?.templateId ?? DEFAULT_TEMPLATE, context?.sceneId)) throw new Error("Upload the required portraits for this scene.");
  const upload = provider === "poyo" ? poyoUpload : uploadYirPortrait;
  const urls = [];
  for (const file of files) urls.push(await upload(file));
  let referenceVideo: string | undefined;
  if (spec.referenceVideo) {
    // Server-owned asset only: never fetch a reference URL supplied by a browser.
    const bytes = await readFile(join(process.cwd(), "public", "tiptoeing-reference.mp4"));
    referenceVideo = await upload(new File([new Uint8Array(bytes)], "tiptoeing-reference.mp4", { type: "video/mp4" }));
  }
  const options = { referenceVideo, beforeSubmit };
  return provider === "poyo" ? poyoSubmit(urls, resolution, aspectRatio, scenario, context, options) : submitYirVideo(urls, resolution, `zvl-${code}`, aspectRatio, scenario, context, options);
}
export async function statusForProvider(provider: ProviderName, id: string) {
  return provider === "poyo" ? poyoStatus(id) : getYirStatus(id);
}
export type { Resolution, AspectRatio };
