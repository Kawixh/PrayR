import { getSiteBaseUrl } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

const siteUrl = getSiteBaseUrl();
const siteHost = new URL(siteUrl).host;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "anthropic-ai",
        ],
        allow: "/",
        disallow: ["/api/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteHost,
  };
}
