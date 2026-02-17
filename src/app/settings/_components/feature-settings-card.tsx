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
import { RefreshCw } from "lucide-react";
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
    <Card className="border-border/80 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold sm:text-xl">Feature Flags</h2>
          <p className="text-sm text-muted-foreground">
            Turn app modules on or off. Hidden features are removed from navigation and routes.
          </p>
        </div>
        <Button
          className="h-9 px-3"
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

      <div className="mt-4 space-y-2.5">
        {FEATURE_KEYS.map((featureKey) => {
          const definition = FEATURE_DEFINITIONS[featureKey];
          const dependencies = definition.dependsOn ?? [];
          const isEnabled = featureFlags[featureKey];
          const hasDisabledDependency = dependencies.some(
            (dependency) => !featureFlags[dependency],
          );
          const toggleBlocked = hasDisabledDependency && !isEnabled;

          return (
            <article className="rounded-lg border border-border/70 p-3 sm:p-4" key={featureKey}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold sm:text-base">{definition.title}</h3>
                  <p className="text-sm text-muted-foreground">{definition.description}</p>
                  {dependencies.length > 0 ? (
                    <p className="text-xs text-muted-foreground">
                      Requires: {getDependencyTitles(featureKey)}
                    </p>
                  ) : null}
                  {toggleBlocked ? (
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Enable {getDependencyTitles(featureKey)} first.
                    </p>
                  ) : null}
                </div>

                <Button
                  aria-pressed={isEnabled}
                  className={cn(
                    "h-9 w-full sm:w-auto",
                    isEnabled ? "border-primary/40 bg-primary/10 hover:bg-primary/15" : undefined,
                  )}
                  disabled={toggleBlocked || isPending}
                  onClick={() => toggleFeature(featureKey)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {isEnabled ? "On" : "Off"}
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </Card>
  );
}
