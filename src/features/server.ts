import { cookies } from "next/headers";
import { FEATURE_OVERRIDES_COOKIE, type FeatureFlags } from "./definitions";
import { resolveFeatureFlags } from "./resolve";
import { parseFeatureOverrides } from "./serialization";

export async function getServerFeatureFlags(): Promise<FeatureFlags> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(FEATURE_OVERRIDES_COOKIE)?.value;
  const overrides = parseFeatureOverrides(cookieValue);

  return resolveFeatureFlags(overrides);
}
