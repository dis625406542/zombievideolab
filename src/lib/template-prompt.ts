import { TIPTOEING_STORYBOARD_V2, TIPTOEING_STORYBOARD_V3, TIPTOEING_STORYBOARD_V4 } from "./tiptoeing-storyboard";
import { buildVideoPrompt, type PromptScenario } from "./video-prompt";
import { DEFAULT_TEMPLATE, videoSpec, videoTemplate, type PromptContext } from "./video-templates";

// Keep old prompt versions executable for paid-order retries. Do not silently upgrade snapshots.
export function templatePrompt(scenario: PromptScenario, aspectRatio: "9:16" | "16:9", tagged = false, context?: PromptContext): string {
  const template = videoTemplate(context?.templateId ?? DEFAULT_TEMPLATE);
  const version = context?.promptVersion ?? template.promptVersion;
  videoSpec(context);
  if (template.id === DEFAULT_TEMPLATE) return buildVideoPrompt(scenario, aspectRatio, tagged);
  const first = tagged ? "@Image1" : "Image 1";
  const second = tagged ? "@Image2" : "Image 2";
  if (version === "tiptoeing-v2" || version === "tiptoeing-v3" || version === "tiptoeing-v4") {
    const video = tagged ? "@Video1" : "the attached reference video";
    const withAudio = version !== "tiptoeing-v2";
    const versionedStoryboard = version === "tiptoeing-v4" ? TIPTOEING_STORYBOARD_V4 : version === "tiptoeing-v3" ? TIPTOEING_STORYBOARD_V3 : TIPTOEING_STORYBOARD_V2;
    const storyboard = versionedStoryboard.replaceAll("Image 1", first).replaceAll("Image 2", second);
    return `${storyboard}

ATTACHED REFERENCES: ${first} is the dancer; ${second} is the seated observer; ${video} guides movement and shot timing, NOT the identity or clothing of either uploaded person. Never copy the reference video's actors' faces or outfits.
OUTPUT: exactly 15 seconds, ${aspectRatio === "16:9" ? "16:9 landscape" : "9:16 portrait"}. Adapt framing to this aspect ratio while keeping both feet visible during the full-body dance shots. Keep the observer seated beside the dancer and show the dedicated footwork close-up.
SAFETY: exactly two consenting, fully clothed adults. Nonsexual, nonviolent entertainment only. No minors, nudity, sexualized poses, gore, injury, threats, dangerous stunts or hateful content. Do not add brand logos, text or watermarks. ${withAudio ? "Include model-generated instrumental music guided by the reference audio; never copy the original recording, melody, lyrics or vocals." : "Silent video; no soundtrack."}
Generation fidelity is guided by the attached references; prioritize the ordered storyboard and identity consistency.`;
  }
  return `Create one coherent 8-second, photorealistic, playful dance-interaction video inspired by the Tiptoeing In My Jordans trend, with exactly two consenting adult characters.
REFERENCE IDENTITY LOCK: ${first} is the tiptoeing performer throughout. ${second} is the reaction character throughout. Never swap their roles based on gender. Preserve each person's own facial identity, hairstyle, skin tone, body proportions and original clothing from their respective uploaded photo. Do not invent branded shoes, add brand logos or change their outfits. No face swapping, duplicate people, extra characters or text overlays.
0-2 seconds: establish both characters in the same softly lit, uncluttered setting, feet visible. The performer begins small, rhythmic steps on the balls of their feet; the reaction character notices.
2-5 seconds: the performer continues a light, controlled tiptoe shuffle with alternating short steps, relaxed knees and natural arm movement. The reaction character turns toward them with a friendly surprised smile. Keep both identities stable and the footwork readable.
5-8 seconds: the performer takes a few final playful steps toward the reaction character, who responds with an amused nod. End on a shared friendly smile, with a stable, natural pose. Keep camera motion smooth and avoid abrupt cuts or impossible movement.
FRAME: ${aspectRatio === "16:9" ? "16:9 landscape, compose both people side by side with enough floor space" : "9:16 portrait, vertically compose both people with enough floor space"}. Show the performer's head and feet in the dancing shots. Natural anatomy, consistent hands and legs, realistic shadows, fluid temporal continuity.
SAFETY: fully clothed adults, nonsexual, nonviolent entertainment only. No minors, nudity, sexualized poses, gore, injury, threats, harassment, dangerous stunts or hateful content. No zombies, infection, rescue scene, flashlight or horror imagery. Do not reproduce a copyrighted music track, lyrics or an exact choreography. No requested soundtrack; visual storytelling only.`;
}
