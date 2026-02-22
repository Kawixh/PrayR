import "server-only";
import { getAdhanTime } from "@/backend/get-adhan-time";
import type { AlAdhanDayData } from "@/backend/types";
import { isVerifiedGooglebotRequest } from "@/lib/googlebot";
import { hasCityAndCountry, resolveLocationFromIp } from "@/lib/ip-location";
import { getClientIpFromHeaders } from "@/lib/request-ip";

const GOOGLEBOT_DEFAULT_METHOD = 2;
const GOOGLEBOT_DEFAULT_SCHOOL = 0;

export type GooglebotHomepageResult = {
  initialPrayerDay: AlAdhanDayData | null;
};

export async function resolveGooglebotHomepageResult(
  requestHeaders: Headers,
): Promise<GooglebotHomepageResult> {
  const isVerifiedGooglebot = await isVerifiedGooglebotRequest(requestHeaders);

  if (!isVerifiedGooglebot) {
    return {
      initialPrayerDay: null,
    };
  }

  const ip = getClientIpFromHeaders(requestHeaders);
  const ipLocation = await resolveLocationFromIp(ip);

  if (!ipLocation || !hasCityAndCountry(ipLocation)) {
    return {
      initialPrayerDay: null,
    };
  }

  const city = ipLocation.city?.trim();

  if (!city) {
    return {
      initialPrayerDay: null,
    };
  }

  const countryCandidates = [
    ipLocation.country,
    ipLocation.countryCode,
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const country of new Set(countryCandidates)) {
    try {
      const payload = await getAdhanTime(
        city,
        country,
        GOOGLEBOT_DEFAULT_METHOD,
        GOOGLEBOT_DEFAULT_SCHOOL,
      );

      return {
        initialPrayerDay: payload.data,
      };
    } catch (error) {
      console.error("Googlebot prayer time fallback failed:", error);
    }
  }

  return {
    initialPrayerDay: null,
  };
}
