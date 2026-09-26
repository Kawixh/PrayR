"use client";

import { notFound, useParams } from "next/navigation";

import { SettingsRouteClient } from "../_components/settings-route-client";
import { isSettingsPanelId } from "../_lib/settings-panels";

// A client page reads params from the router, so moving between settings
// sections never waits on the server.
export default function SettingsSectionPage() {
  const { section } = useParams<{ section: string }>();
  const devMenuEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_MENU !== "0";

  if (!isSettingsPanelId(section)) {
    notFound();
  }

  if (section === "developer" && !devMenuEnabled) {
    notFound();
  }

  return <SettingsRouteClient activePanel={section} />;
}
