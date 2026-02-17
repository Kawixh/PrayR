"use client";

import { type PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Dot } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPrayerStatusSnapshot } from "../_utils/prayer-day";
import { formatTo12Hour, parseTime24 } from "../_utils/time";

type PrayerTimelineProps = {
  showSeharAndIftarTimes: boolean;
  showAdhkarLinks: boolean;
  timings: PrayerTimings;
};

type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha";
type ZoneKind = "makruh" | "open";
type ScaleMode = "adaptive" | "exact";

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

type ScaleSegment = {
  startHour: number;
  endHour: number;
  pxPerHour: number;
};

type TimelineTooltipProps = {
  body: string;
  heading: string;
  timeRange: string;
  touchMode: boolean;
  triggerClassName: string;
  triggerStyle?: React.CSSProperties;
  children: React.ReactNode;
};

const DAY_HOURS = 24;
const BASE_PX_PER_HOUR = 34;
const ADAPTIVE_DAY_FACTOR = 2;
const ADAPTIVE_NIGHT_DIVISOR = 2;
const NIGHT_START_HOUR = 19;
const NIGHT_END_HOUR = 4;
const MIN_PRAYER_BLOCK_PX = 58;
const BLOCK_GAP_PX = 4;
const SUNRISE_MAKRUH_MINUTES = 15;
const SOLAR_NOON_MAKRUH_MINUTES = 10;
const SUNSET_MAKRUH_MINUTES = 15;
const SUMMARY_PRAYERS: readonly PrayerName[] = [
  "Fajr",
  "Dhuhr",
  "Asr",
  "Maghrib",
  "Isha",
];

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

type HourRange = {
  end: number;
  start: number;
};

function subtractRanges(
  baseRange: HourRange,
  rangesToSubtract: HourRange[],
): HourRange[] {
  let segments: HourRange[] = [baseRange];

  const orderedRanges = [...rangesToSubtract].sort(
    (left, right) => left.start - right.start,
  );

  for (const range of orderedRanges) {
    const nextSegments: HourRange[] = [];

    for (const segment of segments) {
      if (range.end <= segment.start || range.start >= segment.end) {
        nextSegments.push(segment);
        continue;
      }

      if (range.start > segment.start) {
        nextSegments.push({
          start: segment.start,
          end: range.start,
        });
      }

      if (range.end < segment.end) {
        nextSegments.push({
          start: range.end,
          end: segment.end,
        });
      }
    }

    segments = nextSegments;
  }

  return segments.filter((segment) => segment.end - segment.start > 0);
}

function uniqueSorted(values: number[]): number[] {
  return [...new Set(values.map((value) => Number(value.toFixed(6))))].sort(
    (left, right) => left - right,
  );
}

function buildScaleSegments(
  blocks: PrayerBlock[],
  scaleMode: ScaleMode,
): ScaleSegment[] {
  const breakpoints = uniqueSorted([
    0,
    DAY_HOURS,
    NIGHT_END_HOUR,
    NIGHT_START_HOUR,
    ...blocks.flatMap((block) => [block.startHour, block.endHour]),
  ]);

  const segments: ScaleSegment[] = [];

  for (let index = 0; index < breakpoints.length - 1; index += 1) {
    const startHour = breakpoints[index];
    const endHour = breakpoints[index + 1];

    if (endHour <= startHour) {
      continue;
    }

    let pxPerHour = BASE_PX_PER_HOUR;

    if (scaleMode === "adaptive") {
      const segmentMidpoint = (startHour + endHour) / 2;
      const inNightBand =
        segmentMidpoint >= NIGHT_START_HOUR || segmentMidpoint < NIGHT_END_HOUR;

      pxPerHour = inNightBand
        ? BASE_PX_PER_HOUR / ADAPTIVE_NIGHT_DIVISOR
        : BASE_PX_PER_HOUR * ADAPTIVE_DAY_FACTOR;

      const owningBlock = blocks.find(
        (block) =>
          startHour >= block.startHour - 1e-6 &&
          endHour <= block.endHour + 1e-6,
      );

      if (owningBlock) {
        const blockDuration = owningBlock.endHour - owningBlock.startHour;

        if (blockDuration > 0) {
          pxPerHour = Math.max(
            BASE_PX_PER_HOUR,
            MIN_PRAYER_BLOCK_PX / blockDuration,
          );
        }
      }
    }

    segments.push({
      startHour,
      endHour,
      pxPerHour,
    });
  }

  return segments;
}

