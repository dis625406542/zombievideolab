import "server-only";
import sharp from "sharp";

const categories = new Set(["none", "minor", "nudity", "sexual_content", "graphic_violence", "self_harm", "hate", "impersonation", "unclear_person", "uncertain_age", "other"]);
type Verdict = { decision: "allow" | "block" | "uncertain"; category: string };
const labels: Record<string, string> = {
  minor: "a minor or someone who may be under 18",
  nudity: "nudity",
  sexual_content: "sexual or intimate content",
  graphic_violence: "graphic violence",
  self_harm: "self-harm content",
  hate: "hateful or abusive content",
  impersonation: "deceptive impersonation",
  unclear_person: "no clear adult portrait",
  uncertain_age: "an age that cannot be confidently assessed as adult",
  other: "content outside our safety rules",
};

export class ImageModerationError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

const instructions = `You are a strict image safety gate for a fictional NON-GRAPHIC, NON-SEXUAL zombie romance video service. Inspect EACH attached image independently; do not judge from text alone. Each image must clearly show an adult (18+) and must not depict or suggest a minor, nudity, sexual content, non-consensual intimate imagery, graphic violence or gore, self-harm, hateful abuse, or deceptive impersonation of a public figure. Normal non-graphic fantasy makeup is allowed. If the image is ambiguous, face is unclear, or age seems possibly under 18, choose uncertain, not allow. Never infer consent from an image; the uploader separately attests to permission. Respond with a single JSON object, nothing else: {"images":[{"decision":"allow|block|uncertain","category":"none|minor|nudity|sexual_content|graphic_violence|self_harm|hate|impersonation|unclear_person|uncertain_age|other"}]}. Return exactly one result per attached image, in order. If you cannot see a photo, mark uncertain/unclear_person. Allow only clear, unambiguously adult, otherwise safe portraits.`;

function parseVerdicts(payload: unknown, count: number): Verdict[] {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) throw new Error("Invalid moderation response");
  const response = payload as { content?: unknown; stop_reason?: unknown };
  if (response.stop_reason !== "end_turn" || !Array.isArray(response.content)) throw new Error("Incomplete moderation response");
  const text = response.content.filter((part): part is { type: "text"; text: string } => !!part && typeof part === "object" && (part as { type?: unknown }).type === "text" && typeof (part as { text?: unknown }).text === "string").map(part => part.text).join("\n").trim();
  let parsed: unknown;
  try { parsed = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "")); } catch { throw new Error("Invalid moderation response"); }
  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as { images?: unknown }).images)) throw new Error("Invalid moderation response");
  const verdicts = (parsed as { images: unknown[] }).images;
  if (verdicts.length !== count || !verdicts.every(v => !!v && typeof v === "object" && !Array.isArray(v) && ["allow", "block", "uncertain"].includes((v as Verdict).decision) && categories.has((v as Verdict).category) && ((v as Verdict).decision !== "allow" || (v as Verdict).category === "none"))) throw new Error("Invalid moderation response");
  return verdicts as Verdict[];
}

export async function moderatePortraits(files: File[]): Promise<void> {
  const key = process.env.ANTHROPIC_AUTH_TOKEN?.trim();
  const base = process.env.ANTHROPIC_BASE_URL?.trim();
  const model = process.env.ANTHROPIC_MODEL?.trim();
  if (!key || !base || !model) throw new ImageModerationError("Image safety check is not configured. No video provider request was sent.", 503);
  let endpoint: URL;
  try { endpoint = new URL(`${base.replace(/\/+$/, "")}/v1/messages`); } catch { throw new ImageModerationError("Image safety check is unavailable. No video provider request was sent.", 503); }
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) throw new ImageModerationError("Image safety check is unavailable. No video provider request was sent.", 503);
  if (files.length < 1 || files.length > 2) throw new ImageModerationError("Please select one or two photos.", 400);

  // Normalize and downsize before sending to vision: do not leak EXIF or submit 20 MB of base64.
  let images: Buffer[];
  try {
    images = await Promise.all(files.map(async file => {
      const source = Buffer.from(await file.arrayBuffer());
      const image = sharp(source, { limitInputPixels: 25_000_000, failOn: "error" });
      const info = await image.metadata();
      if (!info.width || !info.height || (info.pages && info.pages > 1)) throw new Error("Invalid image");
      return image.rotate().resize(1024, 1024, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    }));
  } catch { throw new ImageModerationError("The photo could not be checked. Use a valid JPG, PNG or WebP portrait.", 400); }
  try {
    const response = await fetch(endpoint, {
      method: "POST", cache: "no-store", signal: AbortSignal.timeout(18000),
      headers: { "Content-Type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model, max_tokens: 350, temperature: 0, thinking: { type: "disabled" }, system: instructions,
        messages: [{ role: "user", content: [
          { type: "text", text: "Image 1 (zombie role):" },
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: images[0].toString("base64") } },
          ...(images.length === 2 ? [
            { type: "text", text: "Image 2 (survivor role):" },
            { type: "image", source: { type: "base64", media_type: "image/jpeg", data: images[1].toString("base64") } },
          ] : []),
          { type: "text", text: "Check every actual image. Return the required JSON for each in order." },
        ] }],
      }),
    });
    if (!response.ok) throw new Error(`moderation API HTTP ${response.status}`);
    const verdicts = parseVerdicts(await response.json(), files.length);
    const failed = verdicts.find(v => v.decision !== "allow");
    if (failed) {
      const reason = labels[failed.category] || labels.other;
      const number = verdicts.indexOf(failed) + 1;
      throw new ImageModerationError(`Photo ${number} did not pass the AI safety check (${reason}). Please choose a different, clearly adult portrait before retrying. No video request was sent.`, 422);
    }
  } catch (error) {
    if (error instanceof ImageModerationError) throw error;
    // Provider refusal, malformed output, unsupported vision, or timeout must NOT authorize generation.
    console.error("Image moderation unavailable", error instanceof Error ? error.message : "unknown error");
    throw new ImageModerationError("We could not complete the AI safety check. Please try again later; no video request was sent.", 503);
  }
}
