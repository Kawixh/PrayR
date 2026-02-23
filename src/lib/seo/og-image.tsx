import { SITE_NAME } from "@/lib/seo/site";

type OgImageInput = {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  pathname?: string | null;
};

type OgImagePayload = {
  eyebrow: string;
  title: string;
  description: string;
  pathname: string;
};

const MAX_EYEBROW_LENGTH = 36;
const MAX_TITLE_LENGTH = 74;
const MAX_DESCRIPTION_LENGTH = 150;

const OG_BADGE_ITEMS = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

const DEFAULT_OG_IMAGE: OgImagePayload = {
  eyebrow: SITE_NAME,
  title: "Accurate Daily Prayer Times",
  description:
    "Check local salah times by city and country with trusted calculation methods.",
  pathname: "/",
};

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export const OG_IMAGE_CONTENT_TYPE = "image/png";

function sanitizeText(value: string, maxLength: number): string {
  const compactValue = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!compactValue) {
    return "";
  }

  if (compactValue.length <= maxLength) {
    return compactValue;
  }

  return `${compactValue.slice(0, Math.max(maxLength - 3, 1)).trimEnd()}...`;
}

function normalizePathname(pathname: string): string {
  const trimmedPathname = pathname.trim();

  if (!trimmedPathname || trimmedPathname === "/") {
    return "/";
  }

  const pathOnly = trimmedPathname.split(/[?#]/)[0] ?? "/";
  const withLeadingSlash = pathOnly.startsWith("/")
    ? pathOnly
    : `/${pathOnly}`;

  return withLeadingSlash.replace(/\/{2,}/g, "/");
}

function withFallback(value: string, fallback: string): string {
  return value || fallback;
}

export function getOgImagePayload(input: OgImageInput = {}): OgImagePayload {
  return {
    eyebrow: withFallback(
      sanitizeText(input.eyebrow ?? DEFAULT_OG_IMAGE.eyebrow, MAX_EYEBROW_LENGTH),
      DEFAULT_OG_IMAGE.eyebrow,
    ),
    title: withFallback(
      sanitizeText(input.title ?? DEFAULT_OG_IMAGE.title, MAX_TITLE_LENGTH),
      DEFAULT_OG_IMAGE.title,
    ),
    description: withFallback(
      sanitizeText(
        input.description ?? DEFAULT_OG_IMAGE.description,
        MAX_DESCRIPTION_LENGTH,
      ),
      DEFAULT_OG_IMAGE.description,
    ),
    pathname: normalizePathname(input.pathname ?? DEFAULT_OG_IMAGE.pathname),
  };
}

export function getOgImageUrl(input: OgImageInput = {}): string {
  const payload = getOgImagePayload(input);
  const params = new URLSearchParams({
    eyebrow: payload.eyebrow,
    title: payload.title,
    description: payload.description,
    path: payload.pathname,
  });

  return `/og?${params.toString()}`;
}

export function getOgImageAlt(input: OgImageInput = {}): string {
  const payload = getOgImagePayload(input);
  return `${SITE_NAME} - ${payload.title}`;
}

export function getOgImageMetadata(input: OgImageInput = {}) {
  return {
    url: getOgImageUrl(input),
    width: OG_IMAGE_SIZE.width,
    height: OG_IMAGE_SIZE.height,
    alt: getOgImageAlt(input),
  };
}

export function OgImageTemplate(input: OgImageInput = {}) {
  const payload = getOgImagePayload(input);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: "42px",
        position: "relative",
        color: "#0f172a",
        background:
          "linear-gradient(140deg, #f8fafc 0%, #e0f2fe 40%, #c7d2fe 100%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "0",
          background:
            "radial-gradient(circle at 0% 0%, rgba(15, 23, 42, 0.04) 0%, transparent 50%)",
        }}
      />

      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: "28px",
          border: "2px solid rgba(15, 23, 42, 0.12)",
          background: "rgba(255, 255, 255, 0.9)",
          padding: "46px",
          zIndex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              borderRadius: "999px",
              padding: "10px 18px",
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              border: "1px solid rgba(15, 23, 42, 0.18)",
              color: "#1e293b",
              background: "rgba(255, 255, 255, 0.75)",
            }}
          >
            {payload.eyebrow}
          </div>

          <div
            style={{
              fontSize: 68,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "1020px",
            }}
          >
            {payload.title}
          </div>

          <div
            style={{
              fontSize: 30,
              lineHeight: 1.3,
              maxWidth: "1020px",
              color: "#1e293b",
            }}
          >
            {payload.description}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            {OG_BADGE_ITEMS.map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "999px",
                  padding: "8px 14px",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#1e293b",
                  background: "rgba(15, 23, 42, 0.08)",
                  border: "1px solid rgba(15, 23, 42, 0.12)",
                }}
              >
                {item}
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              fontSize: 23,
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            <span>{SITE_NAME}</span>
            <span style={{ opacity: 0.7, fontSize: 18 }}>{payload.pathname}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
