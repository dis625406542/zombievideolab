// Public-safe allowlist: never accept prompts, product IDs or redirect paths from a client.
export const DEFAULT_TEMPLATE = "zombie-couple";
export const VIDEO_TEMPLATES = {
  "zombie-couple": {
    id: "zombie-couple", productId: "zombie-couple", path: "/", promptVersion: "zombie-v1", durationSeconds: 8,
    title: "Zombie couple video generator", overline: "THE STORY BEGINS HERE",
    heading: "Make your moment", emphasis: "unforgettable.",
    intro: "Two adult portraits. One fictional zombie love video. No account needed.",
    roles: ["The infected", "The rescuer"],
    instructions: "Photo 1: infected person. Photo 2: rescuer. Upload in that order; we automatically adapt the story to your photos.",
    purchase: "One 8-second zombie love story using your two approved portraits.",
    previewHeading: "THE NIGHTFALL STORY", previewTitle: "Preview your zombie love story",
    hasDemo: true,
  },
  "tiptoeing-in-my-jordans": {
    id: "tiptoeing-in-my-jordans", productId: "tiptoeing-in-my-jordans", path: "/video/tiptoeing-in-my-jordans", promptVersion: "tiptoeing-v3", durationSeconds: 15,
    title: "Tiptoeing In My Jordans AI video generator", overline: "TWO PHOTOS. ONE PLAYFUL MOMENT.",
    heading: "Bring your photos", emphasis: "into motion.",
    intro: "Create a 15-second Tiptoeing In My Jordans video from two adult portraits. Pay once. No account needed.",
    roles: ["The dancer", "Seated observer"],
    instructions: "Photo 1: dancer. Photo 2: seated observer. Roles follow upload order, not gender. Use clear photos with one person in each.",
    purchase: "One 15-second, reference-guided tiptoeing video using your two approved portraits.",
    previewHeading: "YOUR TIPTOE MOMENT", previewTitle: "Watch the reference or a real result",
    hasDemo: false,
  },
} as const;
export type TemplateId = keyof typeof VIDEO_TEMPLATES;
export function parseTemplate(value: unknown): TemplateId | null {
  if (value === null || value === undefined) return DEFAULT_TEMPLATE;
  return typeof value === "string" && Object.hasOwn(VIDEO_TEMPLATES, value) ? value as TemplateId : null;
}
export function videoTemplate(id: TemplateId = DEFAULT_TEMPLATE) { return VIDEO_TEMPLATES[id]; }
export type PromptContext = { templateId: TemplateId; promptVersion: string };

// Resolve immutable order snapshots, not the latest template, when retrying a paid video.
export function videoSpec(context?: PromptContext) {
  const template = videoTemplate(context?.templateId ?? DEFAULT_TEMPLATE);
  const version = context?.promptVersion ?? template.promptVersion;
  if (template.id === "zombie-couple" && version === "zombie-v1") return { durationSeconds: 8, referenceVideo: false, generateAudio: false } as const;
  if (template.id === "tiptoeing-in-my-jordans" && version === "tiptoeing-v1") return { durationSeconds: 8, referenceVideo: false, generateAudio: false } as const;
  if (template.id === "tiptoeing-in-my-jordans" && version === "tiptoeing-v2") return { durationSeconds: 15, referenceVideo: true, generateAudio: false } as const;
  if (template.id === "tiptoeing-in-my-jordans" && version === "tiptoeing-v3") return { durationSeconds: 15, referenceVideo: true, generateAudio: true } as const;
  throw new Error("This purchase uses an unavailable prompt version. Contact support; do not pay again.");
}
