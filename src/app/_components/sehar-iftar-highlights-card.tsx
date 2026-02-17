"use client";

import { type PrayerTimings } from "@/backend/types";
import { Card } from "@/components/ui/card";
import { MoonStar, Sunset } from "lucide-react";
import { formatTo12Hour } from "../_utils/time";

type SeharIftarHighlightsCardProps = {
  timings: PrayerTimings;
};

export function SeharIftarHighlightsCard({
  timings,
}: SeharIftarHighlightsCardProps) {
  return (
    <Card className="overflow-hidden border-primary/30 bg-primary/8 p-0">
      <div className="border-b border-primary/20 px-4 py-3 sm:px-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Fasting Times
        </p>
        <h2 className="font-display mt-1 text-2xl leading-tight sm:text-3xl">
          Sehar & Iftar
        </h2>
      </div>

      <div className="grid gap-2 p-3 sm:grid-cols-2 sm:p-4">
        <article className="rounded-lg border border-border/80 bg-background/75 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Sehar</p>
            <MoonStar className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatTo12Hour(timings.Imsak)}</p>
          <p className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Imsak</p>
        </article>

        <article className="rounded-lg border border-border/80 bg-background/75 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Iftar</p>
            <Sunset className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{formatTo12Hour(timings.Maghrib)}</p>
          <p className="text-xs tracking-[0.1em] text-muted-foreground uppercase">Maghrib</p>
        </article>
      </div>
    </Card>
  );
}
