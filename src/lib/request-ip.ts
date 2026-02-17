import "server-only";

const IP_HEADER_NAMES = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "x-client-ip",
] as const;

export function normalizeIpCandidate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const firstToken = value.split(",")[0]?.trim();

  if (!firstToken || firstToken.toLowerCase() === "unknown") {
    return null;
  }

  let normalized = firstToken;

  if (normalized.startsWith("::ffff:")) {
    normalized = normalized.slice(7);
  }

  if (/^\d{1,3}(?:\.\d{1,3}){3}:\d+$/.test(normalized)) {
    normalized = normalized.replace(/:\d+$/, "");
  }

  if (normalized === "::1" || normalized === "127.0.0.1") {
    return null;
  }

  return normalized;
}

export function getClientIpFromHeaders(requestHeaders: Headers): string | null {
  for (const headerName of IP_HEADER_NAMES) {
    const candidate = normalizeIpCandidate(requestHeaders.get(headerName));

    if (candidate) {
      return candidate;
    }
  }

  return null;
}
