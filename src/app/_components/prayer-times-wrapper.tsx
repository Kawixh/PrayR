"use client";

import { type AlAdhanDayData, type AlAdhanTimingsResponse } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { type FeatureFlags } from "@/features/definitions";
import { AlertTriangle, Clock3, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  applyHijriDateAdjustment,
  DEFAULT_HIJRI_DATE_ADJUSTMENT,
  normalizeHijriDateAdjustment,
} from "../_utils/hijri-date-adjustment";
import {
  PRAYER_DASHBOARD_VIEW_STORAGE_KEY,
  readPrayerDashboardViewFromStorage,
  type PrayerDashboardView,
} from "../_utils/prayer-dashboard-view";
import { getMakruhWindows } from "../_utils/prayer-day";
import { formatTo12Hour, getLocalDayKey } from "../_utils/time";
import { DailyAdhkarCard } from "./daily-adhkar-card";
import { CurrentPrayerStatusCard } from "./current-prayer-status-card";
import { IslamicDateCalendarCard } from "./islamic-date-calendar-card";
import { SeharIftarHighlightsCard } from "./sehar-iftar-highlights-card";
import { PrayerTimeCard } from "./prayer-time-card";
import { PrayerTimeline } from "./prayer-timeline";

type PrayerSettings = {
  cityName: string;
  country: string;
  hijriDateAdjustment: number;
  method: number;
  school: number;
};

type PrayerTimesCache = {
  dayKey: string;
  settingsKey: string;
  data: AlAdhanDayData;
};

type PrayerSummaryItem = {
  adhkarPrayerName?: string;
  makruh?: {
    label: string;
    range: string;
  };
  name: string;
  subtitle?: string;
  time: string;
};

const SETTINGS_STORAGE_KEY = "prayerSettings";
const CACHE_STORAGE_KEY = "prayerTimesCacheV3";
const DEFAULT_PRAYER_METHOD = 2;
const DEFAULT_PRAYER_SCHOOL = 0;

type IpLocationResponse = {
  city: string;
  country: string;
  countryCode?: string;
};

