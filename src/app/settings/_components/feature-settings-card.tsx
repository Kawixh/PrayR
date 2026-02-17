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
import { ChevronDown, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

function getDependencyTitles(featureKey: FeatureKey): string {
  const dependencies = FEATURE_DEFINITIONS[featureKey].dependsOn ?? [];
  return dependencies.map((dependency) => FEATURE_DEFINITIONS[dependency].title).join(", ");
}

function getSubFeatures(parent: FeatureKey): FeatureKey[] {
  return FEATURE_KEYS.filter(
    (featureKey) =>
      FEATURE_DEFINITIONS[featureKey].tier === "sub" &&
      FEATURE_DEFINITIONS[featureKey].parent === parent,
  );
}

function isToggleBlocked(featureFlags: FeatureFlags, featureKey: FeatureKey): boolean {
  const dependencies = FEATURE_DEFINITIONS[featureKey].dependsOn ?? [];
  const hasDisabledDependency = dependencies.some((dependency) => !featureFlags[dependency]);
  const isEnabled = featureFlags[featureKey];

  return hasDisabledDependency && !isEnabled;
}

type FeatureSwitchProps = {
  featureFlags: FeatureFlags;
  featureKey: FeatureKey;
  isPending: boolean;
  onToggleFeature: (featureKey: FeatureKey) => void;
  style: "main" | "sub";
};

function FeatureSwitch({
  featureFlags,
  featureKey,
  isPending,
  onToggleFeature,
  style,
}: FeatureSwitchProps) {
  const definition = FEATURE_DEFINITIONS[featureKey];
  const blocked = isToggleBlocked(featureFlags, featureKey);
  const dependencies = definition.dependsOn ?? [];
  const isEnabled = featureFlags[featureKey];

  return (
    <article
      className={cn(
        "rounded-xl border p-3 sm:p-4",
        style === "main" ? "border-border/80 bg-card/70" : "border-dashed bg-muted/35",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <h3 className={cn("font-semibold", style === "main" ? "text-base" : "text-sm")}>
            {definition.title}
          </h3>
          <p className="text-sm text-muted-foreground">{definition.description}</p>
          {dependencies.length > 0 ? (
            <p className="text-xs text-muted-foreground">
              Requires: {getDependencyTitles(featureKey)}
            </p>
          ) : null}
          {blocked ? (
            <p className="text-xs text-primary">
              Enable {getDependencyTitles(featureKey)} first.
            </p>
          ) : null}
        </div>

        <Button
          aria-pressed={isEnabled}
          className="w-full sm:w-auto"
          disabled={blocked || isPending}
          onClick={() => onToggleFeature(featureKey)}
          size="sm"
          type="button"
          variant={isEnabled ? "secondary" : "outline"}
        >
          {isEnabled ? "On" : "Off"}
        </Button>
      </div>
    </article>
  );
}

type FeatureSettingsCardProps = {
  onFeatureFlagsChange?: (featureFlags: FeatureFlags) => void;
};

export function FeatureSettingsCard({ onFeatureFlagsChange }: FeatureSettingsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<FeatureOverrides>(readClientFeatureOverrides);

  const featureFlags = useMemo(() => resolveFeatureFlags(overrides), [overrides]);
  const mainFeatureKeys = FEATURE_KEYS.filter(
    (featureKey) => FEATURE_DEFINITIONS[featureKey].tier === "main",
  );

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
    applyOverrides({
      ...overrides,
      [featureKey]: !featureFlags[featureKey],
    });
  };

  const resetToDefaults = () => {
    resetBannerPreferencesToDefaults();
    applyOverrides({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Settings</CardTitle>
        <CardDescription>
          Structured feature controls with parent features and collapsible sub features.
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

      <CardContent className="space-y-3">
        {mainFeatureKeys.map((featureKey) => {
          const subFeatures = getSubFeatures(featureKey);
          const hasSubFeatures = subFeatures.length > 0;

          return (
            <section className="rounded-2xl border border-border/80 p-3 sm:p-4" key={featureKey}>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  Main Feature
                </p>
                {hasSubFeatures ? (
                  <p className="text-xs text-muted-foreground">
                    {subFeatures.length} sub feature{subFeatures.length === 1 ? "" : "s"}
                  </p>
                ) : null}
              </div>

              <FeatureSwitch
                featureFlags={featureFlags}
                featureKey={featureKey}
                isPending={isPending}
                onToggleFeature={toggleFeature}
                style="main"
              />

              {hasSubFeatures ? (
                <details className="group mt-3 rounded-xl border border-border/70 bg-background/55 p-3">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold">
                    <span>Sub Features</span>
                    <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-3 space-y-2.5">
                    {subFeatures.map((subFeatureKey) => (
                      <FeatureSwitch
                        featureFlags={featureFlags}
                        featureKey={subFeatureKey}
                        isPending={isPending}
                        key={subFeatureKey}
                        onToggleFeature={toggleFeature}
                        style="sub"
                      />
                    ))}
                  </div>
                </details>
              ) : null}
            </section>
          );
        })}
      </CardContent>
    </Card>
  );
}
