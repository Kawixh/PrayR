export const HOMEPAGE_SEO_CONTENT_COOKIE_KEY = "prayer_homepage_seo_content";
export const HOMEPAGE_SEO_CONTENT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;
export const DEFAULT_SHOW_HOMEPAGE_SEO_CONTENT = true;

export function normalizeShowHomepageSeoContent(value: unknown): boolean {
  return typeof value === "boolean"
    ? value
    : DEFAULT_SHOW_HOMEPAGE_SEO_CONTENT;
}

export function parseHomepageSeoContentCookie(value: string | undefined): boolean {
  if (value === "0") {
    return false;
  }

  if (value === "1") {
    return true;
  }

  return DEFAULT_SHOW_HOMEPAGE_SEO_CONTENT;
}

export function createHomepageSeoContentCookie(show: boolean): string {
  return [
    `${HOMEPAGE_SEO_CONTENT_COOKIE_KEY}=${show ? "1" : "0"}`,
    "Path=/",
    `Max-Age=${HOMEPAGE_SEO_CONTENT_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
  ].join("; ");
}
