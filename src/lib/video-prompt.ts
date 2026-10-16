import { readFileSync } from "node:fs";
import { join } from "node:path";

export type PortraitAppearance = "female" | "male" | "unknown";
export type PromptScenario = "female_infected" | "male_infected" | "gender_neutral";

// Appearance is only a visual storytelling hint, not a claim about gender identity.
// Never swap references to force a pair into one of the two gendered templates.
export function selectPromptScenario(portraits: readonly { appearance: PortraitAppearance }[]): PromptScenario {
  if (portraits.length !== 2) throw new Error("Two portrait assessments are required.");
  const [infected, rescuer] = portraits;
  if (infected.appearance === "female" && rescuer.appearance === "male") return "female_infected";
  if (infected.appearance === "male" && rescuer.appearance === "female") return "male_infected";
  return "gender_neutral";
}

function englishTemplate(section: "1" | "2"): string {
  const source = readFileSync(join(process.cwd(), "public", "Prompt"), "utf8");
  const headers = [...source.matchAll(/^english([12]):[ \t]*\r?$/gim)];
  const index = headers.findIndex(header => header[1] === section);
  if (index < 0) throw new Error(`English${section} video prompt is missing from public/Prompt.`);
  const header = headers[index];
  const text = source.slice(header.index! + header[0].length, headers[index + 1]?.index ?? source.length).trim();
  if (!text) throw new Error(`English${section} video prompt is empty in public/Prompt.`);
  return text;
}

// When appearance is unclear or the photos do not match either pair, use explicit
// upload roles rather than guessing, swapping people, or blocking a safe portrait.
const neutralTemplate = `Create an 8-second, vertical 9:16, photorealistic live-action cinematic short film about love saving an infected partner.
Reference Image 1 is the infected partner. Reference Image 2 is the healthy rescuer.
SHOT 1 (0-2 seconds): On a smoky post-apocalyptic street, the infected partner from Image 1 emerges with subtle gray pallor and a stiff posture. Retain the exact original face, hair and clothing.
SHOT 2 (2-3.5 seconds): The rescuer from Image 2 recognizes the infected partner, cries and drops a flashlight naturally to the ground. Show the rescuer's emotional face clearly.
SHOT 3 (3.5-5.5 seconds): The rescuer actively approaches and initiates a gentle, mutual embrace. No attack or knockdown. The infected partner relaxes and returns the embrace; gray pallor fades into healthy skin while facial identity remains unchanged.
SHOT 4 (5.5-8 seconds): Match cut from the same embrace to a warm golden field. Tight close-up of both recognizable faces, shoulders and upper bodies. Both partners smile through tears and gently touch foreheads. Keep the same original outfits and accessories.
Use realistic skin texture, natural tears, anatomically correct hands, smooth camera movement, cold blue-gray opening light and warm golden ending light. No extra people, no identity or role swaps, no outfit replacements, no deformed anatomy, no obscured faces, no distant ending, no subtitles, logos or watermarks.`;

export function buildVideoPrompt(scenario: PromptScenario, aspectRatio: "9:16" | "16:9", taggedReferences = false): string {
  if (!["female_infected", "male_infected", "gender_neutral"].includes(scenario)) throw new Error("Unsupported prompt scenario.");
  if (aspectRatio !== "9:16" && aspectRatio !== "16:9") throw new Error("Unsupported aspect ratio.");
  const template = scenario === "gender_neutral" ? neutralTemplate : englishTemplate(scenario === "female_infected" ? "1" : "2");
  // The source templates are portrait. Replace, rather than contradict, their framing.
  const story = template.replace(/vertical\s+9:16/gi, aspectRatio === "16:9" ? "horizontal 16:9" : "vertical 9:16");
  const first = taggedReferences ? "@Image1" : "Image 1";
  const second = taggedReferences ? "@Image2" : "Image 2";
  return `REFERENCE AND ROLE LOCK: The first reference image (${first}) is the infected person. The second reference image (${second}) is the healthy rescuer. Never swap their reference order, identities, infection status or story roles.
IDENTITY AND WARDROBE LOCK: Preserve each person's distinct facial identity, facial features, hairstyle, hair color, body proportions, original clothing, garment colors and patterns, jewelry and visible accessories from their own uploaded photo in every shot, including the final scene. Only infection makeup, expression and movement may change. Do not invent replacement outfits or transfer features between people.
SAFETY: Consenting adults only. Fictional, non-graphic, non-sexual romance. No nudity, sexual content, gore, graphic injuries, attacks, hateful content or self-harm.
OUTPUT: Exactly 8 seconds, ${aspectRatio === "16:9" ? "horizontal 16:9" : "vertical 9:16"}. Keep both faces clearly visible in the final close-up.

${story}`;
}
