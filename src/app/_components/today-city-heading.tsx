"use client";

import {
  PRAYER_SETTINGS_STORAGE_KEY,
  PRAYER_SETTINGS_UPDATED_EVENT,
} from "@/app/_utils/prayer-settings-storage";
import { useEffect, useState } from "react";

type StoredPrayerSettings = {
  cityName?: string;
};

function readCityNameFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedSettings = window.localStorage.getItem(PRAYER_SETTINGS_STORAGE_KEY);

  if (!savedSettings) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedSettings) as StoredPrayerSettings;
    const cityName = parsed.cityName?.trim();

    return cityName || null;
  } catch {
    return null;
  }
}

export function TodayCityHeading() {
  const [cityName, setCityName] = useState<string | null>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      setCityName(readCityNameFromStorage());
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(PRAYER_SETTINGS_UPDATED_EVENT, syncFromStorage);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(PRAYER_SETTINGS_UPDATED_EVENT, syncFromStorage);
    };
  }, []);

  return (
    <h2 className="text-base font-semibold sm:text-lg" id="dashboard-heading">
      {cityName ? `Today in ${cityName}` : "Today"}
    </h2>
  );
}
