// components/theme-manager.tsx
"use client";

import { defaultTheme, themes } from "@/lib/themes";
import { useEffect } from "react";

export default function ThemeManager() {
  useEffect(() => {
    // Centralize the logic to apply the theme
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
      document.body.style.backgroundSize = "cover";
      document.body.style.backgroundPosition = "center";
      document.body.style.backgroundAttachment = "fixed";
      document.body.style.transition = "background-image 0.5s ease-in-out";
    };

    // Apply the theme on initial load
    applyTheme();

    // Listen for changes in localStorage from other tabs/windows
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "prayerSettings") {
        applyTheme();
      }
    };

    // --- ADD THIS EVENT LISTENER ---
    // Listen for our custom event for same-page updates
    window.addEventListener("theme-changed", applyTheme);
    window.addEventListener("storage", handleStorageChange);

    // Cleanup the event listeners when the component unmounts
    return () => {
      window.removeEventListener("theme-changed", applyTheme);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // Empty dependency array is correct, we manage updates with events

  return null; // This component does not render anything
}
