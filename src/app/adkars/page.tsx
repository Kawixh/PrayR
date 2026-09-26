import { getServerFeatureFlags } from "@/features/server";
import { notFound, permanentRedirect } from "next/navigation";

// Feature-flagged route that 404s via notFound(); block so the status code stays correct.
export const instant = false;

export default async function AdkarsAliasPage() {
  const featureFlags = await getServerFeatureFlags();

  if (!featureFlags.adhkars) {
    notFound();
  }

  permanentRedirect("/adhkars");
}
