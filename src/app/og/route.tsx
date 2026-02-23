import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OgImageTemplate,
  getOgImagePayload,
} from "@/lib/seo/og-image";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const contentType = OG_IMAGE_CONTENT_TYPE;

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const payload = getOgImagePayload({
    eyebrow: searchParams.get("eyebrow"),
    title: searchParams.get("title"),
    description: searchParams.get("description"),
    pathname: searchParams.get("path"),
  });

  return new ImageResponse(<OgImageTemplate {...payload} />, OG_IMAGE_SIZE);
}
