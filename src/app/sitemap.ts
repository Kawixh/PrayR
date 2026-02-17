import { resolveFeatureFlags } from "@/features/resolve";
import { getCanonicalUrl, getLanguageAlternates } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const featureFlags = resolveFeatureFlags();

  const entries: MetadataRoute.Sitemap = [
    {
      url: getCanonicalUrl("/"),
      lastModified,
      changeFrequency: "hourly",
      priority: 1,
      alternates: {
        languages: getLanguageAlternates("/"),
      },
    },
    {
      url: getCanonicalUrl("/resources"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: {
        languages: getLanguageAlternates("/resources"),
      },
    },
  ];

  if (featureFlags.adhkars) {
    entries.push({
      url: getCanonicalUrl("/adhkars"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
      alternates: {
        languages: getLanguageAlternates("/adhkars"),
      },
    });
  }

  return entries;
}
