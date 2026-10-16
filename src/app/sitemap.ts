import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    ...["/about", "/privacy", "/terms", "/security", "/refund-policy", "/contact"].map((path) => ({
      url: `${SITE_URL}${path}`, changeFrequency: "monthly" as const, priority: 0.3,
    })),
  ];
}
