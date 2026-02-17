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

  return (
    <Card
      className={
        activeMakruh
          ? "border-amber-500/35 bg-amber-500/10 p-4 sm:p-5"
          : "glass-panel border-border/80 p-4 sm:p-5"
      }
    >
      <div className="flex items-start gap-3">
        <div
          className={
            activeMakruh
              ? "mt-0.5 rounded-full bg-amber-500/20 p-2 text-amber-700 dark:text-amber-300"
              : "mt-0.5 rounded-full bg-primary/15 p-2 text-primary"
          }
        >
          {activeMakruh ? <TriangleAlert className="size-4" /> : <Clock3 className="size-4" />}
        </div>

        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold">Prayer You Can Perform Right Now</p>

          {activeMakruh ? (
            <>
              <p className="text-base font-semibold text-foreground sm:text-lg">
                You cannot perform a prayer right now because it is makruh time.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                {activeMakruh.title.replace("Makrooh Waqt: ", "")}: {activeMakruh.startLabel} -{" "}
                {activeMakruh.endLabel}
              </p>
            </>
          ) : currentPrayer ? (
            <>
              <p className="text-base font-semibold text-foreground sm:text-lg">
                You can perform {currentPrayer} right now.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Next prayer: {snapshot.nextPrayer.name} at {snapshot.nextPrayer.time12}.
              </p>
            </>
          ) : (
            <>
              <p className="text-base font-semibold text-foreground sm:text-lg">
                No obligatory prayer is active right now.
              </p>
              <p className="text-sm leading-6 text-muted-foreground">
                Next prayer: {snapshot.nextPrayer.name} at {snapshot.nextPrayer.time12}.
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
