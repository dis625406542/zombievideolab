export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  modifiedAt: string;
  readingMinutes: number;
  image: string;
  category: string;
};

export const MEME_GUIDE: BlogPost = {
  slug: "what-ai-tool-can-make-tiptoeing-in-my-jordans-videos",
  title: "What AI tool can I use to make videos like the Tiptoeing in My Jordans meme?",
  description: "A practical guide to making a 15-second Tiptoeing In My Jordans video: choose the dancer and observer, compare formats, pay once and download your MP4.",
  publishedAt: "2026-10-23T12:00:00+08:00",
  modifiedAt: "2026-10-23T12:00:00+08:00",
  readingMinutes: 6,
  image: "/tiptoeing-social.png",
  category: "Meme video guide",
};

export const RECREATE_GUIDE: BlogPost = {
  slug: "how-to-recreate-tiptoeing-in-my-jordans-ai-video",
  title: "How do I recreate the viral Tiptoeing in My Jordans AI video with the same creepy, retro fantasy vibe and funny dance moves?",
  description: "Recreate the creepy-funny dance with one or two photos, a ready-made reference and no login. A practical guide to the retro fantasy look, dancer roles, music and one-time pricing.",
  publishedAt: "2026-10-23T16:00:00+08:00",
  modifiedAt: "2026-10-23T16:00:00+08:00",
  readingMinutes: 7,
  image: "/tiptoeing-social.png",
  category: "Recreation tutorial",
};

export const BLOG_POSTS: BlogPost[] = [RECREATE_GUIDE, MEME_GUIDE];
export const RECREATE_GUIDE_PATH = `/blog/${RECREATE_GUIDE.slug}`;

export function formatBlogDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short", day: "numeric", year: "numeric", timeZone: "Asia/Shanghai",
  }).format(new Date(date));
}
export const MEME_GUIDE_PATH = `/blog/${MEME_GUIDE.slug}`;
export const TIPTOEING_PATH = "/video/tiptoeing-in-my-jordans";
