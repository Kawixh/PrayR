const DEVELOPMENT_SITE_URL = "http://localhost:3000";
const PRODUCTION_SITE_URL_FALLBACK = "https://prayr.kawish.dev";

function normalizeUrl(rawUrl: string): string {
  const withProtocol =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`;

  return withProtocol.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  const candidate =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL;

  if (!candidate) {
    return process.env.NODE_ENV === "development"
      ? DEVELOPMENT_SITE_URL
      : PRODUCTION_SITE_URL_FALLBACK;
  }

  return normalizeUrl(candidate);
}
