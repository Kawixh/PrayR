"use client";

import { PrayerTimings } from "@/backend/types";
import { useEffect, useState } from "react";
import { formatTo12Hour, getLocalDayKey } from "../_utils/time";
import { PrayerReminder } from "./prayer-reminder";
import { PrayerTimeCard } from "./prayer-time-card";

type PrayerSettings = {
  cityName: string;
  country: string;
  method: number;
  school: number;
};

type PrayerTimesCache = {
  dayKey: string;
  settingsKey: string;
  timings: PrayerTimings;
};

const SETTINGS_STORAGE_KEY = "prayerSettings";
const CACHE_STORAGE_KEY = "prayerTimesCacheV1";

function normalizeSettings(raw: unknown): PrayerSettings | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    cityName?: unknown;
    country?: unknown;
    method?: unknown;
    school?: unknown;
  };

  const cityName = typeof candidate.cityName === "string" ? candidate.cityName.trim() : "";
  const country = typeof candidate.country === "string" ? candidate.country.trim() : "";

  const method = Number(candidate.method);
  const school = Number(candidate.school);

  if (!cityName || !country || Number.isNaN(method) || Number.isNaN(school)) {
    return null;
  }

  return {
    cityName,
    country,
    method,
    school,
  };
}

function getSettingsCacheKey(settings: PrayerSettings): string {
  return [
    settings.cityName.toLowerCase(),
    settings.country.toLowerCase(),
    settings.method,
    settings.school,
  ].join("::");
}

function readSettingsFromStorage(): PrayerSettings | null {
  const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

  if (!savedSettings) {
    return null;
  }

  try {
    return normalizeSettings(JSON.parse(savedSettings));
  } catch {
    return null;
  }
}

function readPrayerCache(): PrayerTimesCache | null {
  const cached = localStorage.getItem(CACHE_STORAGE_KEY);

  if (!cached) {
    return null;
  }

  try {
    const parsed = JSON.parse(cached) as Partial<PrayerTimesCache>;

    if (
      typeof parsed.dayKey === "string" &&
      typeof parsed.settingsKey === "string" &&
      parsed.timings &&
      typeof parsed.timings === "object"
    ) {
      return {
        dayKey: parsed.dayKey,
        settingsKey: parsed.settingsKey,
        timings: parsed.timings as PrayerTimings,
      };
    }
  } catch {
    return null;
  }

  return null;
}

function writePrayerCache(cache: PrayerTimesCache): void {
  localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(cache));
}

async function fetchPrayerTimesFromApi(settings: PrayerSettings): Promise<PrayerTimings> {
  const params = new URLSearchParams({
    city: settings.cityName,
    country: settings.country,
    method: String(settings.method),
    school: String(settings.school),
  });

  const response = await fetch(`/api/prayer-times?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }

  const data = (await response.json()) as { timings: PrayerTimings };
  return data.timings;
}

export function PrayerTimesWrapper() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const getPrayerTimes = async () => {
      try {
        const settings = readSettingsFromStorage();

        if (!settings) {
          if (active) {
            setLoading(false);
          }

          return;
        }

        const dayKey = getLocalDayKey();
        const settingsKey = getSettingsCacheKey(settings);
        const cached = readPrayerCache();

        if (cached?.dayKey === dayKey && cached.settingsKey === settingsKey) {
          if (active) {
            setTimings(cached.timings);
            setError(null);
            setLoading(false);
          }

          return;
        }

        const prayerTimes = await fetchPrayerTimesFromApi(settings);

        if (!active) {
          return;
        }

        setTimings(prayerTimes);
        setError(null);

        writePrayerCache({
          dayKey,
          settingsKey,
          timings: prayerTimes,
        });
      } catch (fetchError) {
        console.error("Error fetching prayer times:", fetchError);

        if (active) {
          setError("Failed to fetch prayer times. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void getPrayerTimes();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-8 text-xl font-medium text-orange-500">
            Loading prayer times...
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-8 text-xl font-medium text-red-500">{error}</h2>
        </div>
      </div>
    );
  }

  if (!timings) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <PrayerReminder timings={timings} />
      <PrayerTimeCard timings={timings} />

      <div className="grid grid-cols-2 gap-4 mt-8 md:grid-cols-3">
        <div className="text-center">
          <p className="text-lg font-semibold">Fajr</p>
          <p className="text-xl">{formatTo12Hour(timings.Fajr)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Sunrise</p>
          <p className="text-xl">{formatTo12Hour(timings.Sunrise)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Dhuhr</p>
          <p className="text-xl">{formatTo12Hour(timings.Dhuhr)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Asr</p>
          <p className="text-xl">{formatTo12Hour(timings.Asr)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Maghrib</p>
          <p className="text-xl">{formatTo12Hour(timings.Maghrib)}</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold">Isha</p>
          <p className="text-xl">{formatTo12Hour(timings.Isha)}</p>
        </div>
      </div>
    </div>
  );
}