function mapHourToPixels(hour: number, segments: ScaleSegment[]): number {
  const targetHour = clampHour(hour);
  let y = 0;

  for (const segment of segments) {
    if (targetHour >= segment.endHour) {
      y += (segment.endHour - segment.startHour) * segment.pxPerHour;
      continue;
    }

    if (targetHour > segment.startHour) {
      y += (targetHour - segment.startHour) * segment.pxPerHour;
    }

    break;
  }

  return y;
}

function buildTimelineData(
  timings: PrayerTimings,
  now: Date,
): TimelineData | null {
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
  const sunsetMakruhStart = clampHour(maghribHour - SUNSET_MAKRUH_MINUTES / 60);

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
      description:
        "Avoid voluntary prayer in the final minutes before Maghrib.",
      startHour: sunsetMakruhStart,
      endHour: maghribHour,
      startLabel: formatDecimalHour(sunsetMakruhStart),
      endLabel: formatTo12Hour(timings.Maghrib),
    },
  ].filter((item) => item.endHour > item.startHour);

  const makruhRanges = zones
    .filter((zone) => zone.kind === "makruh")
    .map((zone) => ({
      start: zone.startHour,
      end: zone.endHour,
    }));

  const adjustedBlocks = blocks
    .flatMap((block) => {
      const subSegments = subtractRanges(
        {
          start: block.startHour,
          end: block.endHour,
        },
        makruhRanges,
      );

      return subSegments.map((segment, index) => {
        const wasAdjusted =
          segment.start !== block.startHour || segment.end !== block.endHour;

        return {
          ...block,
          id: `${block.id}-${index + 1}`,
          startHour: segment.start,
          endHour: segment.end,
          startLabel: formatDecimalHour(segment.start),
          endLabel: formatDecimalHour(segment.end),
          description: wasAdjusted
            ? `${block.description} (Makruh overlap excluded.)`
            : block.description,
        };
      });
    })
    .filter((item) => item.endHour > item.startHour);

  return {
    nowHour: currentHourValue(now),
    blocks: adjustedBlocks,
    zones,
  };
}

function TimelineTooltip({
  body,
  heading,
  timeRange,
  touchMode,
  triggerClassName,
  triggerStyle,
  children,
}: TimelineTooltipProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!touchMode || !open) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setOpen(false);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [open, touchMode]);

  return (
    <Tooltip
      onOpenChange={touchMode ? setOpen : undefined}
      open={touchMode ? open : undefined}
    >
      <TooltipTrigger asChild>
        <button
          className={triggerClassName}
          onClick={
            touchMode ? () => setOpen((previous) => !previous) : undefined
          }
          style={triggerStyle}
          type="button"
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-64 border border-border/70 bg-popover px-3 py-2 text-xs leading-5 text-popover-foreground shadow-lg"
        sideOffset={8}
      >
        <p className="font-semibold">{heading}</p>
        <p className="text-muted-foreground">{timeRange}</p>
        <p className="mt-1">{body}</p>
        {touchMode ? (
          <p className="text-muted-foreground mt-1 text-[11px]">
            Tap again to close
          </p>
        ) : null}
      </TooltipContent>
    </Tooltip>
  );
}

