"use client";

import { type PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { Clock3, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getCurrentPrayerName, getPrayerStatusSnapshot } from "../_utils/prayer-day";

type CurrentPrayerStatusCardProps = {
  timings: PrayerTimings;
};

export function CurrentPrayerStatusCard({ timings }: CurrentPrayerStatusCardProps) {
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
  const currentPrayer = useMemo(
    () => getCurrentPrayerName(timings, currentTime),
    [currentTime, timings],
  );

  if (!snapshot) {
    return null;
  }

  const activeMakruh = snapshot.activeMakruh;
  const headline = activeMakruh
    ? "Makruh Time Right Now"
    : currentPrayer
      ? `Pray ${currentPrayer} Now`
      : "No Fard Prayer Right Now";

  return (
    <Card
      className={
        activeMakruh
          ? "border-amber-500/35 bg-amber-500/10 p-5 sm:p-6"
          : "glass-panel border-border/80 p-5 sm:p-6"
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div
            className={
              activeMakruh
                ? "rounded-full bg-amber-500/20 p-2 text-amber-700 dark:text-amber-300"
                : "rounded-full bg-primary/15 p-2 text-primary"
            }
          >
            {activeMakruh ? (
              <TriangleAlert className="size-4" />
            ) : (
              <Clock3 className="size-4" />
            )}
          </div>
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Current Prayer Status
          </p>
        </div>

        <p className="font-display text-3xl leading-tight sm:text-5xl">{headline}</p>

        <div className="space-y-1.5">
          {activeMakruh ? (
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              {activeMakruh.title.replace("Makrooh Waqt: ", "")}: {activeMakruh.startLabel} -{" "}
              {activeMakruh.endLabel}
            </p>
          ) : currentPrayer ? (
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              You can perform {currentPrayer} now.
            </p>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground sm:text-base">
              No obligatory prayer is active at this moment.
            </p>
          )}

          <p className="text-sm leading-6 text-muted-foreground sm:text-base">
            Next prayer: {snapshot.nextPrayer.name} at {snapshot.nextPrayer.time12}.
          </p>
        </div>
      </div>
    </Card>
  );
}
