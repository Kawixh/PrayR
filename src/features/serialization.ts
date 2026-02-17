import {
  FEATURE_KEYS,
  type FeatureFlags,
  type FeatureOverrides,
} from "./definitions";

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function pickBooleanOverrides(candidate: unknown): FeatureOverrides {
  if (!candidate || typeof candidate !== "object") {
    return {};
  }

  const raw = candidate as Partial<Record<keyof FeatureFlags, unknown>>;
  const overrides: FeatureOverrides = {};

  for (const key of FEATURE_KEYS) {
    if (typeof raw[key] === "boolean") {
      overrides[key] = raw[key];
    }
  }

  return overrides;
}

export function parseFeatureOverrides(rawValue: string | undefined): FeatureOverrides {
  if (!rawValue) {
    return {};
  }

  const decoded = decodeCookieValue(rawValue);

  try {
    const parsed = JSON.parse(decoded) as unknown;
    return pickBooleanOverrides(parsed);
  } catch {
    return {};
  }
}

export function serializeFeatureOverrides(overrides: FeatureOverrides): string {
  return JSON.stringify(pickBooleanOverrides(overrides));
}
