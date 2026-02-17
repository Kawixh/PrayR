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
    background_color: "#0f2026",
    theme_color: "#6db7ba",
    icons: [
      { src: "/favicon.ico", type: "image/x-icon", sizes: "16x16 32x32" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
      {
        src: "/icon-192-maskable.png",
        type: "image/png",
        sizes: "192x192",
        purpose: "maskable",
      },
      {
        src: "/icon-512-maskable.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "maskable",
      },
    ],
  };
}
