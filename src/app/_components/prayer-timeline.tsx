"use client";

import { type PrayerTimings } from "@/backend/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Clock3, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getPrayerStatusSnapshot } from "../_utils/prayer-day";

type PrayerTimelineProps = {
  showAdhkarLinks: boolean;
  timings: PrayerTimings;
};

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

  if (!snapshot) {
    return null;
  }

  return (
    <section className="space-y-4">
      <Card className="glass-panel border-border/80 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="soft-chip inline-flex">Timeline View</p>
            <p className="mt-2 text-sm text-muted-foreground">Current time</p>
            <p className="font-display text-3xl leading-tight sm:text-4xl">{snapshot.nowLabel}</p>
          </div>

          <div className="min-w-0 rounded-xl border border-border/75 bg-background/55 p-3">
            {snapshot.activeMakruh ? (
              <>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                  {snapshot.activeMakruh.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {snapshot.activeMakruh.startLabel} - {snapshot.activeMakruh.endLabel}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-foreground">
                  Next prayer: {snapshot.nextPrayer.name}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Previous: {snapshot.previousPrayer.name}
                </p>
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="glass-panel border-border/80 p-4 sm:p-5">
        <h2 className="font-display text-2xl leading-tight sm:text-3xl">Prayer Day Timeline</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Vertical timeline with prayers and Makrooh windows.
        </p>

        <div className="relative mt-5 space-y-4 pl-6 sm:pl-8">
          <div className="absolute bottom-0 left-2 top-0 w-px bg-border/90 sm:left-3" />

          {snapshot.timelineEntries.map((entry) => (
            <article className="relative" key={entry.id}>
              <div
                className={cn(
                  "absolute -left-[1.52rem] top-5 size-3 rounded-full border sm:-left-[1.96rem]",
                  entry.kind === "makruh"
                    ? "border-amber-500/60 bg-amber-500/30"
                    : "border-primary/60 bg-primary/35",
                  entry.isNextPrayer ? "ring-4 ring-primary/15" : undefined,
                )}
              />

              <div
                className={cn(
                  "rounded-xl border p-3 sm:p-4",
                  entry.kind === "makruh"
                    ? "border-amber-500/35 bg-amber-500/10"
                    : "border-border/80 bg-background/55",
                  entry.isActive ? "border-primary/45" : undefined,
                )}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      {entry.title}
                    </p>
                    <p className="mt-1 break-words text-sm leading-6 text-muted-foreground">
                      {entry.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {entry.kind === "makruh" ? (
                      <TriangleAlert className="size-3.5" />
                    ) : (
                      <Clock3 className="size-3.5" />
                    )}
                    <span>
                      {entry.isActive
                        ? "Happening now"
                        : entry.isPast
                          ? "Passed"
                          : entry.isNextPrayer
                            ? "Next prayer"
                            : "Upcoming"}
                    </span>
                  </div>
                </div>

                {showAdhkarLinks && entry.kind === "prayer" && entry.prayerName ? (
                  <div className="mt-3">
                    <Button
                      asChild
                      className="min-h-9 rounded-full px-3 py-2 text-sm"
                      size="sm"
                      variant="outline"
                    >
                      <Link href={`/adhkars?prayer=${encodeURIComponent(entry.prayerName)}`}>
                        View Adhkars
                      </Link>
                    </Button>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}
