"use client";

import { type AlAdhanDayData, type AlAdhanTimingsResponse } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { type FeatureFlags } from "@/features/definitions";
import {
  DEFAULT_PRAYER_SCHOOL,
  parsePrayerMethod,
  parsePrayerSchool,
  resolvePrayerMethodByCountryCode,
} from "@/lib/prayer-calculation-method";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  LocateFixed,
  MapPin,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import { getLocalDayKey } from "../_utils/time";
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

type InitialLoadStage =
  | "gettingIp"
  | "calculatingLocation"
  | "calculatingPrayerTimings";

const SETTINGS_STORAGE_KEY = "prayerSettings";
const CACHE_STORAGE_KEY = "prayerTimesCacheV3";
const FIRST_VISIT_STEP_LOADER_DONE_STORAGE_KEY =
  "prayerFirstVisitStepLoaderDoneV1";

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
    countryCode?: unknown;
    hijriDateAdjustment?: unknown;
    method?: unknown;
    school?: unknown;
  };

  const cityName =
    typeof candidate.cityName === "string" ? candidate.cityName.trim() : "";
  const country =
    typeof candidate.country === "string" ? candidate.country.trim() : "";
  const countryCode =
    typeof candidate.countryCode === "string" ? candidate.countryCode.trim() : "";

  const parsedMethod = parsePrayerMethod(candidate.method);
  const parsedSchool = parsePrayerSchool(candidate.school);
  const hijriDateAdjustment = normalizeHijriDateAdjustment(candidate.hijriDateAdjustment);

  if (!cityName || !country) {
    return null;
  }

  const method = parsedMethod ?? resolvePrayerMethodByCountryCode(countryCode);
  const school = parsedSchool ?? DEFAULT_PRAYER_SCHOOL;

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

