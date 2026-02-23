"use client";

import { resetBannerPreferencesToDefaults } from "@/app/_utils/banner-preferences";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { readClientFeatureOverrides, writeClientFeatureOverrides } from "@/features/client";
import {
  DEPRECATED_FRONTEND_FEATURE_KEY_SET,
  FEATURE_DEFINITIONS,
  FEATURE_KEYS,
  type FeatureFlags,
  type FeatureKey,
  type FeatureOverrides,
} from "@/features/definitions";
import { resolveFeatureFlags } from "@/features/resolve";
import { cn } from "@/lib/utils";
import { ChevronRight, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

function getDependencyTitles(featureKey: FeatureKey): string {
  const dependencies = FEATURE_DEFINITIONS[featureKey].dependsOn ?? [];
  return dependencies.map((dependency) => FEATURE_DEFINITIONS[dependency].title).join(", ");
}

function getSubFeatures(parent: FeatureKey): FeatureKey[] {
  return FEATURE_KEYS.filter(
    (featureKey) =>
      !DEPRECATED_FRONTEND_FEATURE_KEY_SET.has(featureKey) &&
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

type FeatureSettingsCardProps = {
  className?: string;
  onFeatureFlagsChange?: (featureFlags: FeatureFlags) => void;
};

export function FeatureSettingsCard({
  className,
  onFeatureFlagsChange,
}: FeatureSettingsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<FeatureOverrides>(readClientFeatureOverrides);

  const featureFlags = useMemo(() => resolveFeatureFlags(overrides), [overrides]);
  const mainFeatureKeys = FEATURE_KEYS.filter(
    (featureKey) =>
      !DEPRECATED_FRONTEND_FEATURE_KEY_SET.has(featureKey) &&
      FEATURE_DEFINITIONS[featureKey].tier === "main",
  );
  const featureTree = useMemo(
    () =>
      mainFeatureKeys.map((mainFeatureKey) => ({
        mainFeatureKey,
        subFeatureKeys: getSubFeatures(mainFeatureKey),
      })),
    [mainFeatureKeys],
  );
  const navigableFeatureKeys = useMemo(
    () => featureTree.flatMap(({ mainFeatureKey, subFeatureKeys }) => [mainFeatureKey, ...subFeatureKeys]),
    [featureTree],
  );
  const [requestedActiveFeatureKey, setRequestedActiveFeatureKey] = useState<FeatureKey>(
    () => navigableFeatureKeys[0] ?? "prayerTimings",
  );

  useEffect(() => {
    onFeatureFlagsChange?.(featureFlags);
  }, [featureFlags, onFeatureFlagsChange]);
  const activeFeatureKey = navigableFeatureKeys.includes(requestedActiveFeatureKey)
    ? requestedActiveFeatureKey
    : (navigableFeatureKeys[0] ?? "prayerTimings");

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
  const activeDefinition = FEATURE_DEFINITIONS[activeFeatureKey];
  const activeDependencies = activeDefinition.dependsOn ?? [];
  const activeBlocked = isToggleBlocked(featureFlags, activeFeatureKey);
  const activeEnabled = featureFlags[activeFeatureKey];
  const activeSubFeatureKeys =
    activeDefinition.tier === "main" ? getSubFeatures(activeFeatureKey) : [];
  const activeParentKey =
    activeDefinition.tier === "sub" ? activeDefinition.parent : undefined;
  const activeParentTitle =
    activeParentKey ? FEATURE_DEFINITIONS[activeParentKey].title : null;

  return (
    <section className={cn("space-y-4", className)}>
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Feature Settings</h3>
          <p className="text-sm text-muted-foreground">
            Select one feature from the tree and configure it in the detail pane.
          </p>
        </div>
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
      </header>

      <div className="grid gap-4 md:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-border/80 bg-muted/20 p-3 sm:p-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Feature Tree
          </p>

          <ul className="mt-3 space-y-3 border-l border-border/80 pl-3">
            {featureTree.map(({ mainFeatureKey, subFeatureKeys }) => (
              <li className="space-y-1.5" key={mainFeatureKey}>
                <button
                  className={cn(
                    "focus-visible:ring-ring/50 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-[3px]",
                    activeFeatureKey === mainFeatureKey
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/60",
                  )}
                  onClick={() => setRequestedActiveFeatureKey(mainFeatureKey)}
                  type="button"
                >
                  <ChevronRight
                    className={cn(
                      "mt-0.5 size-3.5 shrink-0",
                      activeFeatureKey === mainFeatureKey
                        ? "text-primary"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">
                      {FEATURE_DEFINITIONS[mainFeatureKey].title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {featureFlags[mainFeatureKey] ? "Enabled" : "Disabled"}
                    </span>
                  </span>
                </button>

                {subFeatureKeys.length > 0 ? (
                  <ul className="space-y-1 border-l border-border/70 pl-2">
                    {subFeatureKeys.map((subFeatureKey) => (
                      <li key={subFeatureKey}>
                        <button
                          className={cn(
                            "focus-visible:ring-ring/50 flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left outline-none transition-colors focus-visible:ring-[3px]",
                            activeFeatureKey === subFeatureKey
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/60",
                          )}
                          onClick={() => setRequestedActiveFeatureKey(subFeatureKey)}
                          type="button"
                        >
                          <ChevronRight
                            className={cn(
                              "mt-0.5 size-3.5 shrink-0",
                              activeFeatureKey === subFeatureKey
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">
                              {FEATURE_DEFINITIONS[subFeatureKey].title}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {featureFlags[subFeatureKey] ? "Enabled" : "Disabled"}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </aside>

        <section className="space-y-5 rounded-2xl border border-border/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                {activeDefinition.tier === "main" ? "Main Feature" : "Sub Feature"}
              </p>
              <h4 className="text-lg font-semibold">{activeDefinition.title}</h4>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                {activeDefinition.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border/70 bg-background/75 px-2.5 py-2">
              <div className="text-right">
                <p className="text-xs font-semibold text-foreground">
                  {activeEnabled ? "Enabled" : "Disabled"}
                </p>
                <p className="text-[11px] leading-4 text-muted-foreground">
                  {activeBlocked
                    ? `Requires ${getDependencyTitles(activeFeatureKey)}`
                    : activeEnabled
                      ? "Feature is active."
                      : "Feature is inactive."}
                </p>
              </div>
              <Switch
                aria-label={`Toggle ${activeDefinition.title}`}
                checked={activeEnabled}
                disabled={activeBlocked || isPending}
                onCheckedChange={() => toggleFeature(activeFeatureKey)}
              />
            </div>
          </div>

          {activeDependencies.length > 0 ? (
            <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Dependencies
              </p>
              <p className="text-sm text-muted-foreground">
                Requires: {getDependencyTitles(activeFeatureKey)}
              </p>
              {activeBlocked ? (
                <p className="text-sm text-primary">
                  Enable {getDependencyTitles(activeFeatureKey)} first.
                </p>
              ) : null}
            </div>
          ) : null}

          {activeParentKey && activeParentTitle ? (
            <div className="space-y-1.5 rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Parent Feature
              </p>
              <button
                className="text-sm font-medium text-primary hover:underline"
                onClick={() => setRequestedActiveFeatureKey(activeParentKey)}
                type="button"
              >
                {activeParentTitle}
              </button>
            </div>
          ) : null}

          {activeSubFeatureKeys.length > 0 ? (
            <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3">
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                Sub Features
              </p>
              <ul className="space-y-1.5">
                {activeSubFeatureKeys.map((subFeatureKey) => (
                  <li key={subFeatureKey}>
                    <button
                      className="hover:bg-accent/60 focus-visible:ring-ring/50 flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left outline-none focus-visible:ring-[3px]"
                      onClick={() => setRequestedActiveFeatureKey(subFeatureKey)}
                      type="button"
                    >
                      <span>
                        <span className="block text-sm font-medium">
                          {FEATURE_DEFINITIONS[subFeatureKey].title}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {FEATURE_DEFINITIONS[subFeatureKey].description}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {featureFlags[subFeatureKey] ? "Enabled" : "Disabled"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
