import "server-only";
import { lookup, reverse } from "node:dns/promises";
import { getClientIpFromHeaders } from "@/lib/request-ip";

const GOOGLEBOT_USER_AGENT_PATTERN =
  /googlebot|google-inspectiontool|googleother|apis-google/i;

const GOOGLE_HOST_SUFFIXES = [
  ".googlebot.com",
  ".google.com",
  ".googleusercontent.com",
] as const;

function normalizeHostname(hostname: string): string {
  return hostname.trim().toLowerCase().replace(/\.+$/, "");
}

function isTrustedGoogleHostname(hostname: string): boolean {
  return GOOGLE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
}

async function hasForwardDnsMatch(hostname: string, ip: string): Promise<boolean> {
  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  return addresses.some((record) => record.address === ip);
}

export function hasGooglebotUserAgent(userAgent: string | null): boolean {
  if (!userAgent) {
    return false;
  }

  return GOOGLEBOT_USER_AGENT_PATTERN.test(userAgent);
}

export async function isVerifiedGooglebotRequest(
  requestHeaders: Headers,
): Promise<boolean> {
  if (!hasGooglebotUserAgent(requestHeaders.get("user-agent"))) {
    return false;
  }

  const ip = getClientIpFromHeaders(requestHeaders);

  if (!ip) {
    return false;
  }

  try {
    const hostnames = await reverse(ip);

    for (const hostname of hostnames) {
      const normalizedHostname = normalizeHostname(hostname);

      if (!isTrustedGoogleHostname(normalizedHostname)) {
        continue;
      }

      if (await hasForwardDnsMatch(normalizedHostname, ip)) {
        return true;
      }
    }
  } catch (error) {
    console.error("Googlebot verification failed:", error);
  }

  return false;
}
