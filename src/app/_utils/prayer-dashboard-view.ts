export const PRAYER_DASHBOARD_VIEW_STORAGE_KEY = "prayerDashboardView";

export const PRAYER_DASHBOARD_VIEW_OPTIONS = [
  "cards",
  "timeline",
] as const;

export type PrayerDashboardView = (typeof PRAYER_DASHBOARD_VIEW_OPTIONS)[number];

export function isPrayerDashboardView(value: unknown): value is PrayerDashboardView {
  return (
    typeof value === "string" &&
    PRAYER_DASHBOARD_VIEW_OPTIONS.includes(value as PrayerDashboardView)
  );
}

export function readPrayerDashboardViewFromStorage(): PrayerDashboardView {
  if (typeof window === "undefined") {
    return "cards";
  }

  const storedValue = window.localStorage.getItem(PRAYER_DASHBOARD_VIEW_STORAGE_KEY);

  if (!storedValue) {
    return "cards";
  }

  return isPrayerDashboardView(storedValue) ? storedValue : "cards";
}

export function writePrayerDashboardViewToStorage(view: PrayerDashboardView): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PRAYER_DASHBOARD_VIEW_STORAGE_KEY, view);
}
