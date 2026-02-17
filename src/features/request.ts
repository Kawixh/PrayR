import type { NextRequest } from "next/server";
import { FEATURE_OVERRIDES_COOKIE, type FeatureFlags } from "./definitions";
import { resolveFeatureFlags } from "./resolve";
import { parseFeatureOverrides } from "./serialization";

export function getRequestFeatureFlags(request: NextRequest): FeatureFlags {
  const cookieValue = request.cookies.get(FEATURE_OVERRIDES_COOKIE)?.value;
  const overrides = parseFeatureOverrides(cookieValue);

  return resolveFeatureFlags(overrides);
}
