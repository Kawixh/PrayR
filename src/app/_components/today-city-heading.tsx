"use client";

import { useEffect, useState } from "react";

type StoredPrayerSettings = {
  cityName?: string;
};

function readCityNameFromStorage(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const savedSettings = window.localStorage.getItem("prayerSettings");

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

    return () => {
      window.removeEventListener("storage", syncFromStorage);
    };
  }, []);

  return (
    <h2 className="text-base font-semibold sm:text-lg" id="dashboard-heading">
      {cityName ? `Today in ${cityName}` : "Today"}
    </h2>
  );
}
