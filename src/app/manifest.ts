import { SPLASH_BACKGROUND } from "@/lib/pwa/apple-startup-images";
import { SITE_LOCALE } from "@/lib/seo/site";
import type { MetadataRoute } from "next";

// Not in the standard manifest type yet. Chromium uses it to pick splash and
// title bar colors for the OS color scheme; other browsers ignore it.
type ManifestWithUserPreferences = MetadataRoute.Manifest & {
  user_preferences: {
    color_scheme: Record<
      "light" | "dark",
      { background_color: string; theme_color: string }
    >;
  };
};

export default function manifest(): ManifestWithUserPreferences {
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
    background_color: SPLASH_BACKGROUND.dark,
    theme_color: SPLASH_BACKGROUND.dark,
    user_preferences: {
      color_scheme: {
        light: {
          background_color: SPLASH_BACKGROUND.light,
          theme_color: SPLASH_BACKGROUND.light,
        },
        dark: {
          background_color: SPLASH_BACKGROUND.dark,
          theme_color: SPLASH_BACKGROUND.dark,
        },
      },
    },
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
