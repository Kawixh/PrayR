import { redirect } from "next/navigation";

import { getSettingsPanelPath } from "./_lib/settings-panels";

export default function SettingsPage() {
  redirect(getSettingsPanelPath("general"));
}
