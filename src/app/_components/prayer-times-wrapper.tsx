"use client";

import { PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { AlertTriangle, Clock3, MapPin } from "lucide-react";
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

  const cityName =
    typeof candidate.cityName === "string" ? candidate.cityName.trim() : "";
  const country =
    typeof candidate.country === "string" ? candidate.country.trim() : "";

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

async function fetchPrayerTimesFromApi(
  settings: PrayerSettings,
): Promise<PrayerTimings> {
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
  const [locationLabel, setLocationLabel] = useState("");
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

        if (active) {
          setLocationLabel(`${settings.cityName}, ${settings.country}`);
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
      <Card className="glass-panel border-border/80 p-6">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock3 className="size-4 animate-pulse" />
          <p>Loading prayer times for today...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="glass-panel border-destructive/40 bg-destructive/10 p-6">
        <div className="flex items-start gap-3 text-destructive">
          <AlertTriangle className="mt-0.5 size-4" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (!timings) {
    return null;
  }

  const summaryItems = [
    { name: "Fajr", time: timings.Fajr },
    { name: "Sunrise", time: timings.Sunrise },
    { name: "Dhuhr", time: timings.Dhuhr },
    { name: "Asr", time: timings.Asr },
    { name: "Maghrib", time: timings.Maghrib },
    { name: "Isha", time: timings.Isha },
  ];

  return (
    <section className="space-y-5">
      <header className="glass-panel rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="soft-chip inline-flex">Today&apos;s prayer schedule</p>
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Quiet moments, right on time
            </h1>
          </div>

          {locationLabel ? (
            <div className="flex items-center gap-2 rounded-full border border-border/75 bg-background/55 px-3 py-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" />
              <span>{locationLabel}</span>
            </div>
          ) : null}
        </div>
      </header>

      <PrayerReminder timings={timings} />
      <PrayerTimeCard timings={timings} />

      <Card className="glass-panel border-border/80 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-2xl leading-none">All Prayer Times</h2>
          <p className="text-xs text-muted-foreground">12-hour format</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaryItems.map((item) => (
            <div
              className="rounded-xl border border-border/80 bg-background/50 p-3"
              key={item.name}
            >
              <p className="text-sm text-muted-foreground">{item.name}</p>
              <p className="mt-1 text-xl font-semibold text-foreground">
                {formatTo12Hour(item.time)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
