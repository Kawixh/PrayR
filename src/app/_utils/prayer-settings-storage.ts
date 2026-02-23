export const PRAYER_SETTINGS_STORAGE_KEY = "prayerSettings";
export const PRAYER_SETTINGS_UPDATED_EVENT = "prayer-settings-updated";

export function notifyPrayerSettingsUpdated(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(PRAYER_SETTINGS_UPDATED_EVENT));
}
