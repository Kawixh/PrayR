"use client";

import { type PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock3, Dot } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatTo12Hour, parseTime24 } from "../_utils/time";
import { getPrayerStatusSnapshot } from "../_utils/prayer-day";

type PrayerTimelineProps = {
  showAdhkarLinks: boolean;
  timings: PrayerTimings;
};

type PrayerBlock = {
  id: string;
  prayerName: string;
  title: string;
  description: string;
  startHour: number;
  endHour: number;
  startLabel: string;
  endLabel: string;
};

type SpecialWindow = {
  id: string;
  kind: string;
  title: string;
  description: string;
  startHour: number;
  endHour: number;
  startLabel: string;
  endLabel: string;
};

const DAY_HOURS = 24;
const PIXELS_PER_HOUR = 28;
const TIMELINE_HEIGHT_PX = DAY_HOURS * PIXELS_PER_HOUR;
const SUNRISE_MAKRUH_MINUTES = 15;
const SOLAR_NOON_MAKRUH_MINUTES = 10;
const SUNSET_MAKRUH_MINUTES = 15;
const WINDOW_TEXT_HEIGHT_PX = 44;
const BLOCK_META_HEIGHT_PX = 36;
const BLOCK_DESCRIPTION_HEIGHT_PX = 64;

function toHourValue(time24: string): number | null {
  const parsed = parseTime24(time24);

  if (!parsed) {
    return null;
  }

  return parsed.hours + parsed.minutes / 60;
}

function toPercent(hours: number): number {
  return (hours / DAY_HOURS) * 100;
}

function clampHour(value: number): number {
  return Math.max(0, Math.min(DAY_HOURS, value));
}

function formatDecimalHour(value: number): string {
  const totalMinutes = Math.round(value * 60);
  const fullDayMinutes = DAY_HOURS * 60;
  const normalized =
    ((totalMinutes % fullDayMinutes) + fullDayMinutes) % fullDayMinutes;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  return formatTo12Hour(`${hh}:${mm}`);
}

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