function FirstVisitStepLoader({ stage }: { stage: InitialLoadStage }) {
  const steps: Array<{
    detail: string;
    id: InitialLoadStage;
    icon: typeof LocateFixed;
    label: string;
  }> = [
    {
      id: "gettingIp",
      label: "Getting IP",
      detail: "Detecting your network region.",
      icon: LocateFixed,
    },
    {
      id: "calculatingLocation",
      label: "Calculating location",
      detail: "Resolving your nearest city and country.",
      icon: MapPin,
    },
    {
      id: "calculatingPrayerTimings",
      label: "Calculating prayer timings",
      detail: "Building today's prayer schedule.",
      icon: Clock3,
    },
  ];
  const resolvedActiveStepIndex = steps.findIndex((step) => step.id === stage);
  const activeStepIndex =
    resolvedActiveStepIndex >= 0 ? resolvedActiveStepIndex : 0;
  const activeStep = steps[activeStepIndex];
  const progressPercent = ((activeStepIndex + 1) / steps.length) * 100;

  return (
    <section aria-busy="true" aria-live="polite" className="space-y-4">
      <Card className="glass-panel rounded-2xl border-border/80 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              First Visit Setup
            </p>
            <h2 className="font-display mt-2 text-balance text-2xl leading-tight sm:text-3xl">
              Preparing your prayer dashboard
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">
              {activeStep.detail}
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-background px-3 py-1 text-xs font-semibold text-primary">
            <Loader2 className="size-3.5 animate-spin" />
            {Math.round(progressPercent)}%
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary/18">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-border/80 p-4 sm:p-5">
        <ol className="space-y-3">
          {steps.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isActive = index === activeStepIndex;
            const Icon = step.icon;

            return (
              <li className="relative" key={step.id}>
                <article
                  className={
                    isActive
                      ? "rounded-xl border border-primary/35 bg-primary/10 px-3 py-3"
                      : "rounded-xl border border-border/75 bg-background/80 px-3 py-3"
                  }
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={
                        isCompleted || isActive
                          ? "mt-0.5 inline-flex size-6 items-center justify-center rounded-full border border-primary/35 bg-background text-primary"
                          : "mt-0.5 inline-flex size-6 items-center justify-center rounded-full border border-border/75 bg-background text-muted-foreground"
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : isActive ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Icon className="size-3.5" />
                      )}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className={
                            isCompleted || isActive
                              ? "text-sm font-semibold"
                              : "text-sm font-medium text-muted-foreground"
                          }
                        >
                          {step.label}
                        </p>
                        <span
                          className={
                            isCompleted
                              ? "rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                              : isActive
                                ? "rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
                                : "rounded-full border border-border/70 bg-background/90 px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
                          }
                        >
                          {isCompleted ? "Done" : isActive ? "In progress" : "Waiting"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p>
                    </div>
                  </div>
                </article>

                {index < steps.length - 1 ? (
                  <div className="mx-auto mt-1 h-3 w-px bg-border/80" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </Card>
    </section>
  );
}

export function PrayerTimesWrapper({
  featureFlags,
  initialPrayerDay = null,
}: PrayerTimesWrapperProps) {
  const showMergedFastingCard = featureFlags.sehrAndIftarTimes;
  const showStandaloneIslamicDateCard =
    featureFlags.islamicCalendar && !showMergedFastingCard;
  const [prayerDay, setPrayerDay] = useState<AlAdhanDayData | null>(initialPrayerDay);
  const [hijriDateAdjustment, setHijriDateAdjustment] = useState(
    DEFAULT_HIJRI_DATE_ADJUSTMENT,
  );
  const [dashboardView, setDashboardView] = useState<PrayerDashboardView>(
    readPrayerDashboardViewFromStorage,
  );
  const [showFirstVisitStepLoader, setShowFirstVisitStepLoader] = useState(() => {
    if (typeof window === "undefined" || initialPrayerDay) {
      return false;
    }

    try {
      return (
        window.localStorage.getItem(FIRST_VISIT_STEP_LOADER_DONE_STORAGE_KEY) !==
        "1"
      );
    } catch {
      return false;
    }
  });
  const [initialLoadStage, setInitialLoadStage] =
    useState<InitialLoadStage>("gettingIp");
  const [loading, setLoading] = useState(() => initialPrayerDay === null);
  const [error, setError] = useState<string | null>(null);
  const firstVisitStepLoaderEnabledRef = useRef(showFirstVisitStepLoader);

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

    try {
      window.localStorage.setItem(FIRST_VISIT_STEP_LOADER_DONE_STORAGE_KEY, "1");
    } catch {}

    firstVisitStepLoaderEnabledRef.current = false;
    setShowFirstVisitStepLoader(false);

    setPrayerDay(initialPrayerDay);
    setError(null);
    setLoading(false);
  }, [initialPrayerDay]);

  useEffect(() => {
    let active = true;
    const useStepLoader = firstVisitStepLoaderEnabledRef.current;

    const completeFirstVisitStepLoader = () => {
      if (!useStepLoader) {
        return;
      }

      try {
        window.localStorage.setItem(FIRST_VISIT_STEP_LOADER_DONE_STORAGE_KEY, "1");
      } catch {}

      firstVisitStepLoaderEnabledRef.current = false;

      if (active) {
        setShowFirstVisitStepLoader(false);
      }
    };

    const getPrayerTimes = async () => {
      try {
        if (useStepLoader) {
          setInitialLoadStage("gettingIp");
        }

        let settings = readSettingsFromStorage();

        if (!settings) {
          const location = await fetchLocationFromIp();

          if (useStepLoader) {
            setInitialLoadStage("calculatingLocation");
          }

          settings = {
            cityName: location.city,
            country: location.country,
            hijriDateAdjustment: DEFAULT_HIJRI_DATE_ADJUSTMENT,
            method: resolvePrayerMethodByCountryCode(location.countryCode),
            school: DEFAULT_PRAYER_SCHOOL,
          };
          writeSettingsToStorage(settings, location.countryCode ?? "");
        }

        if (useStepLoader) {
          setInitialLoadStage("calculatingPrayerTimings");
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
            completeFirstVisitStepLoader();
          }

          return;
        }

        const dayData = await fetchPrayerTimesFromApi(settings, dayKey);

        if (!active) {
          return;
        }

        setPrayerDay(dayData);
        setError(null);
        completeFirstVisitStepLoader();

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
            completeFirstVisitStepLoader();
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
    if (showFirstVisitStepLoader) {
      return <FirstVisitStepLoader stage={initialLoadStage} />;
    }

    return (
      <section aria-busy="true" aria-live="polite" className="space-y-5">
        {showMergedFastingCard ? (
          <Card className="glass-panel rounded-2xl border-border/80 p-5 sm:p-6">
            <div className="space-y-3">
              <div className="h-4 w-24 animate-pulse rounded bg-muted/70" />
              <div className="h-9 w-36 animate-pulse rounded bg-muted/80" />
              <div className="h-4 w-28 animate-pulse rounded bg-muted/70" />
            </div>
          </Card>
        ) : null}

        <Card className="glass-panel rounded-2xl border-border/80 p-5 sm:p-6">
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div className="h-6 w-36 animate-pulse rounded bg-muted/80" />
              <div className="size-5 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="space-y-2">
              <div className="h-10 w-40 animate-pulse rounded bg-muted/80" />
              <div className="h-7 w-28 animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-4 w-48 animate-pulse rounded bg-muted/70" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-muted/70" />
          </div>
        </Card>

        {showStandaloneIslamicDateCard ? (
          <Card className="glass-panel rounded-2xl border-border/80 p-5 sm:p-6">
            <div className="space-y-3">
              <div className="h-5 w-40 animate-pulse rounded bg-muted/80" />
              <div className="h-4 w-56 animate-pulse rounded bg-muted/70" />
              <div className="h-4 w-48 animate-pulse rounded bg-muted/70" />
            </div>
          </Card>
        ) : null}

        {featureFlags.adhkars && featureFlags.adhkarOfTheDay ? (
          <Card className="glass-panel rounded-2xl border-border/80 p-5 sm:p-6">
            <div className="space-y-3">
              <div className="h-5 w-32 animate-pulse rounded bg-muted/80" />
              <div className="h-4 w-full animate-pulse rounded bg-muted/70" />
              <div className="h-4 w-11/12 animate-pulse rounded bg-muted/70" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-muted/70" />
            </div>
          </Card>
        ) : null}

        {dashboardView === "timeline" ? (
          <Card className="glass-panel rounded-2xl border-border/80 p-5 sm:p-6">
            <div className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded bg-muted/80" />
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  className="flex items-center justify-between rounded-lg border border-border/75 bg-background/80 px-3 py-3"
                  key={`timeline-skeleton-row-${index}`}
                >
                  <div className="h-4 w-20 animate-pulse rounded bg-muted/70" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted/70" />
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="grid w-full gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Card
                className="glass-panel rounded-2xl border-border/80 p-5 sm:p-6"
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
        )}
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

  return (
    <section className="space-y-5">
      {showMergedFastingCard ? (
        <SeharIftarHighlightsCard
          dateInfo={adjustedDateInfo}
          timings={prayerDay.timings}
        />
      ) : null}
      <CurrentPrayerStatusCard timings={prayerDay.timings} />
      {showStandaloneIslamicDateCard ? (
        <IslamicDateCalendarCard dateInfo={adjustedDateInfo} />
      ) : null}
      {featureFlags.adhkars && featureFlags.adhkarOfTheDay ? <DailyAdhkarCard /> : null}
      {dashboardView === "timeline" ? (
        <PrayerTimeline showAdhkarLinks={featureFlags.adhkars} timings={prayerDay.timings} />
      ) : (
        <PrayerTimeCard showAdhkarLinks={featureFlags.adhkars} timings={prayerDay.timings} />
      )}
    </section>
  );
}
