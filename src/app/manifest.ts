import { SITE_LOCALE } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PrayR Prayer Times",
    short_name: "PrayR",
    description:
      "Accurate daily prayer times by city and country with configurable calculation methods.",
    id: "/",
    lang: SITE_LOCALE,
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#11131a",
    theme_color: "#5f72d8",
    icons: [
      { src: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32" },
      { src: "/android-chrome-192x192.png", type: "image/png", sizes: "192x192" },
      { src: "/android-chrome-512x512.png", type: "image/png", sizes: "512x512" },
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
