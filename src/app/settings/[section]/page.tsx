import { notFound } from "next/navigation";

import { SettingsRouteClient } from "../_components/settings-route-client";
import {
  isSettingsPanelId,
  SETTINGS_PANEL_IDS,
} from "../_lib/settings-panels";

type SettingsSectionPageProps = {
  params: Promise<{
    section: string;
  }>;
};

export function generateStaticParams(): Array<{ section: string }> {
  return SETTINGS_PANEL_IDS.map((section) => ({ section }));
}

export default async function SettingsSectionPage({
  params,
}: SettingsSectionPageProps) {
  const { section } = await params;
  const devMenuEnabled = process.env.NEXT_PUBLIC_ENABLE_DEV_MENU !== "0";

  if (!isSettingsPanelId(section)) {
    notFound();
  }

  if (section === "developer" && !devMenuEnabled) {
    notFound();
  }

  return <SettingsRouteClient activePanel={section} />;
}
