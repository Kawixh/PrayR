"use client";

import { type PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { formatTo12Hour, parseTime24 } from "../_utils/time";
import { getPrayerStatusSnapshot } from "../_utils/prayer-day";

type PrayerTimelineProps = {
  showAdhkarLinks: boolean;
  timings: PrayerTimings;
};

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type ZoneKind = "makruh" | "open";

type PrayerBlock = {
  id: string;
  prayerName: PrayerName;
  title: string;
  description: string;
  startHour: number;
  endHour: number;
  startLabel: string;
  endLabel: string;
};

type TimelineZone = {
  id: string;
  kind: ZoneKind;
  title: string;
  description: string;
  startHour: number;
  endHour: number;
  startLabel: string;
  endLabel: string;
};

type TimelineData = {
  nowHour: number;
  blocks: PrayerBlock[];
  zones: TimelineZone[];
};

const DAY_HOURS = 24;
const PIXELS_PER_HOUR = 28;
const TIMELINE_HEIGHT_PX = DAY_HOURS * PIXELS_PER_HOUR;
const SUNRISE_MAKRUH_MINUTES = 15;
const SOLAR_NOON_MAKRUH_MINUTES = 10;
const SUNSET_MAKRUH_MINUTES = 15;
const SUMMARY_PRAYERS: readonly PrayerName[] = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

function toHourValue(time24: string): number | null {
  const parsed = parseTime24(time24);

  if (!parsed) {
    return null;
  }

  return parsed.hours + parsed.minutes / 60;
}

function clampHour(hour: number): number {
  return Math.max(0, Math.min(DAY_HOURS, hour));
}

function toPercent(hours: number): number {
  return (hours / DAY_HOURS) * 100;
}

function formatHourLabel(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

function formatDecimalHour(value: number): string {
  const totalMinutes = Math.round(value * 60);
  const normalizedMinutes = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalizedMinutes / 60);
  const minutes = normalizedMinutes % 60;

  return formatTo12Hour(
    `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`,
  );
}

function currentHourValue(date: Date): number {
  return date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
}

function buildTimelineData(timings: PrayerTimings, now: Date): TimelineData | null {
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
  const solarNoonMakruhStart = clampHour(dhuhrHour - SOLAR_NOON_MAKRUH_MINUTES / 60);
  const sunsetMakruhStart = clampHour(maghribHour - SUNSET_MAKRUH_MINUTES / 60);

  // In rare regions Isha can be reported after midnight as a smaller hour than Maghrib.
  // For a 00:00-24:00 timeline, keep Maghrib visible until midnight and render midnight->Fajr as "Isha after midnight".
  const ishaStartsTonight = ishaHour > maghribHour;
  const maghribEndHour = ishaStartsTonight ? ishaHour : DAY_HOURS;

  const blocks: PrayerBlock[] = [
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
      endHour: maghribEndHour,
      startLabel: formatTo12Hour(timings.Maghrib),
      endLabel: ishaStartsTonight ? formatTo12Hour(timings.Isha) : "12:00 AM",
    },
  ];

  if (ishaStartsTonight) {
    blocks.push({
      id: "isha-night",
      prayerName: "Isha",
      title: "Isha (night)",
      description: "Isha time from evening to midnight.",
      startHour: ishaHour,
      endHour: DAY_HOURS,
      startLabel: formatTo12Hour(timings.Isha),
      endLabel: "12:00 AM",
    });
  }

  const validBlocks = blocks.filter((item) => item.endHour > item.startHour);

  const zones: TimelineZone[] = [
    {
      id: "sunrise-makruh",
      kind: "makruh" as const,
      title: "Makruh: Sunrise",
      description: "Avoid voluntary prayer while the sun rises.",
      startHour: sunriseHour,
      endHour: sunriseMakruhEnd,
      startLabel: formatTo12Hour(timings.Sunrise),
      endLabel: formatDecimalHour(sunriseMakruhEnd),
    },
    {
      id: "duha-window",
      kind: "open" as const,
      title: "Duha Window (prayer allowed)",
      description:
        "Voluntary prayer is allowed between sunrise makruh and solar noon makruh.",
      startHour: sunriseMakruhEnd,
      endHour: solarNoonMakruhStart,
      startLabel: formatDecimalHour(sunriseMakruhEnd),
      endLabel: formatDecimalHour(solarNoonMakruhStart),
    },
    {
      id: "solar-noon-makruh",
      kind: "makruh" as const,
      title: "Makruh: Solar Noon",
      description: "Avoid voluntary prayer at the sun’s highest point.",
      startHour: solarNoonMakruhStart,
      endHour: dhuhrHour,
      startLabel: formatDecimalHour(solarNoonMakruhStart),
      endLabel: formatTo12Hour(timings.Dhuhr),
    },
    {
      id: "sunset-makruh",
      kind: "makruh" as const,
      title: "Makruh: Before Maghrib",
      description: "Avoid voluntary prayer in the final minutes before Maghrib.",
      startHour: sunsetMakruhStart,
      endHour: maghribHour,
      startLabel: formatDecimalHour(sunsetMakruhStart),
      endLabel: formatTo12Hour(timings.Maghrib),
    },
  ].filter((item) => item.endHour > item.startHour);

  return {
    nowHour: currentHourValue(now),
    blocks: validBlocks,
    zones,
  };
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
  const timeline = useMemo(
    () => buildTimelineData(timings, currentTime),
    [currentTime, timings],
  );

  if (!snapshot || !timeline) {
    return null;
  }

  const activeBlock = timeline.blocks.find(
    (item) => timeline.nowHour >= item.startHour && timeline.nowHour < item.endHour,
  );
  const activeZone = timeline.zones.find(
    (item) => timeline.nowHour >= item.startHour && timeline.nowHour < item.endHour,
  );
  const hourMarkers = Array.from({ length: DAY_HOURS + 1 }, (_, index) => index);

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border/80 bg-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
              24-Hour Prayer Timeline
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              Exact scale: 24.0 total units, 1.0 = 1 hour, 0.5 = 30 minutes.
            </p>
            <p className="text-sm leading-6">
              <span className="font-semibold">Now:</span> {snapshot.nowLabel}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm">
            {activeZone ? (
              <p>
                <span className="font-semibold">{activeZone.title}</span>{" "}
                ({activeZone.startLabel} - {activeZone.endLabel})
              </p>
            ) : activeBlock ? (
              <p>
                <span className="font-semibold">Active block:</span> {activeBlock.title}
              </p>
            ) : (
              <p>
                <span className="font-semibold">Next prayer:</span> {snapshot.nextPrayer.name}
              </p>
            )}
            <p className="text-muted-foreground mt-1">
              Next prayer: {snapshot.nextPrayer.name} ({snapshot.nextPrayer.time12})
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-border/75 bg-background/65 p-2 sm:p-3">
          <div className="relative overflow-x-auto">
            <div className="min-w-[700px]">
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

                  {timeline.blocks.map((block) => {
                    const blockDuration = block.endHour - block.startHour;
                    const blockHeightPx = blockDuration * PIXELS_PER_HOUR;
                    const compact = blockHeightPx < 42;
                    const showDescription = blockHeightPx >= 78;
                    const isActive =
                      timeline.nowHour >= block.startHour &&
                      timeline.nowHour < block.endHour;

                    return (
                      <article
                        className={cn(
                          "absolute left-2 right-16 z-20 overflow-hidden rounded-md border",
                          isActive
                            ? "border-primary/55 bg-primary/10"
                            : "border-border/70 bg-background/92",
                        )}
                        key={block.id}
                        style={{
                          top: `${toPercent(block.startHour)}%`,
                          height: `${toPercent(blockDuration)}%`,
                        }}
                      >
                        <div className={cn("flex items-start gap-2", compact ? "px-2 py-1" : "px-3 py-2")}>
                          <div className="min-w-0">
                            <p className={cn("font-semibold", compact ? "text-xs" : "text-sm")}>
                              {block.title}
                            </p>
                            <p className="text-muted-foreground mt-0.5 text-xs leading-5">
                              {block.startLabel} - {block.endLabel}
                            </p>
                            {showDescription ? (
                              <p className="text-muted-foreground mt-1 text-xs leading-5">
                                {block.description}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {timeline.zones.map((zone) => {
                    const zoneDuration = zone.endHour - zone.startHour;
                    const isActive =
                      timeline.nowHour >= zone.startHour && timeline.nowHour < zone.endHour;
                    const hatch = zone.kind === "makruh"
                      ? "repeating-linear-gradient(-35deg, color-mix(in oklab, var(--destructive) 30%, transparent) 0px, color-mix(in oklab, var(--destructive) 30%, transparent) 7px, color-mix(in oklab, var(--destructive) 6%, transparent) 7px, color-mix(in oklab, var(--destructive) 6%, transparent) 14px)"
                      : "repeating-linear-gradient(-35deg, color-mix(in oklab, var(--primary) 16%, transparent) 0px, color-mix(in oklab, var(--primary) 16%, transparent) 10px, color-mix(in oklab, var(--primary) 4%, transparent) 10px, color-mix(in oklab, var(--primary) 4%, transparent) 20px)";

                    return (
                      <aside
                        aria-label={`${zone.title}: ${zone.startLabel} - ${zone.endLabel}`}
                        className={cn(
                          "absolute right-2 z-30 w-12 rounded-sm border border-dashed",
                          zone.kind === "makruh"
                            ? "border-destructive/70 bg-destructive/8"
                            : "border-primary/45 bg-primary/8",
                          isActive ? "ring-1 ring-primary/35" : undefined,
                        )}
                        key={zone.id}
                        style={{
                          top: `${toPercent(zone.startHour)}%`,
                          height: `${toPercent(zoneDuration)}%`,
                          backgroundImage: hatch,
                        }}
                      />
                    );
                  })}

                  <div
                    className="absolute left-0 right-0 z-40 border-t-2 border-dotted border-primary/95"
                    style={{ top: `${toPercent(timeline.nowHour)}%` }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-primary" />
                    <div className="absolute -top-3 right-16 rounded bg-background/95 px-2 py-0.5 text-[11px] font-medium text-primary">
                      {snapshot.nowLabel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 rounded-lg border border-border/70 bg-card p-3 text-xs leading-5 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.zones.map((zone) => (
              <p className="text-muted-foreground" key={`zone-summary-${zone.id}`}>
                <span className="font-semibold text-foreground">{zone.title}:</span>{" "}
                {zone.startLabel} - {zone.endLabel}
                {zone.kind === "open" ? " (voluntary prayer allowed)" : ""}
              </p>
            ))}
          </div>

          {showAdhkarLinks ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUMMARY_PRAYERS.map((prayerName) => (
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
