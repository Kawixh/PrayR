import {
  FEATURE_DEFINITIONS,
  FEATURE_KEYS,
  type FeatureFlags,
  type FeatureKey,
} from "./definitions";

const FEATURE_ENV_KEYS: Record<FeatureKey, string> = {
  prayerTimings: "NEXT_PUBLIC_FEATURE_PRAYER_TIMINGS",
  sehrAndIftarTimes: "NEXT_PUBLIC_FEATURE_SEHR_IFTAR_TIMES",
  sehrAndIftarInTimeline: "NEXT_PUBLIC_FEATURE_SEHR_IFTAR_TIMELINE",
  adhkars: "NEXT_PUBLIC_FEATURE_ADHKARS",
  adhkarOfTheDay: "NEXT_PUBLIC_FEATURE_ADHKAR_OF_THE_DAY",
  islamicCalendar: "NEXT_PUBLIC_FEATURE_ISLAMIC_CALENDAR",
};

function parseFeatureBoolean(value: string | undefined): boolean | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();

  if (
    normalized === "1" ||
    normalized === "true" ||
    normalized === "yes" ||
    normalized === "on"
  ) {
    return true;
  }

  if (
    normalized === "0" ||
    normalized === "false" ||
    normalized === "no" ||
    normalized === "off"
  ) {
    return false;
  }

  return undefined;
}

export function getFeatureDefaultsFromEnv(): FeatureFlags {
  const defaults = {} as FeatureFlags;

  for (const key of FEATURE_KEYS) {
    const envKey = FEATURE_ENV_KEYS[key];
    const parsed = parseFeatureBoolean(process.env[envKey]);
    defaults[key] = parsed ?? FEATURE_DEFINITIONS[key].defaultEnabled;
  }

  return defaults;
}
