export const WHATS_NEW_BANNER_STORAGE_KEY = "prayer-whats-new-banner-v1-dismissed";
export const RAMADAN_BANNER_STORAGE_KEY = "prayer-ramadan-banner-dismissed";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function readBannerDismissed(storageKey: string): boolean {
  if (!hasWindow()) {
    return false;
  }

  try {
    return window.localStorage.getItem(storageKey) === "true";
  } catch {
    return false;
  }
}

export function writeBannerDismissed(storageKey: string): void {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.setItem(storageKey, "true");
  } catch {
    // Ignore storage errors.
  }
}

export function resetBannerPreferencesToDefaults(): void {
  if (!hasWindow()) {
    return;
  }

  try {
    window.localStorage.removeItem(WHATS_NEW_BANNER_STORAGE_KEY);
    window.localStorage.removeItem(RAMADAN_BANNER_STORAGE_KEY);
  } catch {
    // Ignore storage errors.
  }
}
