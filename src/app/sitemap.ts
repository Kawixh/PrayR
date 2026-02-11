import { getSiteUrl } from "@/lib/site-url";
import type { MetadataRoute } from "next";

const siteUrl = getSiteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/`,
      lastModified,
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: `${siteUrl}/adhkars`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}
