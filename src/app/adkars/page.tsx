import { getServerFeatureFlags } from "@/features/server";
import { notFound, permanentRedirect } from "next/navigation";

export default async function AdkarsAliasPage() {
  const featureFlags = await getServerFeatureFlags();

  if (!featureFlags.adhkars) {
    notFound();
  }

  permanentRedirect("/adhkars");
}
