"use client";

import {
  FEATURE_OVERRIDES_COOKIE,
  FEATURE_OVERRIDES_STORAGE_KEY,
  type FeatureOverrides,
} from "./definitions";
import {
  parseFeatureOverrides,
  serializeFeatureOverrides,
} from "./serialization";

const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

function readCookieValue(name: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const cookiePair = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookiePair) {
    return undefined;
  }

  return cookiePair.slice(name.length + 1);
}

export function readClientFeatureOverrides(): FeatureOverrides {
  if (typeof window === "undefined") {
    return {};
  }

  const saved = window.localStorage.getItem(FEATURE_OVERRIDES_STORAGE_KEY);

  if (saved) {
    return parseFeatureOverrides(saved);
  }

  const cookieValue = readCookieValue(FEATURE_OVERRIDES_COOKIE);
  return parseFeatureOverrides(cookieValue);
}

export function writeClientFeatureOverrides(overrides: FeatureOverrides): void {
  if (typeof window === "undefined") {
    return;
  }

  const serialized = serializeFeatureOverrides(overrides);
  const encoded = encodeURIComponent(serialized);

  window.localStorage.setItem(FEATURE_OVERRIDES_STORAGE_KEY, serialized);
  document.cookie =
    `${FEATURE_OVERRIDES_COOKIE}=${encoded}; Max-Age=${ONE_YEAR_IN_SECONDS}; Path=/; SameSite=Lax`;
}
