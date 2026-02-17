"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { readClientFeatureOverrides, writeClientFeatureOverrides } from "@/features/client";
import {
  FEATURE_DEFINITIONS,
  FEATURE_KEYS,
  type FeatureFlags,
  type FeatureKey,
  type FeatureOverrides,
} from "@/features/definitions";
import { resolveFeatureFlags } from "@/features/resolve";
import { cn } from "@/lib/utils";
import { RefreshCw, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

function getDependencyTitles(featureKey: FeatureKey): string {
  const dependencies = FEATURE_DEFINITIONS[featureKey].dependsOn ?? [];
  return dependencies.map((dependency) => FEATURE_DEFINITIONS[dependency].title).join(", ");
}

type FeatureSettingsCardProps = {
  onFeatureFlagsChange?: (featureFlags: FeatureFlags) => void;
};

export function FeatureSettingsCard({ onFeatureFlagsChange }: FeatureSettingsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<FeatureOverrides>(readClientFeatureOverrides);

  const featureFlags = useMemo(() => resolveFeatureFlags(overrides), [overrides]);

  useEffect(() => {
    onFeatureFlagsChange?.(featureFlags);
  }, [featureFlags, onFeatureFlagsChange]);

  const applyOverrides = (nextOverrides: FeatureOverrides) => {
    writeClientFeatureOverrides(nextOverrides);
    setOverrides(nextOverrides);
    startTransition(() => {
      router.refresh();
    });
  };

  const toggleFeature = (featureKey: FeatureKey) => {
    const nextOverrides = {
      ...overrides,
      [featureKey]: !featureFlags[featureKey],
    };

    applyOverrides(nextOverrides);
  };

  const resetToDefaults = () => {
    applyOverrides({});
  };

  return (
    <Card className="glass-panel border-border/80 p-5 sm:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <p className="soft-chip inline-flex">Feature Control</p>
          <h2 className="mt-3 text-balance font-display text-2xl sm:text-3xl">
            Enable or disable app features
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Changes apply immediately and hidden features are removed from navigation and
            feature routes.
          </p>
        </div>

        <Button
          className="min-h-10 rounded-full px-4 py-2.5 md:w-auto"
          disabled={isPending}
          onClick={resetToDefaults}
          size="sm"
          type="button"
          variant="outline"
        >
          <RefreshCw className={cn("size-4", isPending ? "animate-spin" : undefined)} />
          Reset defaults
        </Button>
      </div>

      <div className="mt-5 space-y-3">
        {FEATURE_KEYS.map((featureKey) => {
          const definition = FEATURE_DEFINITIONS[featureKey];
          const dependencies = definition.dependsOn ?? [];
          const isEnabled = featureFlags[featureKey];
          const hasDisabledDependency = dependencies.some(
            (dependency) => !featureFlags[dependency],
          );
          const toggleBlocked = hasDisabledDependency && !isEnabled;

          return (
            <article
              className="rounded-2xl border border-border/75 bg-background/55 p-4 sm:p-5"
              key={featureKey}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="text-balance text-base leading-tight font-semibold sm:text-lg">
                    {definition.title}
                  </h3>
                  <p className="mt-1 break-words text-sm leading-6 text-muted-foreground sm:text-base">
                    {definition.description}
                  </p>

                  {dependencies.length > 0 ? (
                    <p className="mt-1 break-words text-xs leading-5 text-muted-foreground">
                      Requires: {getDependencyTitles(featureKey)}
                    </p>
                  ) : null}

                  {toggleBlocked ? (
                    <p className="mt-1 break-words text-xs leading-5 text-amber-700 dark:text-amber-300">
                      Enable {getDependencyTitles(featureKey)} first.
                    </p>
                  ) : null}
                </div>

                <Button
                  aria-pressed={isEnabled}
                  className={cn(
                    "min-h-10 w-full rounded-full px-4 py-2.5 text-sm md:min-w-36 md:w-auto",
                    isEnabled
                      ? "border-emerald-500/35 bg-emerald-500/15 text-foreground hover:bg-emerald-500/20"
                      : undefined,
                  )}
                  disabled={toggleBlocked || isPending}
                  onClick={() => toggleFeature(featureKey)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <SlidersHorizontal className="size-4" />
                  {isEnabled ? "Enabled" : "Disabled"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
