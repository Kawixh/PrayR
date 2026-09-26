"use client";

import { type PrayerTimings } from "@/backend/types";
import { cn } from "@/lib/utils";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentPrayerName,
  getMakruhWindows,
  getPrayerStatusSnapshot,
  type PrayerName,
} from "../_utils/prayer-day";
import { formatTo12Hour, prayerTimeToDate } from "../_utils/time";

type PrayerTimeCardProps = {
  showAdhkarLinks: boolean;
  timings: PrayerTimings;
};

type DayWindow = {
  end: Date;
  start: Date;
};

type ScheduleRow =
  | {
      kind: "prayer";
      name: PrayerName;
      note?: string;
      startsAt: Date;
      time: string;
    }
  | { kind: "duha"; id: string; window: DayWindow }
  | { kind: "makruh"; id: string; window: DayWindow };

const SUNRISE_MAKRUH_MINUTES = 15;
const SOLAR_NOON_MAKRUH_MINUTES = 10;

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

function formatWindow(windowItem: DayWindow): string {
  return `${timeFormatter.format(windowItem.start)} – ${timeFormatter.format(windowItem.end)}`;
}

function buildScheduleRows(timings: PrayerTimings, now: Date): ScheduleRow[] | null {
  const fajr = prayerTimeToDate(timings.Fajr, now);
  const sunrise = prayerTimeToDate(timings.Sunrise, now);
  const dhuhr = prayerTimeToDate(timings.Dhuhr, now);
  const asr = prayerTimeToDate(timings.Asr, now);
  const maghrib = prayerTimeToDate(timings.Maghrib, now);
  const isha = prayerTimeToDate(timings.Isha, now);
  const sunsetMakruh = getMakruhWindows(timings, now).find(
    (windowItem) => windowItem.id === "sunset",
  );

  if (!fajr || !sunrise || !dhuhr || !asr || !maghrib || !isha || !sunsetMakruh) {
    return null;
  }

  const sunriseMakruhEnd = new Date(
    sunrise.getTime() + SUNRISE_MAKRUH_MINUTES * 60_000,
  );
  const solarNoonStart = new Date(
    dhuhr.getTime() - SOLAR_NOON_MAKRUH_MINUTES * 60_000,
  );
  const prayer = (name: PrayerName, startsAt: Date, note?: string): ScheduleRow => ({
    kind: "prayer",
    name,
    note,
    startsAt,
    time: formatTo12Hour(timings[name]),
  });

  return [
    prayer("Fajr", fajr, "Sehar"),
    { kind: "makruh", id: "sunrise", window: { start: sunrise, end: sunriseMakruhEnd } },
    { kind: "duha", id: "duha", window: { start: sunriseMakruhEnd, end: solarNoonStart } },
    { kind: "makruh", id: "solarNoon", window: { start: solarNoonStart, end: dhuhr } },
    prayer("Dhuhr", dhuhr),
    prayer("Asr", asr),
    {
      kind: "makruh",
      id: "sunset",
      window: { start: sunsetMakruh.start, end: sunsetMakruh.end },
    },
    prayer("Maghrib", maghrib, "Iftar"),
    prayer("Isha", isha),
  ];
}

export function PrayerTimeCard({
  showAdhkarLinks,
  timings,
}: PrayerTimeCardProps) {
  const [currentTime, setCurrentTime] = useState(() => new Date());

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15_000);

    return () => {
      window.clearInterval(timerId);
    };
  }, []);

  const currentPrayer = useMemo(
    () => getCurrentPrayerName(timings, currentTime),
    [currentTime, timings],
  );
  const nextPrayer = useMemo(
    () => getPrayerStatusSnapshot(timings, currentTime)?.nextPrayer ?? null,
    [currentTime, timings],
  );
  const rows = useMemo(
    () => buildScheduleRows(timings, currentTime),
    [currentTime, timings],
  );

  if (!rows) {
    return null;
  }

  const now = currentTime.getTime();
  const isActive = (windowItem: DayWindow) =>
    now >= windowItem.start.getTime() && now < windowItem.end.getTime();
  const isNextToday = (name: PrayerName) =>
    nextPrayer?.name === name &&
    nextPrayer.date.toDateString() === currentTime.toDateString();

  return (
    <section aria-labelledby="schedule-heading" className="space-y-2">
      <h2 className="sr-only" id="schedule-heading">
        Today&apos;s schedule
      </h2>

      <ol className="divide-y divide-border/50 overflow-hidden rounded-3xl border border-border/70 bg-card">
        {rows.map((row) => {
          if (row.kind === "makruh") {
            const active = isActive(row.window);
            const past = !active && now >= row.window.end.getTime();

            return (
              <li
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-2 text-xs sm:px-5",
                  active
                    ? "bg-amber-500/12 text-amber-800 dark:text-amber-200"
                    : "text-amber-700/90 dark:text-amber-300/80",
                  past && "opacity-55",
                )}
                key={row.id}
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <TriangleAlert aria-hidden className="size-3.5" />
                  Makruh
                  {active ? <span className="font-semibold">· now</span> : null}
                </span>
                <span className="tabular-nums">{formatWindow(row.window)}</span>
              </li>
            );
          }

          if (row.kind === "duha") {
            const active = isActive(row.window);
            const past = !active && now >= row.window.end.getTime();

            return (
              <li
                className={cn(
                  "flex items-center justify-between gap-3 px-4 py-3 sm:px-5",
                  active && "bg-primary/8",
                  past && "text-muted-foreground",
                )}
                key={row.id}
              >
                <span className="flex items-baseline gap-2">
                  <span className="font-medium">Duha</span>
                  <span className="text-xs text-muted-foreground">Optional</span>
                </span>
                <span className="text-sm tabular-nums text-muted-foreground">
                  {formatWindow(row.window)}
                </span>
              </li>
            );
          }

          const current = currentPrayer === row.name;
          const next = !current && isNextToday(row.name);
          const past = !current && !next && now >= row.startsAt.getTime();

          return (
            <li
              aria-current={current ? "time" : undefined}
              className={cn(
                "relative flex items-center justify-between gap-3 px-4 py-4 sm:px-5",
                current && "bg-primary/10",
              )}
              key={row.name}
            >
              {current ? (
                <span
                  aria-hidden
                  className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-primary"
                />
              ) : null}

              <span className="flex min-w-0 flex-col">
                <span className="flex items-center gap-2">
                  <span
                    className={cn(
                      "text-base font-semibold",
                      current && "text-primary",
                      past && "font-medium text-muted-foreground",
                    )}
                  >
                    {row.name}
                  </span>
                  {row.note ? (
                    <span className="text-xs text-muted-foreground">{row.note}</span>
                  ) : null}
                  {current ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                      Now
                    </span>
                  ) : next ? (
                    <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      Next
                    </span>
                  ) : null}
                </span>
                {showAdhkarLinks ? (
                  <Link
                    className="mt-0.5 text-xs font-medium text-primary underline-offset-4 hover:underline"
                    href={`/adhkars?prayer=${encodeURIComponent(row.name)}`}
                  >
                    Adhkars
                  </Link>
                ) : null}
              </span>

              <span
                className={cn(
                  "font-display text-xl tabular-nums",
                  current && "font-semibold text-primary",
                  past && "text-muted-foreground",
                )}
              >
                {row.time}
              </span>
            </li>
          );
        })}
      </ol>

      <p className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground">
        <TriangleAlert aria-hidden className="size-3.5 text-amber-600 dark:text-amber-300" />
        Avoid voluntary prayers during makruh times.
      </p>
    </section>
  );
}
