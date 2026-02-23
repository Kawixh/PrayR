export const SETTINGS_PANEL_IDS = [
  "general",
  "prayers",
  "display",
  "features",
  "developer",
] as const;

export type SettingsPanelId = (typeof SETTINGS_PANEL_IDS)[number];
export type SettingsPanelPath = `/settings/${SettingsPanelId}`;

export const SETTINGS_PANEL_PATHS: Record<SettingsPanelId, SettingsPanelPath> = {
  general: "/settings/general",
  prayers: "/settings/prayers",
  display: "/settings/display",
  features: "/settings/features",
  developer: "/settings/developer",
};

export function isSettingsPanelId(value: string): value is SettingsPanelId {
  return SETTINGS_PANEL_IDS.includes(value as SettingsPanelId);
}

export function getSettingsPanelPath(panelId: SettingsPanelId): SettingsPanelPath {
  return SETTINGS_PANEL_PATHS[panelId];
}
