import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Content was actually updated on this date; do not emit a moving timestamp for unchanged pages.
  const lastModified = new Date("2026-10-16T00:00:00.000Z");
  return [
    { url: SITE_URL, lastModified, changeFrequency: "weekly", priority: 1 },
    ...["/about", "/privacy", "/terms", "/acceptable-use", "/security", "/refund-policy", "/contact"].map((path) => ({
      url: `${SITE_URL}${path}`, lastModified, changeFrequency: "monthly" as const, priority: 0.3,
    })),
  ];
}
