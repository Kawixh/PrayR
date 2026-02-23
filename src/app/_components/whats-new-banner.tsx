"use client";

import {
  WHATS_NEW_BANNER_STORAGE_KEY,
  readBannerDismissed,
  writeBannerDismissed,
} from "@/app/_utils/banner-preferences";
import { ArrowRight, Megaphone, X } from "lucide-react";
import { useState } from "react";

const NEW_FEATURES = [
  "Timeline view",
  "Added feature toggles in settings",
  "Simple settings",
  "Resources tab",
  "Added makruh timings",
  "Ramadan-ul-Mubarak integrations",
] as const;

export function WhatsNewBanner() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !readBannerDismissed(WHATS_NEW_BANNER_STORAGE_KEY);
  });

  const dismissBanner = () => {
    setIsVisible(false);
    writeBannerDismissed(WHATS_NEW_BANNER_STORAGE_KEY);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section
      aria-label="What's new"
      className="app-banner-subtle animate-in fade-in slide-in-from-top-2 duration-500 border-l-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold sm:text-base">
            <Megaphone className="size-3.5 text-primary" />
            New in PrayR
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
            Updated dashboard flow and cleaner settings experience.
          </p>
        </div>
        <button
          aria-label="Dismiss what's new banner"
          className="text-muted-foreground hover:bg-muted hover:text-foreground rounded-md p-1.5 transition-colors"
          onClick={dismissBanner}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>

      <ul className="mt-3 grid gap-1.5 border-t border-border/70 pt-3 sm:grid-cols-2">
        {NEW_FEATURES.map((item) => (
          <li
            className="flex items-center gap-2 rounded-lg bg-background/65 px-2.5 py-1.5 text-sm"
            key={item}
          >
            <ArrowRight className="size-3.5 text-primary" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
