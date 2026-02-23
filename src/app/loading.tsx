"use client";

import { CheckCircle2, Clock3, Loader2, LocateFixed, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function Loading() {
  const steps = useMemo(
    () => [
      {
        id: "network",
        label: "Checking network context",
        icon: LocateFixed,
      },
      {
        id: "location",
        label: "Resolving location",
        icon: MapPin,
      },
      {
        id: "timings",
        label: "Loading prayer timings",
        icon: Clock3,
      },
    ],
    [],
  );

  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    const timerId = window.setInterval(() => {
      setActiveStepIndex((current) => (current + 1) % steps.length);
    }, 1250);

    return () => {
      window.clearInterval(timerId);
    };
  }, [steps.length]);

  const progressPercent = ((activeStepIndex + 1) / steps.length) * 100;

  return (
    <section className="mx-auto flex min-h-[56svh] w-full max-w-2xl items-center justify-center">
      <div aria-busy="true" aria-live="polite" className="w-full space-y-4">
        <div className="glass-panel rounded-2xl border-border/80 p-4 sm:p-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Loading
          </p>
          <h2 className="font-display mt-2 text-2xl leading-tight sm:text-3xl">
            Fetching today&apos;s timings
          </h2>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Give us a moment while we align your prayer schedule.
          </p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary/18">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <ol className="glass-panel space-y-2.5 rounded-2xl border-border/80 p-4 sm:p-5">
          {steps.map((step, index) => {
            const isCompleted = index < activeStepIndex;
            const isActive = index === activeStepIndex;
            const Icon = step.icon;

            return (
              <li
                className="flex items-center gap-3 rounded-lg border border-border/80 bg-background/85 px-3 py-2.5"
                key={step.id}
              >
                <span
                  className={
                    isCompleted || isActive
                      ? "inline-flex size-6 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"
                      : "inline-flex size-6 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground"
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
                <p
                  className={
                    isCompleted || isActive
                      ? "text-sm font-medium"
                      : "text-sm text-muted-foreground"
                  }
                >
                  {step.label}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
