import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { tinyGuides } from "@/lib/tiny-guides";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date("2026-10-29T00:00:00.000Z"), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/blog`, lastModified: new Date("2026-10-29T00:00:00.000Z"), changeFrequency: "weekly", priority: 0.7 },
    ...tinyGuides.map(({ slug }) => ({ url: `${SITE_URL}/blog/${slug}`, lastModified: new Date("2026-10-29T00:00:00.000Z"), changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
