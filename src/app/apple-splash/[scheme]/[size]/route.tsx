import {
  APPLE_STARTUP_IMAGES,
  parseSplashSize,
  SPLASH_BACKGROUND,
  type SplashColorScheme,
} from "@/lib/pwa/apple-startup-images";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

type RouteContext = {
  params: Promise<{ scheme: string; size: string }>;
};

export function generateStaticParams() {
  return APPLE_STARTUP_IMAGES.map(({ scheme, size }) => ({ scheme, size }));
}

async function readAppIconDataUrl(): Promise<string> {
  const icon = await readFile(
    join(process.cwd(), "public", "android-chrome-512x512.png"),
  );

  return `data:image/png;base64,${icon.toString("base64")}`;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { scheme, size } = await params;
  const isKnownImage = APPLE_STARTUP_IMAGES.some(
    (image) => image.scheme === scheme && image.size === size,
  );
  const dimensions = parseSplashSize(size);

  if (!isKnownImage || !dimensions) {
    return new Response("Not found", { status: 404 });
  }

  const png = await renderSplashPng(scheme as SplashColorScheme, dimensions);

  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
}

// Cached so the images render once at build time instead of on every request.
async function renderSplashPng(
  colorScheme: SplashColorScheme,
  dimensions: { width: number; height: number },
): Promise<Uint8Array<ArrayBuffer>> {
  "use cache";
  cacheLife("max");

  const iconSize = Math.round(Math.min(dimensions.width, dimensions.height) * 0.28);
  const iconSrc = await readAppIconDataUrl();

  const image = new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: SPLASH_BACKGROUND[colorScheme],
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <img
          alt=""
          height={iconSize}
          src={iconSrc}
          style={{
            borderRadius: iconSize * 0.22,
            boxShadow:
              colorScheme === "dark"
                ? "0 0 0 2px rgba(255, 255, 255, 0.14)"
                : "0 12px 40px rgba(17, 19, 26, 0.18)",
          }}
          width={iconSize}
        />
      </div>
    ),
    dimensions,
  );

  return new Uint8Array(await image.arrayBuffer());
}
