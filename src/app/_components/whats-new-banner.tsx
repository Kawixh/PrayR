"use client";

import {
  WHATS_NEW_BANNER_STORAGE_KEY,
  readBannerDismissed,
  writeBannerDismissed,
} from "@/app/_utils/banner-preferences";
import { ArrowRight, X } from "lucide-react";
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
      className="animate-in fade-in slide-in-from-top-2 duration-500 rounded-2xl border border-border/80 bg-card"
    >
      <div className="flex items-center justify-between border-b border-border/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <p className="rounded-md border border-border/80 bg-muted/60 px-2 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
            Update
          </p>
          <h2 className="text-sm font-semibold sm:text-base">New in PrayR</h2>
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

      <ul className="grid gap-2 p-4 sm:grid-cols-2 sm:px-5 sm:py-4">
        {NEW_FEATURES.map((item) => (
          <li
            className="flex items-center gap-2 rounded-lg border border-border/70 bg-background/65 px-3 py-2 text-sm"
            key={item}
          >
            <ArrowRight className="size-3.5 text-muted-foreground" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
