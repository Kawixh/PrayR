import type { ReactNode } from "react";

import { SETTINGS_PANEL_IDS } from "../_lib/settings-panels";

export function generateStaticParams(): Array<{ section: string }> {
  return SETTINGS_PANEL_IDS.map((section) => ({ section }));
}

export default function SettingsSectionLayout({ children }: { children: ReactNode }) {
  return children;
}
