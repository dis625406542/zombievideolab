import "server-only";
import sharp from "sharp";
import type { PortraitAppearance } from "./video-prompt";

const categories = new Set(["none", "minor", "nudity", "sexual_content", "graphic_violence", "self_harm", "hate", "impersonation", "unclear_person", "uncertain_age", "other"]);
type Verdict = { decision: "allow" | "block" | "uncertain"; category: string; appearance: PortraitAppearance };
const labels: Record<string, string> = {
  minor: "a clearly underage person",
  nudity: "nudity",
  sexual_content: "sexual or intimate content",
  graphic_violence: "graphic violence",
  self_harm: "self-harm content",
  hate: "hateful or abusive content",
  impersonation: "deceptive impersonation",
  unclear_person: "no clear portrait",
  uncertain_age: "an age that cannot be confidently assessed as adult",
  other: "content outside our safety rules",
};

export class ImageModerationError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

const instructions = `You are an image safety gate for a fictional NON-GRAPHIC, NON-SEXUAL zombie romance video service. Inspect EACH attached photo independently. The uploader separately confirms that all depicted people are consenting adults; an image cannot prove exact age or consent.

ASSESS AGE SEPARATELY FROM CONTENT SAFETY:
- Use age_assessment=clear_minor and decision=block/category=minor only when visible evidence makes you highly confident that a depicted person is a child or adolescent under 18. Do not guess an exact age.
- Do not reject an otherwise adult-looking portrait merely because the person looks young, has smooth skin, no wrinkles, makeup, soft features or a youthful style. Do not demand proof that someone is over 18.
- When age cannot be established, use age_assessment=uncertain. Age uncertainty alone must not block an otherwise safe, clear portrait. If age is the ONLY unresolved issue and content_safety=clear, return decision=uncertain/category=uncertain_age. The server handles this separately from unsafe content.
- Use age_assessment=adult_appearing for an adult-looking person. This is not verified age.

STRICT CONTENT SAFETY (independent of age):
- Block nudity, pornography, sexual content, non-consensual intimate imagery, graphic violence, blood or gore, self-harm, hateful abuse, or deceptive impersonation of a public figure. Normal non-graphic fantasy makeup is allowed.
- content_safety=clear means you can see a clear portrait and have checked ALL non-age safety categories with no concerns. Use blocked for prohibited content and uncertain if non-age safety cannot be assessed.
- If ANY non-age safety concern exists, use its category with decision=block or uncertain. NEVER hide a nudity, sexual, violence or other safety concern under uncertain_age. An unclear, obscured or unreadable face must use uncertain/unclear_person, not uncertain_age. An API refusal is not approval.

Return only one JSON object: {"images":[{"decision":"allow|block|uncertain","category":"none|minor|nudity|sexual_content|graphic_violence|self_harm|hate|impersonation|unclear_person|uncertain_age|other","age_assessment":"clear_minor|adult_appearing|uncertain","content_safety":"clear|blocked|uncertain","appearance":"female|male|unknown"}]}.
Return exactly one result per attached photo in order. Use allow/none for safe adult-looking portraits. In the SAME response return appearance for the primary person based only on visible presentation for fictional storytelling, not actual gender identity. Use unknown when ambiguous; appearance uncertainty alone is not a safety failure.`;

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
  return (verdicts as (Verdict & { age_assessment?: unknown; content_safety?: unknown })[]).map(verdict => {
    if (verdict.age_assessment !== undefined && !["clear_minor", "adult_appearing", "uncertain"].includes(String(verdict.age_assessment))) throw new Error("Invalid age assessment");
    if (verdict.content_safety !== undefined && !["clear", "blocked", "uncertain"].includes(String(verdict.content_safety))) throw new Error("Invalid content safety assessment");
    if (verdict.decision === "allow" && verdict.content_safety !== undefined && verdict.content_safety !== "clear") throw new Error("Contradictory content safety assessment");
    const appearance: PortraitAppearance = ["female", "male"].includes(verdict.appearance) ? verdict.appearance : "unknown";
    // A definite minor must never pass, even if the model's top-level decision conflicts.
    if (verdict.age_assessment === "clear_minor") return { decision: "block", category: "minor", appearance };
    // Only a complete, explicitly age-only uncertainty may pass. Never ignore a refusal,
    // unreadable portrait, missing safety result, or uncertain nudity/violence assessment.
    if (verdict.decision !== "allow" && verdict.category === "uncertain_age" && verdict.age_assessment === "uncertain" && verdict.content_safety === "clear") {
      return { decision: "allow", category: "none", appearance };
    }
    return { decision: verdict.decision, category: verdict.category, appearance };
  });
}

export async function moderatePortraits(files: File[]): Promise<Verdict[]> {
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
      body: JSON.stringify({ model, max_tokens: 450, temperature: 0, thinking: { type: "disabled" }, system: instructions,
        messages: [{ role: "user", content: [
          { type: "text", text: "First attached portrait:" },
          { type: "image", source: { type: "base64", media_type: "image/jpeg", data: images[0].toString("base64") } },
          ...(images.length === 2 ? [
            { type: "text", text: "Second attached portrait:" },
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
      throw new ImageModerationError(`Photo ${number} did not pass the AI safety check (${reason}). Please choose a different photo that meets our safety rules before retrying. No video request was sent.`, 422);
    }
    return verdicts;
  } catch (error) {
    if (error instanceof ImageModerationError) throw error;
    // Provider refusal, malformed output, unsupported vision, or timeout must NOT authorize generation.
    console.error("Image moderation unavailable", error instanceof Error ? error.message : "unknown error");
    throw new ImageModerationError("We could not complete the AI safety check. Please try again later; no video request was sent.", 503);
  }
}
