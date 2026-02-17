import { resolveFeatureFlags } from "@/features/resolve";
import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

const siteUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const featureFlags = resolveFeatureFlags();

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  if (featureFlags.adhkars) {
    entries.push({
      url: `${siteUrl}/adhkars`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  return entries;
}
