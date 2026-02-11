"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";

type StoredPrayerSettings = {
  cityName?: string;
  country?: string;
};

export function CitySeoSummary() {
  const [locationLabel] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const savedSettings = localStorage.getItem("prayerSettings");

    if (!savedSettings) {
      return null;
    }

    try {
      const parsed = JSON.parse(savedSettings) as StoredPrayerSettings;
      const city = parsed.cityName?.trim();
      const country = parsed.country?.trim();

      if (!city || !country) {
        return null;
      }

      return `${city}, ${country}`;
    } catch {
      return null;
    }
  });

  if (!locationLabel) {
    return (
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Set your city and country in settings to personalize today&apos;s prayer
        schedule.
      </p>
    );
  }

  return (
    <p className="mt-3 flex items-center gap-2 text-sm leading-6 text-muted-foreground">
      <MapPin className="size-4 text-primary" />
      <span className="break-words">
        Showing prayer times for <strong className="font-medium text-foreground">{locationLabel}</strong>
      </span>
    </p>
  );
}
