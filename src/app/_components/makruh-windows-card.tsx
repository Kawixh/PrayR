"use client";

import { type PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import { getMakruhWindows } from "../_utils/prayer-day";

type MakruhWindowsCardProps = {
  timings: PrayerTimings;
};

export function MakruhWindowsCard({ timings }: MakruhWindowsCardProps) {
  const windows = useMemo(() => getMakruhWindows(timings, new Date()), [timings]);

  if (windows.length === 0) {
    return null;
  }

  return (
    <Card className="glass-panel border-border/80 p-4 sm:p-5">
      <h2 className="font-display text-2xl leading-tight sm:text-3xl">
        Makrooh Waqt Windows
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Times in the day where voluntary prayers should be avoided.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {windows.map((windowItem) => (
          <article
            className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-3"
            key={windowItem.id}
          >
            <p className="text-sm font-semibold">{windowItem.title.replace("Makrooh Waqt: ", "")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {windowItem.startLabel} - {windowItem.endLabel}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {windowItem.details}
            </p>
          </article>
        ))}
      </div>
    </Card>
  );
}
