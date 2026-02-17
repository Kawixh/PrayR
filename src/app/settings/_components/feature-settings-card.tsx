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

function getParentTitle(featureKey: FeatureKey): string | null {
  const parent = FEATURE_DEFINITIONS[featureKey].parent;
  return parent ? FEATURE_DEFINITIONS[parent].title : null;
}

type FeatureToggleRowProps = {
  featureFlags: FeatureFlags;
  featureKey: FeatureKey;
  isPending: boolean;
  onToggleFeature: (featureKey: FeatureKey) => void;
};

function FeatureToggleRow({
  featureFlags,
  featureKey,
  isPending,
  onToggleFeature,
}: FeatureToggleRowProps) {
  const definition = FEATURE_DEFINITIONS[featureKey];
  const dependencies = definition.dependsOn ?? [];
  const isEnabled = featureFlags[featureKey];
  const hasDisabledDependency = dependencies.some(
    (dependency) => !featureFlags[dependency],
  );
  const toggleBlocked = hasDisabledDependency && !isEnabled;
  const isSubFeature = definition.tier === "sub";
  const parentTitle = isSubFeature ? getParentTitle(featureKey) : null;

  return (
    <article
      className={cn(
        "rounded-xl border p-3 sm:p-4",
        isSubFeature ? "border-dashed bg-muted/30" : "border-solid bg-card/70",
      )}
      key={featureKey}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-[0.16em] uppercase",
                isSubFeature
                  ? "border-border/80 bg-background/75 text-muted-foreground"
                  : "border-primary/30 bg-primary/10 text-primary",
              )}
            >
              {isSubFeature ? "Sub Feature" : "Main Feature"}
            </p>
            {parentTitle ? (
              <p className="text-xs text-muted-foreground">Parent: {parentTitle}</p>
            ) : null}
          </div>
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
  const subFeatureKeys = FEATURE_KEYS.filter(
    (featureKey) => FEATURE_DEFINITIONS[featureKey].tier === "sub",
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

      <CardContent className="space-y-6">
        <section className="space-y-2.5">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Main Features
          </h3>
          {mainFeatureKeys.map((featureKey) => (
            <FeatureToggleRow
              featureFlags={featureFlags}
              featureKey={featureKey}
              isPending={isPending}
              key={featureKey}
              onToggleFeature={toggleFeature}
            />
          ))}
        </section>

        <section className="space-y-2.5">
          <h3 className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Sub Features
          </h3>
          {subFeatureKeys.map((featureKey) => (
            <FeatureToggleRow
              featureFlags={featureFlags}
              featureKey={featureKey}
              isPending={isPending}
              key={featureKey}
              onToggleFeature={toggleFeature}
            />
          ))}
        </section>
      </CardContent>
    </Card>
  );
}
