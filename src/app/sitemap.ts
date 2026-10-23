import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { BLOG_POSTS } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  // Content was actually updated on this date; do not emit a moving timestamp for unchanged pages.
  const lastModified = new Date("2026-10-16T00:00:00.000Z");
  return [
    { url: SITE_URL, lastModified: new Date("2026-10-23T00:00:00.000Z"), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/video/tiptoeing-in-my-jordans`, lastModified: new Date("2026-10-23T00:00:00.000Z"), changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date("2026-10-23T00:00:00.000Z"), changeFrequency: "weekly", priority: 0.6 },
    ...BLOG_POSTS.map(post => ({ url: `${SITE_URL}/blog/${post.slug}`, lastModified: new Date(post.modifiedAt), changeFrequency: "monthly" as const, priority: 0.6 })),
    ...["/about", "/privacy", "/terms", "/acceptable-use", "/security", "/refund-policy", "/contact"].map((path) => ({
      url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly" as const, priority: 0.3,
    })),
  ];
}
