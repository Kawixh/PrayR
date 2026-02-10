const FALLBACK_SITE_URL = "http://localhost:3000";

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
    return FALLBACK_SITE_URL;
  }

  return normalizeUrl(candidate);
}
