import { getSiteUrl } from "@/lib/site-url";

export const SITE_NAME = "PrayR";
export const SITE_LOCALE = "en-US";

const siteUrl = getSiteUrl();

function normalizePathname(pathname: string): string {
  const trimmedPathname = pathname.trim();

  if (!trimmedPathname || trimmedPathname === "/") {
    return "/";
  }

  return trimmedPathname.startsWith("/")
    ? trimmedPathname
    : `/${trimmedPathname}`;
}

export function getSiteBaseUrl(): string {
  return siteUrl;
}

export function getCanonicalUrl(pathname: string): string {
  return new URL(normalizePathname(pathname), siteUrl).toString();
}

export function getLanguageAlternates(pathname: string): Record<string, string> {
  const canonicalUrl = getCanonicalUrl(pathname);

  return {
    en: canonicalUrl,
    "en-US": canonicalUrl,
    "x-default": canonicalUrl,
  };
}

export function getPageAlternates(pathname: string) {
  return {
    canonical: getCanonicalUrl(pathname),
    languages: getLanguageAlternates(pathname),
  };
}

export function getLanguageMetaTags() {
  return {
    "content-language": SITE_LOCALE,
    language: SITE_LOCALE,
  };
}
