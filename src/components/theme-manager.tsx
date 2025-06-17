// components/theme-manager.tsx
"use client";

import { defaultTheme, themes } from "@/lib/themes";
import { useEffect } from "react";

export default function ThemeManager() {
  useEffect(() => {
    const applyTheme = () => {
      let selectedTheme = defaultTheme;
      try {
        const savedSettings = localStorage.getItem("prayerSettings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          const foundTheme = themes.find((t) => t.id === settings.theme);
          if (foundTheme) {
            selectedTheme = foundTheme;
          }
        }
      } catch (error) {
        console.error("Failed to parse prayer settings:", error);
        selectedTheme = defaultTheme;
      }

      document.body.style.backgroundImage = `url(${selectedTheme.image})`;
      // --- KEY CHANGE HERE ---
      // Make the background larger than the screen to allow for panning.
      document.body.style.backgroundSize = "150% auto";
      // The animation will override this, but it's a good default.
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.transition = "background-image 0.5s ease-in-out";
    };

    applyTheme();

    window.addEventListener("theme-changed", applyTheme);
    window.addEventListener("storage", applyTheme);

    return () => {
      window.removeEventListener("theme-changed", applyTheme);
      window.removeEventListener("storage", applyTheme);
    };
  }, []);

  return null;
}
