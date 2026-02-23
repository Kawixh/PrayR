"use client";

import { Switch } from "@/components/ui/switch";
import {
  readClientFeatureOverrides,
  writeClientFeatureOverrides,
} from "@/features/client";
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
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

function getDependencyTitles(featureKey: FeatureKey): string {
  const dependencies = FEATURE_DEFINITIONS[featureKey].dependsOn ?? [];
  return dependencies
    .map((dependency) => FEATURE_DEFINITIONS[dependency].title)
    .join(", ");
}

function getSubFeatures(parent: FeatureKey): FeatureKey[] {
  return FEATURE_KEYS.filter(
    (featureKey) =>
      !DEPRECATED_FRONTEND_FEATURE_KEY_SET.has(featureKey) &&
      FEATURE_DEFINITIONS[featureKey].tier === "sub" &&
      FEATURE_DEFINITIONS[featureKey].parent === parent,
  );
}

function isToggleBlocked(
  featureFlags: FeatureFlags,
  featureKey: FeatureKey,
): boolean {
  const dependencies = FEATURE_DEFINITIONS[featureKey].dependsOn ?? [];
  const hasDisabledDependency = dependencies.some(
    (dependency) => !featureFlags[dependency],
  );
  const isEnabled = featureFlags[featureKey];

  return hasDisabledDependency && !isEnabled;
}

type FeatureSettingsCardProps = {
  className?: string;
  onFeatureFlagsChange?: (featureFlags: FeatureFlags) => void;
};

type FeatureGroup = {
  mainFeatureKey: FeatureKey;
  subFeatureKeys: FeatureKey[];
};

export function FeatureSettingsCard({
  className,
  onFeatureFlagsChange,
}: FeatureSettingsCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrides, setOverrides] = useState<FeatureOverrides>(
    readClientFeatureOverrides,
  );

  const featureFlags = useMemo(
    () => resolveFeatureFlags(overrides),
    [overrides],
  );
  const mainFeatureKeys = useMemo(
    () =>
      FEATURE_KEYS.filter(
        (featureKey) =>
          !DEPRECATED_FRONTEND_FEATURE_KEY_SET.has(featureKey) &&
          FEATURE_DEFINITIONS[featureKey].tier === "main",
      ),
    [],
  );
  const featureGroups = useMemo<FeatureGroup[]>(
    () =>
      mainFeatureKeys.map((mainFeatureKey) => ({
        mainFeatureKey,
        subFeatureKeys: getSubFeatures(mainFeatureKey),
      })),
    [mainFeatureKeys],
  );
  const visibleFeatureKeys = useMemo(
    () =>
      featureGroups.flatMap(({ mainFeatureKey, subFeatureKeys }) => [
        mainFeatureKey,
        ...subFeatureKeys,
      ]),
    [featureGroups],
  );
  const enabledFeatureCount = useMemo(
    () =>
      visibleFeatureKeys.reduce(
        (count, featureKey) => count + (featureFlags[featureKey] ? 1 : 0),
        0,
      ),
    [featureFlags, visibleFeatureKeys],
  );
  const blockedFeatureCount = useMemo(
    () =>
      visibleFeatureKeys.reduce(
        (count, featureKey) =>
          count + (isToggleBlocked(featureFlags, featureKey) ? 1 : 0),
        0,
      ),
    [featureFlags, visibleFeatureKeys],
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

  return (
    <section className={cn("space-y-4", className)}>
      <div className="grid gap-2 sm:grid-cols-3">
        <article className="rounded-xl border border-border/80 bg-muted/20 px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">Available</p>
          <p className="text-lg font-semibold">{visibleFeatureKeys.length}</p>
        </article>
        <article className="rounded-xl border border-border/80 bg-muted/20 px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">Enabled</p>
          <p className="text-lg font-semibold text-primary">
            {enabledFeatureCount}
          </p>
        </article>
        <article className="rounded-xl border border-border/80 bg-muted/20 px-3 py-2.5">
          <p className="text-xs font-medium text-muted-foreground">Blocked</p>
          <p className="text-lg font-semibold text-amber-600 dark:text-amber-400">
            {blockedFeatureCount}
          </p>
        </article>
      </div>

      <div className="space-y-3">
        {featureGroups.map(({ mainFeatureKey, subFeatureKeys }) => {
          const mainDefinition = FEATURE_DEFINITIONS[mainFeatureKey];
          const mainDependencies = mainDefinition.dependsOn ?? [];
          const mainEnabled = featureFlags[mainFeatureKey];
          const mainBlocked = isToggleBlocked(featureFlags, mainFeatureKey);

          return (
            <article key={mainFeatureKey}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <h4 className="text-base font-semibold">
                    {mainDefinition.title}
                  </h4>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {mainDefinition.description}
                  </p>
                  {mainDependencies.length > 0 ? (
                    <p className="text-xs leading-5 text-muted-foreground">
                      Depends on: {getDependencyTitles(mainFeatureKey)}
                    </p>
                  ) : null}
                  {mainBlocked ? (
                    <p className="text-xs leading-5 text-primary">
                      Enable {getDependencyTitles(mainFeatureKey)} first.
                    </p>
                  ) : null}
                </div>

                <Switch
                  aria-label={`Toggle ${mainDefinition.title}`}
                  checked={mainEnabled}
                  disabled={mainBlocked || isPending}
                  onCheckedChange={() => toggleFeature(mainFeatureKey)}
                />
              </div>

              {subFeatureKeys.length > 0 ? (
                <div className="mt-4 space-y-2 border-t border-border/70 pt-3">
                  <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                    Sub Features
                  </p>
                  <div className="space-y-2">
                    {subFeatureKeys.map((subFeatureKey) => {
                      const subDefinition = FEATURE_DEFINITIONS[subFeatureKey];
                      const subDependencies = subDefinition.dependsOn ?? [];
                      const subEnabled = featureFlags[subFeatureKey];
                      const subBlocked = isToggleBlocked(
                        featureFlags,
                        subFeatureKey,
                      );

                      return (
                        <div key={subFeatureKey} className="flex items-center">
                          <div className="min-w-0 flex-1 space-y-1">
                            <p className="text-sm font-medium">
                              {subDefinition.title}
                            </p>
                            <p className="text-xs leading-5 text-muted-foreground">
                              {subDefinition.description}
                            </p>
                            {subDependencies.length > 0 ? (
                              <p className="text-xs leading-5 text-muted-foreground">
                                Depends on: {getDependencyTitles(subFeatureKey)}
                              </p>
                            ) : null}
                            {subBlocked ? (
                              <p className="text-xs leading-5 text-primary">
                                Enable {getDependencyTitles(subFeatureKey)}{" "}
                                first.
                              </p>
                            ) : null}
                          </div>

                          <Switch
                            aria-label={`Toggle ${subDefinition.title}`}
                            checked={subEnabled}
                            disabled={subBlocked || isPending}
                            onCheckedChange={() => toggleFeature(subFeatureKey)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
