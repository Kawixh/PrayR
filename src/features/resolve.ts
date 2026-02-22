import {
  DEPRECATED_FRONTEND_FEATURE_KEY_SET,
  FEATURE_DEFINITIONS,
  FEATURE_KEYS,
  type FeatureFlags,
  type FeatureOverrides,
} from "./definitions";
import { getFeatureDefaultsFromEnv } from "./env-defaults";

function applyDeprecatedFrontendFeatures(input: FeatureFlags): FeatureFlags {
  const resolved = { ...input };

  for (const key of FEATURE_KEYS) {
    if (DEPRECATED_FRONTEND_FEATURE_KEY_SET.has(key)) {
      resolved[key] = false;
    }
  }

  return resolved;
}

function applyFeatureDependencies(input: FeatureFlags): FeatureFlags {
  const resolved = { ...input };

  for (const key of FEATURE_KEYS) {
    const dependencies = FEATURE_DEFINITIONS[key].dependsOn;

    if (!dependencies || dependencies.length === 0) {
      continue;
    }

    const hasDisabledDependency = dependencies.some((dependency) => !resolved[dependency]);

    if (hasDisabledDependency) {
      resolved[key] = false;
    }
  }

  return resolved;
}

export function resolveFeatureFlags(overrides: FeatureOverrides = {}): FeatureFlags {
  const defaults = getFeatureDefaultsFromEnv();
  const merged = { ...defaults };

  for (const key of FEATURE_KEYS) {
    if (typeof overrides[key] === "boolean") {
      merged[key] = overrides[key];
    }
  }

  return applyFeatureDependencies(applyDeprecatedFrontendFeatures(merged));
}
