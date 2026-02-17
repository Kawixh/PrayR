export const FEATURE_KEYS = [
  "prayerTimings",
  "sehrAndIftarTimes",
  "sehrAndIftarInTimeline",
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
  sehrAndIftarTimes: {
    title: "Sehar & Iftar Times",
    description:
      "Show Sehar (Imsak) and Iftar (Maghrib) times prominently on the dashboard.",
    defaultEnabled: true,
    tier: "main",
    dependsOn: ["prayerTimings"],
  },
  sehrAndIftarInTimeline: {
    title: "Sehar & Iftar in Timeline",
    description: "Show Sehar and Iftar highlights inside the timeline view header.",
    defaultEnabled: true,
    tier: "sub",
    parent: "sehrAndIftarTimes",
    dependsOn: ["sehrAndIftarTimes"],
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
