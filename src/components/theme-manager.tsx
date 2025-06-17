// components/theme-manager.tsx
"use client";

import { defaultTheme, Theme, themes } from "@/lib/themes";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function ThemeManager() {
  // Get the setter and the resolved system theme from next-themes
  const { setTheme, systemTheme } = useTheme();

  useEffect(() => {
    const applyTheme = () => {
      let selection = "system";
      try {
        const savedSettings = localStorage.getItem("prayerSettings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          // Use 'themeSelection' if available, fallback for older data structure
          selection = settings.themeSelection || settings.theme || "system";
        }
      } catch (error) {
        console.error("Failed to parse prayer settings:", error);
      }

      let finalUiTheme: "light" | "dark";
      let finalBgTheme: Theme | undefined;

      if (selection === "light" || selection === "dark") {
        finalUiTheme = selection;
        const suitableThemes = themes.filter((t) => t.type === finalUiTheme);
        finalBgTheme =
          suitableThemes[Math.floor(Math.random() * suitableThemes.length)];
      } else if (selection === "system") {
        finalUiTheme = systemTheme === "dark" ? "dark" : "light";
        const suitableThemes = themes.filter((t) => t.type === finalUiTheme);
        finalBgTheme =
          suitableThemes[Math.floor(Math.random() * suitableThemes.length)];
      } else {
        // A specific theme ID was chosen (e.g., "flower-2")
        finalBgTheme = themes.find((t) => t.id === selection);
        finalUiTheme = finalBgTheme ? finalBgTheme.type : "dark"; // Fallback
      }

      // Fallback if no background was found (e.g., bad ID in localStorage)
      if (!finalBgTheme) {
        finalBgTheme = defaultTheme;
        finalUiTheme = defaultTheme.type;
      }

      // 1. Set the UI theme (light/dark) for all components
      setTheme(finalUiTheme);

      // 2. Set the background image and styles
      document.body.style.backgroundImage = `url(${finalBgTheme.image})`;
      document.body.style.backgroundSize = "150% auto";
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
    // Add systemTheme to dependencies. If the user changes their OS theme,
    // and our setting is "system", we need to re-evaluate.
  }, [systemTheme, setTheme]);

  return null;
}
