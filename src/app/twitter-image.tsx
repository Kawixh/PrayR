import {
  OG_IMAGE_CONTENT_TYPE,
  OG_IMAGE_SIZE,
  OgImageTemplate,
  getOgImageAlt,
} from "@/lib/seo/og-image";
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = getOgImageAlt();
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function TwitterImage() {
  return new ImageResponse(<OgImageTemplate />, size);
}
