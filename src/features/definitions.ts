export const FEATURE_KEYS = [
  "prayerTimings",
  "resourcesTab",
  "sehrAndIftarTimes",
  "adhkars",
  "adhkarOfTheDay",
  "islamicCalendar",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];
export type FeatureFlags = Record<FeatureKey, boolean>;
export type FeatureOverrides = Partial<FeatureFlags>;

type FeatureDefinition = {
  title: string;
  description: string;
  defaultEnabled: boolean;
  tier: "main" | "sub";
  parent?: FeatureKey;
  dependsOn?: readonly FeatureKey[];
};

export const FEATURE_DEFINITIONS: Record<FeatureKey, FeatureDefinition> = {
  prayerTimings: {
    title: "Prayer Timings",
    description: "Daily prayer time dashboard, reminders, and timing cards.",
    defaultEnabled: true,
    tier: "main",
  },
  resourcesTab: {
    title: "Resources Tab",
    description:
      "Show the Resources tab in bottom navigation. The page remains reachable from home.",
    defaultEnabled: true,
    tier: "sub",
    parent: "prayerTimings",
    dependsOn: ["prayerTimings"],
  },
  sehrAndIftarTimes: {
    title: "Sehar & Iftar Times",
    description:
      "Show Sehar (Fajr) and Iftar (Maghrib) times prominently on the dashboard.",
    defaultEnabled: true,
    tier: "main",
    dependsOn: ["prayerTimings"],
  },
  adhkars: {
    title: "Adhkars",
    description: "Adhkar library and prayer-linked adhkar browsing.",
    defaultEnabled: true,
    tier: "main",
  },
  adhkarOfTheDay: {
    title: "Adhkar of the Day",
    description: "Daily highlighted adhkar card on the prayer dashboard.",
    defaultEnabled: true,
    tier: "sub",
    parent: "adhkars",
    dependsOn: ["adhkars"],
  },
  islamicCalendar: {
    title: "Islamic Calendar",
    description: "Current Hijri date and Islamic month calendar on the dashboard.",
    defaultEnabled: true,
    tier: "main",
    dependsOn: ["prayerTimings"],
  },
};

export const FEATURE_OVERRIDES_COOKIE = "prayer_feature_overrides";
export const FEATURE_OVERRIDES_STORAGE_KEY = "prayerFeatureOverrides";
