export const FEATURE_KEYS = [
  "prayerTimings",
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
  dependsOn?: readonly FeatureKey[];
};

export const FEATURE_DEFINITIONS: Record<FeatureKey, FeatureDefinition> = {
  prayerTimings: {
    title: "Prayer Timings",
    description: "Daily prayer time dashboard, reminders, and timing cards.",
    defaultEnabled: true,
  },
  adhkars: {
    title: "Adhkars",
    description: "Adhkar library and prayer-linked adhkar browsing.",
    defaultEnabled: true,
  },
  adhkarOfTheDay: {
    title: "Adhkar of the Day",
    description: "Daily highlighted adhkar card on the prayer dashboard.",
    defaultEnabled: true,
    dependsOn: ["adhkars"],
  },
  islamicCalendar: {
    title: "Islamic Calendar",
    description: "Current Hijri date and Islamic month calendar on the dashboard.",
    defaultEnabled: true,
    dependsOn: ["prayerTimings"],
  },
};

export const FEATURE_OVERRIDES_COOKIE = "prayer_feature_overrides";
export const FEATURE_OVERRIDES_STORAGE_KEY = "prayerFeatureOverrides";