export function PrayerTimeline({
  showSeharAndIftarTimes,
  showAdhkarLinks,
  timings,
}: PrayerTimelineProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [scaleMode, setScaleMode] = useState<ScaleMode>("adaptive");

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none), (pointer: coarse)");

    const syncTouchMode = () => {
      setIsTouchDevice(mediaQuery.matches);
    };

    syncTouchMode();

    mediaQuery.addEventListener("change", syncTouchMode);
    return () => {
      mediaQuery.removeEventListener("change", syncTouchMode);
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

  const scaleSegments = useMemo(
    () => (timeline ? buildScaleSegments(timeline.blocks, scaleMode) : []),
    [scaleMode, timeline],
  );

  if (!snapshot || !timeline) {
    return null;
  }

  const timelineHeightPx = mapHourToPixels(DAY_HOURS, scaleSegments);
  const activeBlock = timeline.blocks.find(
    (item) =>
      timeline.nowHour >= item.startHour && timeline.nowHour < item.endHour,
  );
  const activeMakruhZone = timeline.zones.find(
    (item) =>
      item.kind === "makruh" &&
      timeline.nowHour >= item.startHour &&
      timeline.nowHour < item.endHour,
  );
  const activeOpenZone = timeline.zones.find(
    (item) =>
      item.kind === "open" &&
      timeline.nowHour >= item.startHour &&
      timeline.nowHour < item.endHour,
  );
  const hourMarkers = Array.from(
    { length: DAY_HOURS + 1 },
    (_, index) => index,
  );

  return (
    <section className="space-y-4">
      <div>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl leading-tight font-semibold sm:text-3xl">
              24-Hour Prayer Timeline
            </h2>
            <p className="text-muted-foreground text-sm leading-6">
              {scaleMode === "adaptive"
                ? "Adaptive view gives daytime prayer windows more visual space."
                : "Exact 24h keeps each hour the same height."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-border/70 bg-background/70 p-1">
              <Button
                className="min-h-8 px-3 text-xs"
                onClick={() => setScaleMode("adaptive")}
                size="sm"
                variant={scaleMode === "adaptive" ? "default" : "ghost"}
              >
                Adaptive
              </Button>
              <Button
                className="min-h-8 px-3 text-xs"
                onClick={() => setScaleMode("exact")}
                size="sm"
                variant={scaleMode === "exact" ? "default" : "ghost"}
              >
                Exact 24h
              </Button>
            </div>

            <div className="rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-sm">
              {activeMakruhZone ? (
                <p>
                  <span className="font-semibold">Current status:</span> Makruh
                  time ({activeMakruhZone.startLabel} -{" "}
                  {activeMakruhZone.endLabel})
                </p>
              ) : activeBlock ? (
                <p>
                  <span className="font-semibold">Current prayer:</span>{" "}
                  {activeBlock.prayerName}
                </p>
              ) : activeOpenZone ? (
                <p>
                  <span className="font-semibold">Current status:</span>{" "}
                  {activeOpenZone.title}
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Next prayer:</span>{" "}
                  {snapshot.nextPrayer.name}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-border/70 bg-background/70 px-3 py-2 text-xs text-muted-foreground sm:hidden">
          Tap any timeline block to see more details.
        </div>

        {showSeharAndIftarTimes ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <article className="rounded-lg border border-primary/30 bg-primary/7 px-3 py-2.5">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Sehar
              </p>
              <p className="mt-1 text-lg font-semibold">{formatTo12Hour(timings.Imsak)}</p>
              <p className="text-xs text-muted-foreground">Imsak</p>
            </article>

            <article className="rounded-lg border border-primary/30 bg-primary/7 px-3 py-2.5">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Iftar
              </p>
              <p className="mt-1 text-lg font-semibold">{formatTo12Hour(timings.Maghrib)}</p>
              <p className="text-xs text-muted-foreground">Maghrib</p>
            </article>
          </div>
        ) : null}

        <div className="my-10">
          <div className="relative mb-10">
            <div
              className="relative w-full"
              style={{ height: `${timelineHeightPx}px` }}
            >
              <div className="absolute inset-y-0 left-0 w-14">
                {hourMarkers.map((hour) => {
                  const topPx = mapHourToPixels(hour, scaleSegments);

                  return (
                    <div
                      className="absolute left-0 right-0"
                      key={`hour-label-${hour}`}
                      style={{
                        top: `${topPx}px`,
                        transform:
                          hour === 0
                            ? "translateY(0)"
                            : hour === DAY_HOURS
                              ? "translateY(-100%)"
                              : "translateY(-50%)",
                      }}
                    >
                      {hour % 2 === 0 && hour < DAY_HOURS ? (
                        <span className="text-muted-foreground absolute left-0 text-[11px] font-medium">
                          {formatHourLabel(hour % DAY_HOURS)}
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="absolute inset-y-0 left-14 right-0 rounded-lg border border-border/70 bg-card/60">
                {hourMarkers
                  .filter((hour) => hour !== 0 && hour < DAY_HOURS)
                  .map((hour) => (
                    <div
                      className={cn(
                        "absolute left-0 right-0 border-t",
                        hour % 6 === 0
                          ? "border-border/70"
                          : "border-border/35",
                      )}
                      key={`hour-grid-${hour}`}
                      style={{
                        top: `${mapHourToPixels(hour, scaleSegments)}px`,
                      }}
                    />
                  ))}

                {timeline.zones.map((zone) => {
                  const topPx = mapHourToPixels(zone.startHour, scaleSegments);
                  const rawHeightPx =
                    mapHourToPixels(zone.endHour, scaleSegments) - topPx;
                  const isActive =
                    timeline.nowHour >= zone.startHour &&
                    timeline.nowHour < zone.endHour;
                  const hatch =
                    zone.kind === "makruh"
                      ? "repeating-linear-gradient(-35deg, color-mix(in oklab, var(--destructive) 28%, transparent) 0px, color-mix(in oklab, var(--destructive) 28%, transparent) 7px, color-mix(in oklab, var(--destructive) 6%, transparent) 7px, color-mix(in oklab, var(--destructive) 6%, transparent) 14px)"
                      : "repeating-linear-gradient(-35deg, color-mix(in oklab, var(--primary) 15%, transparent) 0px, color-mix(in oklab, var(--primary) 15%, transparent) 10px, color-mix(in oklab, var(--primary) 4%, transparent) 10px, color-mix(in oklab, var(--primary) 4%, transparent) 20px)";

                  return (
                    <TimelineTooltip
                      body={zone.description}
                      heading={zone.title}
                      key={zone.id}
                      timeRange={`${zone.startLabel} - ${zone.endLabel}`}
                      touchMode={isTouchDevice}
                      triggerClassName={cn(
                        "absolute left-1 right-1 z-10 rounded-sm border border-dashed outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/65",
                        zone.kind === "makruh"
                          ? "border-destructive/70 bg-destructive/7"
                          : "border-primary/40 bg-primary/7",
                        isActive ? "ring-1 ring-primary/35" : undefined,
                      )}
                      triggerStyle={{
                        top: `${topPx}px`,
                        height: `${Math.max(rawHeightPx, 4)}px`,
                        backgroundImage: hatch,
                      }}
                    >
                      <span className="sr-only">
                        {zone.title} {zone.startLabel} to {zone.endLabel}
                      </span>
                    </TimelineTooltip>
                  );
                })}

                {timeline.blocks.map((block) => {
                  const rawTopPx = mapHourToPixels(
                    block.startHour,
                    scaleSegments,
                  );
                  const rawHeightPx =
                    mapHourToPixels(block.endHour, scaleSegments) - rawTopPx;
                  const useGap = rawHeightPx > BLOCK_GAP_PX * 2 + 8;
                  const topPx = rawTopPx + (useGap ? BLOCK_GAP_PX : 0);
                  const heightPx =
                    rawHeightPx - (useGap ? BLOCK_GAP_PX * 2 : 0);
                  const compact = heightPx < 42;
                  const showDescription = heightPx >= 78;
                  const isActive =
                    timeline.nowHour >= block.startHour &&
                    timeline.nowHour < block.endHour;

                  return (
                    <TimelineTooltip
                      body={block.description}
                      heading={block.title}
                      key={block.id}
                      timeRange={`${block.startLabel} - ${block.endLabel}`}
                      touchMode={isTouchDevice}
                      triggerClassName={cn(
                        "absolute left-1 right-1 z-20 overflow-hidden rounded-md border text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/65",
                        isActive
                          ? "border-primary/55 bg-primary/12"
                          : "border-border/70 bg-muted/35 hover:border-primary/45 hover:bg-primary/8",
                      )}
                      triggerStyle={{
                        top: `${topPx}px`,
                        height: `${Math.max(heightPx, 8)}px`,
                      }}
                    >
                      <div
                        className={cn(
                          "flex items-start gap-2",
                          compact ? "px-2 py-1.5" : "px-2.5 py-2.5",
                        )}
                      >
                        <div className="min-w-0">
                          <p
                            className={cn(
                              "font-semibold",
                              compact ? "text-xs" : "text-sm",
                            )}
                          >
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
                    </TimelineTooltip>
                  );
                })}

                <div
                  className="absolute left-0 right-0 z-40 border-t-2 border-dotted border-primary/95"
                  style={{
                    top: `${mapHourToPixels(timeline.nowHour, scaleSegments)}px`,
                  }}
                >
                  <div className="absolute -left-1.5 -top-1.5 size-3 rounded-full bg-primary" />
                  <div className="absolute -top-3 left-2 rounded bg-background/95 px-2 py-0.5 text-[11px] font-medium text-primary sm:left-auto sm:right-2">
                    {snapshot.nowLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {showAdhkarLinks ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {SUMMARY_PRAYERS.map((prayerName) => (
                <Button asChild key={prayerName} size="sm" variant="outline">
                  <Link
                    href={`/adhkars?prayer=${encodeURIComponent(prayerName)}`}
                  >
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