export function PrayerTimeline({ showAdhkarLinks, timings }: PrayerTimelineProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const snapshot = useMemo(
    () => getPrayerStatusSnapshot(timings, currentTime),
    [currentTime, timings],
  );

  const timelineData = useMemo(() => {
    const fajrHour = toHourValue(timings.Fajr);
    const sunriseHour = toHourValue(timings.Sunrise);
    const dhuhrHour = toHourValue(timings.Dhuhr);
    const asrHour = toHourValue(timings.Asr);
    const maghribHour = toHourValue(timings.Maghrib);
    const ishaHour = toHourValue(timings.Isha);

    if (
      fajrHour === null ||
      sunriseHour === null ||
      dhuhrHour === null ||
      asrHour === null ||
      maghribHour === null ||
      ishaHour === null
    ) {
      return null;
    }

    const sunriseMakruhEnd = clampHour(sunriseHour + SUNRISE_MAKRUH_MINUTES / 60);
    const solarNoonMakruhStart = clampHour(
      dhuhrHour - SOLAR_NOON_MAKRUH_MINUTES / 60,
    );
    const sunsetMakruhStart = clampHour(
      maghribHour - SUNSET_MAKRUH_MINUTES / 60,
    );

    const prayerBlocks: PrayerBlock[] = [
      {
        id: "isha-after-midnight",
        prayerName: "Isha",
        title: "Isha (after midnight)",
        description: "Isha time from midnight until Fajr.",
        startHour: 0,
        endHour: fajrHour,
        startLabel: "12:00 AM",
        endLabel: formatTo12Hour(timings.Fajr),
      },
      {
        id: "fajr",
        prayerName: "Fajr",
        title: "Fajr",
        description: "Fajr starts at dawn and ends at Sunrise.",
        startHour: fajrHour,
        endHour: sunriseHour,
        startLabel: formatTo12Hour(timings.Fajr),
        endLabel: formatTo12Hour(timings.Sunrise),
      },
      {
        id: "dhuhr",
        prayerName: "Dhuhr",
        title: "Dhuhr",
        description: "Dhuhr window until Asr.",
        startHour: dhuhrHour,
        endHour: asrHour,
        startLabel: formatTo12Hour(timings.Dhuhr),
        endLabel: formatTo12Hour(timings.Asr),
      },
      {
        id: "asr",
        prayerName: "Asr",
        title: "Asr",
        description: "Asr window until Maghrib.",
        startHour: asrHour,
        endHour: maghribHour,
        startLabel: formatTo12Hour(timings.Asr),
        endLabel: formatTo12Hour(timings.Maghrib),
      },
      {
        id: "maghrib",
        prayerName: "Maghrib",
        title: "Maghrib",
        description: "Maghrib window until Isha.",
        startHour: maghribHour,
        endHour: ishaHour,
        startLabel: formatTo12Hour(timings.Maghrib),
        endLabel: formatTo12Hour(timings.Isha),
      },
      {
        id: "isha-night",
        prayerName: "Isha",
        title: "Isha (night)",
        description: "Isha time from evening to midnight.",
        startHour: ishaHour,
        endHour: DAY_HOURS,
        startLabel: formatTo12Hour(timings.Isha),
        endLabel: "12:00 AM",
      },
    ].filter((item) => item.endHour > item.startHour);

    const specialWindows: SpecialWindow[] = [
      {
        id: "sunrise-makruh",
        kind: "makruh",
        title: "Makruh: Sunrise",
        description: "Avoid voluntary prayer while the sun rises.",
        startHour: sunriseHour,
        endHour: sunriseMakruhEnd,
        startLabel: formatTo12Hour(timings.Sunrise),
        endLabel: formatDecimalHour(sunriseMakruhEnd),
      },
      {
        id: "duha-window",
        kind: "open",
        title: "Duha Window (prayer allowed)",
        description:
          "You can pray voluntary prayers between sunrise makruh and solar noon makruh.",
        startHour: sunriseMakruhEnd,
        endHour: solarNoonMakruhStart,
        startLabel: formatDecimalHour(sunriseMakruhEnd),
        endLabel: formatDecimalHour(solarNoonMakruhStart),
      },
      {
        id: "solar-noon-makruh",
        kind: "makruh",
        title: "Makruh: Solar Noon",
        description: "Avoid voluntary prayer at the sun’s highest point.",
        startHour: solarNoonMakruhStart,
        endHour: dhuhrHour,
        startLabel: formatDecimalHour(solarNoonMakruhStart),
        endLabel: formatTo12Hour(timings.Dhuhr),
      },
      {
        id: "sunset-makruh",
        kind: "makruh",
        title: "Makruh: Before Maghrib",
        description: "Avoid voluntary prayer in the final minutes before Maghrib.",
        startHour: sunsetMakruhStart,
        endHour: maghribHour,
        startLabel: formatDecimalHour(sunsetMakruhStart),
        endLabel: formatTo12Hour(timings.Maghrib),
      },
    ].filter((item) => item.endHour > item.startHour);

    const nowHour =
      currentTime.getHours() +
      currentTime.getMinutes() / 60 +
      currentTime.getSeconds() / 3600;

    return {
      nowHour,
      prayerBlocks,
      specialWindows,
    };
  }, [currentTime, timings]);

  if (!snapshot) {
    return null;
  }

  if (!timelineData) {
    return null;
  }

  const activePrayerBlock = timelineData.prayerBlocks.find(
    (item) =>
      timelineData.nowHour >= item.startHour && timelineData.nowHour < item.endHour,
  );
  const activeSpecialWindow = timelineData.specialWindows.find(
    (item) =>
      timelineData.nowHour >= item.startHour && timelineData.nowHour < item.endHour,
  );

  const hourMarkers = Array.from({ length: DAY_HOURS + 1 }, (_, index) => index);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
              24-Hour Prayer Timeline
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              True scale: 24.0 total units, 1.0 = 1 hour, 0.5 = 30 minutes.
            </p>
            <p className="text-sm leading-6">
              <span className="font-semibold">Now:</span> {snapshot.nowLabel}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm">
            {activeSpecialWindow ? (
              <p>
                <span className="font-semibold">{activeSpecialWindow.title}</span>{" "}
                ({activeSpecialWindow.startLabel} - {activeSpecialWindow.endLabel})
              </p>
            ) : activePrayerBlock ? (
              <p>
                <span className="font-semibold">Active block:</span>{" "}
                {activePrayerBlock.title}
              </p>
            ) : (
              <p>
                <span className="font-semibold">Next prayer:</span>{" "}
                {snapshot.nextPrayer.name}
              </p>
            )}
            <p className="text-muted-foreground mt-1">
              Next prayer: {snapshot.nextPrayer.name} ({snapshot.nextPrayer.time12})
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/75 bg-background/65 p-2 sm:p-3">
          <div className="relative overflow-x-auto">
            <div className="min-w-[680px]">
              <div className="relative" style={{ height: `${TIMELINE_HEIGHT_PX}px` }}>
                <div className="absolute inset-y-0 left-0 w-14">
                  {hourMarkers.map((hour) => (
                    <div
                      className="absolute left-0 right-0"
                      key={`hour-label-${hour}`}
                      style={{
                        top: `${toPercent(hour)}%`,
                        transform:
                          hour === 0
                            ? "translateY(0)"
                            : hour === DAY_HOURS
                              ? "translateY(-100%)"
                              : "translateY(-50%)",
                      }}
                    >
                      {hour % 2 === 0 ? (
                        <span className="text-muted-foreground absolute left-0 text-[11px] font-medium">
                          {formatHourLabel(hour % DAY_HOURS)}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>

                <div className="absolute inset-y-0 left-14 right-0 rounded-lg border border-border/70 bg-card/60">
                  {hourMarkers.map((hour) => (
                    <div
                      className={cn(
                        "absolute left-0 right-0 border-t",
                        hour % 6 === 0 ? "border-border/70" : "border-border/35",
                      )}
                      key={`hour-grid-${hour}`}
                      style={{ top: `${toPercent(hour)}%` }}
                    />
                  ))}

                  {timelineData.prayerBlocks.map((block) => {
                    const blockHeightHours = block.endHour - block.startHour;
                    const blockHeightPx = blockHeightHours * PIXELS_PER_HOUR;
                    const heightPercent = toPercent(blockHeightHours);
                    const isActive =
                      timelineData.nowHour >= block.startHour &&
                      timelineData.nowHour < block.endHour;
                    const showMeta = blockHeightPx >= BLOCK_META_HEIGHT_PX;
                    const showDescription = blockHeightPx >= BLOCK_DESCRIPTION_HEIGHT_PX;
                    const compact = blockHeightPx < BLOCK_META_HEIGHT_PX;

                    return (
                      <article
                        className={cn(
                          "absolute left-2 right-2 z-20 overflow-hidden rounded-md border",
                          isActive
                            ? "border-primary/60 bg-primary/10 shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
                            : "border-border/75 bg-background/92",
                        )}
                        key={block.id}
                        style={{
                          top: `${toPercent(block.startHour)}%`,
                          height: `${heightPercent}%`,
                        }}
                      >
                        <div className={cn("flex items-start justify-between gap-3", compact ? "px-2 py-1.5" : "px-3 py-2")}>
                          <div className="min-w-0">
                            <p className={cn("font-semibold text-foreground", compact ? "text-xs" : "text-sm")}>
                              {block.title}
                            </p>
                            {showMeta ? (
                              <p className="text-muted-foreground mt-1 text-xs leading-5">
                                {block.startLabel} - {block.endLabel}
                              </p>
                            ) : null}
                            {showDescription ? (
                              <p className="text-muted-foreground mt-1 text-xs leading-5">
                                {block.description}
                              </p>
                            ) : null}
                          </div>
                          {showMeta ? (
                            <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs">
                              <Clock3 className="size-3.5" />
                              {isActive ? "Now" : "Block"}
                            </span>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}

                  {timelineData.specialWindows.map((windowItem) => {
                    const windowHeightHours = windowItem.endHour - windowItem.startHour;
                    const windowHeightPx = windowHeightHours * PIXELS_PER_HOUR;
                    const heightPercent = toPercent(windowHeightHours);
                    const isActive =
                      timelineData.nowHour >= windowItem.startHour &&
                      timelineData.nowHour < windowItem.endHour;
                    const isTextVisible = windowHeightPx >= WINDOW_TEXT_HEIGHT_PX;
                    const makruhPattern =
                      "repeating-linear-gradient(-35deg, color-mix(in oklab, var(--destructive) 30%, transparent) 0px, color-mix(in oklab, var(--destructive) 30%, transparent) 7px, color-mix(in oklab, var(--destructive) 7%, transparent) 7px, color-mix(in oklab, var(--destructive) 7%, transparent) 14px)";
                    const openPattern =
                      "repeating-linear-gradient(-35deg, color-mix(in oklab, var(--primary) 14%, transparent) 0px, color-mix(in oklab, var(--primary) 14%, transparent) 10px, color-mix(in oklab, var(--primary) 4%, transparent) 10px, color-mix(in oklab, var(--primary) 4%, transparent) 20px)";

                    return (
                      <aside
                        className={cn(
                          "pointer-events-none absolute left-1 right-1 z-10 rounded-sm border border-dashed",
                          windowItem.kind === "makruh"
                            ? "border-destructive/65 bg-destructive/8"
                            : "border-primary/40 bg-primary/6",
                          isActive ? "ring-1 ring-primary/35" : undefined,
                        )}
                        key={windowItem.id}
                        style={{
                          top: `${toPercent(windowItem.startHour)}%`,
                          height: `${heightPercent}%`,
                          backgroundImage:
                            windowItem.kind === "makruh"
                              ? makruhPattern
                              : openPattern,
                        }}
                      >
                        {isTextVisible ? (
                          <div className="px-3 py-1.5">
                            <p className="text-xs font-semibold leading-5">
                              {windowItem.title}
                            </p>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {windowItem.startLabel} - {windowItem.endLabel}
                            </p>
                            {isActive ? (
                              <p className="text-xs leading-5 text-muted-foreground">
                                {windowItem.description}
                              </p>
                            ) : null}
                          </div>
                        ) : null}
                      </aside>
                    );
                  })}

                  <div
                    className="absolute left-0 right-0 z-30 border-t-2 border-dotted border-primary/90"
                    style={{ top: `${toPercent(timelineData.nowHour)}%` }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-primary" />
                    <div className="absolute -top-3 right-1 rounded bg-background/95 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {snapshot.nowLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 rounded-lg border border-border/70 bg-card p-3 text-xs leading-5 sm:grid-cols-2 lg:grid-cols-4">
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Sunrise Makruh:</span>{" "}
              {formatTo12Hour(timings.Sunrise)} to{" "}
              {formatDecimalHour(toHourValue(timings.Sunrise)! + SUNRISE_MAKRUH_MINUTES / 60)}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Duha Window:</span>{" "}
              {formatDecimalHour(
                toHourValue(timings.Sunrise)! + SUNRISE_MAKRUH_MINUTES / 60,
              )}{" "}
              to{" "}
              {formatDecimalHour(
                toHourValue(timings.Dhuhr)! - SOLAR_NOON_MAKRUH_MINUTES / 60,
              )}{" "}
              (voluntary prayer allowed)
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Solar Noon Makruh:</span>{" "}
              {formatDecimalHour(
                toHourValue(timings.Dhuhr)! - SOLAR_NOON_MAKRUH_MINUTES / 60,
              )}{" "}
              to {formatTo12Hour(timings.Dhuhr)}
            </p>
            <p className="text-muted-foreground">
              <span className="font-semibold text-foreground">Before Maghrib Makruh:</span>{" "}
              {formatDecimalHour(
                toHourValue(timings.Maghrib)! - SUNSET_MAKRUH_MINUTES / 60,
              )}{" "}
              to {formatTo12Hour(timings.Maghrib)}
            </p>
          </div>

          {showAdhkarLinks ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map((prayerName) => (
                <Button asChild key={prayerName} size="sm" variant="outline">
                  <Link href={`/adhkars?prayer=${encodeURIComponent(prayerName)}`}>
                    <Dot className="size-4" />
                    {prayerName} Adhkar
                  </Link>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
