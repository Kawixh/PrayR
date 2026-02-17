"use client";

import { resetBannerPreferencesToDefaults } from "@/app/_utils/banner-preferences";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    resetBannerPreferencesToDefaults();
    applyOverrides({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flags</CardTitle>
        <CardDescription>
          Turn app modules on or off. Hidden features are removed from navigation and routes.
        </CardDescription>
        <CardAction>
          <Button
            disabled={isPending}
            onClick={resetToDefaults}
            size="sm"
            type="button"
            variant="outline"
          >
            <RefreshCw className={cn("size-4", isPending ? "animate-spin" : undefined)} />
            Reset defaults
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-2.5">
        {FEATURE_KEYS.map((featureKey) => {
          const definition = FEATURE_DEFINITIONS[featureKey];
          const dependencies = definition.dependsOn ?? [];
          const isEnabled = featureFlags[featureKey];
          const hasDisabledDependency = dependencies.some(
            (dependency) => !featureFlags[dependency],
          );
          const toggleBlocked = hasDisabledDependency && !isEnabled;

          return (
            <article className="rounded-lg border p-3 sm:p-4" key={featureKey}>
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
                    <p className="text-xs text-primary">
                      Enable {getDependencyTitles(featureKey)} first.
                    </p>
                  ) : null}
                </div>

                <Button
                  aria-pressed={isEnabled}
                  className="w-full sm:w-auto"
                  disabled={toggleBlocked || isPending}
                  onClick={() => toggleFeature(featureKey)}
                  size="sm"
                  type="button"
                  variant={isEnabled ? "secondary" : "outline"}
                >
                  {isEnabled ? "On" : "Off"}
                </Button>
              </div>
            </article>
          );
        })}
      </CardContent>
    </Card>
  );
}