function normalizeSettings(raw: unknown): PrayerSettings | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as {
    cityName?: unknown;
    country?: unknown;
    hijriDateAdjustment?: unknown;
    method?: unknown;
    school?: unknown;
  };

  const cityName =
    typeof candidate.cityName === "string" ? candidate.cityName.trim() : "";
  const country =
    typeof candidate.country === "string" ? candidate.country.trim() : "";

  const parsedMethod = Number(candidate.method);
  const parsedSchool = Number(candidate.school);
  const hijriDateAdjustment = normalizeHijriDateAdjustment(candidate.hijriDateAdjustment);

  if (!cityName || !country) {
    return null;
  }

  const method = Number.isFinite(parsedMethod) ? parsedMethod : DEFAULT_PRAYER_METHOD;
  const school = Number.isFinite(parsedSchool) ? parsedSchool : DEFAULT_PRAYER_SCHOOL;

  return {
    cityName,
    country,
    hijriDateAdjustment,
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

function writeSettingsToStorage(settings: PrayerSettings, countryCode = ""): void {
  localStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify({
      cityName: settings.cityName,
      country: settings.country,
      countryCode,
      hijriDateAdjustment: String(settings.hijriDateAdjustment),
      method: String(settings.method),
      school: String(settings.school),
    }),
  );
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
      parsed.data &&
      typeof parsed.data === "object" &&
      parsed.data.timings &&
      typeof parsed.data.timings === "object" &&
      parsed.data.date &&
      typeof parsed.data.date === "object" &&
      parsed.data.meta &&
      typeof parsed.data.meta === "object"
    ) {
      return {
        dayKey: parsed.dayKey,
        settingsKey: parsed.settingsKey,
        data: parsed.data as AlAdhanDayData,
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
  localDate: string,
): Promise<AlAdhanDayData> {
  const params = new URLSearchParams({
    city: settings.cityName,
    country: settings.country,
    date: localDate,
    method: String(settings.method),
    school: String(settings.school),
  });

  const response = await fetch(`/api/prayer-times?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as
    | (AlAdhanTimingsResponse & { error?: string })
    | { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Failed to fetch prayer times.");
  }

  if (!("data" in data) || !data.data || typeof data.data !== "object") {
    throw new Error(data.error ?? "Failed to parse prayer times payload.");
  }

  return data.data;
}

async function fetchLocationFromIp(): Promise<IpLocationResponse> {
  const response = await fetch("/api/places/from-ip", {
    method: "GET",
    cache: "no-store",
  });

  const data = (await response.json()) as Partial<IpLocationResponse> & { error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? "Unable to resolve location from IP address.");
  }

  const city = typeof data.city === "string" ? data.city.trim() : "";
  const country = typeof data.country === "string" ? data.country.trim() : "";

  if (!city || !country) {
    throw new Error("Could not determine city and country from IP address.");
  }

  return {
    city,
    country,
    countryCode: typeof data.countryCode === "string" ? data.countryCode : "",
  };
}

type PrayerTimesWrapperProps = {
  featureFlags: FeatureFlags;
  initialPrayerDay?: AlAdhanDayData | null;
};

export function PrayerTimesWrapper({
  featureFlags,
  initialPrayerDay = null,
}: PrayerTimesWrapperProps) {
  const [prayerDay, setPrayerDay] = useState<AlAdhanDayData | null>(initialPrayerDay);
  const [hijriDateAdjustment, setHijriDateAdjustment] = useState(
    DEFAULT_HIJRI_DATE_ADJUSTMENT,
  );
  const [dashboardView, setDashboardView] = useState<PrayerDashboardView>(
    readPrayerDashboardViewFromStorage,
  );
  const [loading, setLoading] = useState(() => initialPrayerDay === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== PRAYER_DASHBOARD_VIEW_STORAGE_KEY) {
        return;
      }

      setDashboardView(readPrayerDashboardViewFromStorage());
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    if (!initialPrayerDay) {
      return;
    }

    setPrayerDay(initialPrayerDay);
    setError(null);
    setLoading(false);
  }, [initialPrayerDay]);

  useEffect(() => {
    let active = true;

    const getPrayerTimes = async () => {
      try {
        let settings = readSettingsFromStorage();

        if (!settings) {
          const location = await fetchLocationFromIp();
          settings = {
            cityName: location.city,
            country: location.country,
            hijriDateAdjustment: DEFAULT_HIJRI_DATE_ADJUSTMENT,
            method: DEFAULT_PRAYER_METHOD,
            school: DEFAULT_PRAYER_SCHOOL,
          };
          writeSettingsToStorage(settings, location.countryCode ?? "");
        }

        setHijriDateAdjustment(settings.hijriDateAdjustment);

        const dayKey = getLocalDayKey();
        const settingsKey = getSettingsCacheKey(settings);
        const cached = readPrayerCache();

        if (cached?.dayKey === dayKey && cached.settingsKey === settingsKey) {
          if (active) {
            setPrayerDay(cached.data);
            setError(null);
            setLoading(false);
          }

          return;
        }

        const dayData = await fetchPrayerTimesFromApi(settings, dayKey);

        if (!active) {
          return;
        }

        setPrayerDay(dayData);
        setError(null);

        writePrayerCache({
          dayKey,
          settingsKey,
          data: dayData,
        });
      } catch (fetchError) {
        console.error("Error fetching prayer times:", fetchError);

        if (active) {
          if (initialPrayerDay) {
            setPrayerDay(initialPrayerDay);
            setError(null);
          } else {
            setError("Failed to fetch prayer times. Set location in Settings and try again.");
          }
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
  }, [initialPrayerDay]);

  if (loading) {
    return (
      <section className="space-y-5">
        <Card className="glass-panel rounded-2xl border-border/80 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-full bg-primary/15 p-2 text-primary">
              <Clock3 className="size-4" />
            </div>
            <div className="w-full space-y-2">
              <div className="h-6 w-52 animate-pulse rounded bg-muted/80" />
              <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
            </div>
          </div>
        </Card>

        <Card className="glass-panel border-border/80 p-5 sm:p-6">
          <div className="space-y-3">
            <div className="h-8 w-40 animate-pulse rounded bg-muted/80" />
            <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-muted/70" />
          </div>
        </Card>

        <div className="grid w-full gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card
              className="glass-panel border-border/80 p-5 sm:p-6"
              key={`prayer-panel-skeleton-${index}`}
            >
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-24 animate-pulse rounded bg-muted/80" />
                  <div className="size-4 animate-pulse rounded bg-muted/70" />
                </div>
                <div className="space-y-2">
                  <div className="h-11 w-40 animate-pulse rounded bg-muted/80" />
                  <div className="h-8 w-28 animate-pulse rounded bg-muted/70" />
                </div>
                <div className="h-4 w-36 animate-pulse rounded bg-muted/70" />
                <div className="h-9 w-28 animate-pulse rounded-full bg-muted/70" />
              </div>
            </Card>
          ))}
        </div>

        <Card className="glass-panel border-border/80 p-4 sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="h-8 w-44 animate-pulse rounded bg-muted/80" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted/70" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="rounded-xl border border-border/80 bg-background/50 p-3"
                key={`summary-skeleton-${index}`}
              >
                <div className="h-4 w-14 animate-pulse rounded bg-muted/80" />
                <div className="mt-2 h-7 w-24 animate-pulse rounded bg-muted/70" />
                <div className="mt-3 h-9 w-28 animate-pulse rounded-full bg-muted/70" />
              </div>
            ))}
          </div>
        </Card>
      </section>
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

  if (!prayerDay) {
    return null;
  }

  const adjustedDateInfo = applyHijriDateAdjustment(
    prayerDay.date,
    hijriDateAdjustment,
  );

  const summaryItems: PrayerSummaryItem[] = [
    { name: "Fajr", time: prayerDay.timings.Fajr, adhkarPrayerName: "Fajr" },
    { name: "Sunrise", time: prayerDay.timings.Sunrise },
    { name: "Dhuhr", time: prayerDay.timings.Dhuhr, adhkarPrayerName: "Dhuhr" },
    { name: "Asr", time: prayerDay.timings.Asr, adhkarPrayerName: "Asr" },
    { name: "Maghrib", time: prayerDay.timings.Maghrib, adhkarPrayerName: "Maghrib" },
    { name: "Isha", time: prayerDay.timings.Isha, adhkarPrayerName: "Isha" },
  ];

  if (featureFlags.sehrAndIftarTimes) {
    summaryItems.unshift({
      name: "Sehar",
      subtitle: "Fajr",
      time: prayerDay.timings.Fajr,
    });
    summaryItems.push({
      name: "Iftar",
      subtitle: "Maghrib",
      time: prayerDay.timings.Maghrib,
    });
  }

  const makruhWindows = getMakruhWindows(prayerDay.timings, new Date());
  const sunriseMakruh = makruhWindows.find((windowItem) => windowItem.id === "sunrise");
  const solarNoonMakruh = makruhWindows.find((windowItem) => windowItem.id === "solarNoon");
  const sunsetMakruh = makruhWindows.find((windowItem) => windowItem.id === "sunset");

  const prayerSummaryItems: PrayerSummaryItem[] = summaryItems.map((item) => {
    if (item.name === "Sunrise" && sunriseMakruh) {
      return {
        ...item,
        makruh: {
          label: "Makrooh Waqt (Sunrise)",
          range: `${sunriseMakruh.startLabel} - ${sunriseMakruh.endLabel}`,
        },
      };
    }

    if (item.name === "Dhuhr" && solarNoonMakruh) {
      return {
        ...item,
        makruh: {
          label: "Makrooh Waqt (Before Dhuhr)",
          range: `${solarNoonMakruh.startLabel} - ${solarNoonMakruh.endLabel}`,
        },
      };
    }

    if (item.name === "Maghrib" && sunsetMakruh) {
      return {
        ...item,
        makruh: {
          label: "Makrooh Waqt (Before Maghrib)",
          range: `${sunsetMakruh.startLabel} - ${sunsetMakruh.endLabel}`,
        },
      };
    }

    return {
      ...item,
    };
  });

  return (
    <section className="space-y-5">
      {featureFlags.sehrAndIftarTimes ? (
        <SeharIftarHighlightsCard dateInfo={adjustedDateInfo} timings={prayerDay.timings} />
      ) : null}
      <CurrentPrayerStatusCard timings={prayerDay.timings} />
      {featureFlags.islamicCalendar ? (
        <IslamicDateCalendarCard dateInfo={adjustedDateInfo} />
      ) : null}
      {featureFlags.adhkars && featureFlags.adhkarOfTheDay ? <DailyAdhkarCard /> : null}
      {dashboardView === "timeline" ? (
        <PrayerTimeline showAdhkarLinks={featureFlags.adhkars} timings={prayerDay.timings} />
      ) : (
        <PrayerTimeCard showAdhkarLinks={featureFlags.adhkars} timings={prayerDay.timings} />
      )}

      <Card className="glass-panel border-border/80 p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-2xl leading-tight">Prayer Times</h2>
          <p className="text-sm text-muted-foreground">
            12-hour format • View: {dashboardView === "timeline" ? "Timeline" : "Cards"}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {prayerSummaryItems.map((item) => (
            <div
              className="rounded-xl border border-border/80 bg-background/50 p-3"
              key={item.name}
            >
              <p className="text-base text-muted-foreground">{item.name}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">
                {formatTo12Hour(item.time)}
              </p>
              {item.subtitle ? (
                <p className="mt-0.5 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
                  {item.subtitle}
                </p>
              ) : null}
              {item.makruh ? (
                <div className="mt-3 rounded-lg border border-amber-500/45 bg-amber-500/10 p-3">
                  <p className="flex items-center gap-2 text-base font-semibold text-amber-800 dark:text-amber-200">
                    <TriangleAlert className="size-4" />
                    {item.makruh.label}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-amber-900 dark:text-amber-100">
                    {item.makruh.range}
                  </p>
                </div>
              ) : null}
              {featureFlags.adhkars && item.adhkarPrayerName ? (
                <Button
                  asChild
                  className="mt-3 min-h-9 rounded-full px-3 py-2 text-sm"
                  size="sm"
                  variant="outline"
                >
                  <Link
                    href={`/adhkars?prayer=${encodeURIComponent(item.adhkarPrayerName)}`}
                  >
                    View Adhkars
                  </Link>
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
