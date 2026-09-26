// iOS ignores the manifest splash fields and only shows a launch image when a
// <link rel="apple-touch-startup-image"> matches the device exactly.

export const SPLASH_COLOR_SCHEMES = ["light", "dark"] as const;

export type SplashColorScheme = (typeof SPLASH_COLOR_SCHEMES)[number];

export const SPLASH_BACKGROUND: Record<SplashColorScheme, string> = {
  light: "#f5f6fa",
  dark: "#121318",
};

type AppleDevice = {
  // CSS pixels in portrait orientation.
  width: number;
  height: number;
  pixelRatio: number;
  landscape: boolean;
};

const APPLE_DEVICES: readonly AppleDevice[] = [
  // iPhone 16 Pro Max, 17 Pro Max
  { width: 440, height: 956, pixelRatio: 3, landscape: false },
  // iPhone Air
  { width: 420, height: 912, pixelRatio: 3, landscape: false },
  // iPhone 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  { width: 430, height: 932, pixelRatio: 3, landscape: false },
  // iPhone 12/13 Pro Max, 14 Plus
  { width: 428, height: 926, pixelRatio: 3, landscape: false },
  // iPhone 16 Pro, 17, 17 Pro
  { width: 402, height: 874, pixelRatio: 3, landscape: false },
  // iPhone 14 Pro, 15, 15 Pro, 16, 16e
  { width: 393, height: 852, pixelRatio: 3, landscape: false },
  // iPhone 12, 13, 14, 12/13 Pro
  { width: 390, height: 844, pixelRatio: 3, landscape: false },
  // iPhone X, XS, 11 Pro, 12/13 mini
  { width: 375, height: 812, pixelRatio: 3, landscape: false },
  // iPhone XS Max, 11 Pro Max
  { width: 414, height: 896, pixelRatio: 3, landscape: false },
  // iPhone XR, 11
  { width: 414, height: 896, pixelRatio: 2, landscape: false },
  // iPhone 6/7/8 Plus
  { width: 414, height: 736, pixelRatio: 3, landscape: false },
  // iPhone 6/7/8, SE 2nd/3rd gen
  { width: 375, height: 667, pixelRatio: 2, landscape: false },
  // iPhone SE 1st gen
  { width: 320, height: 568, pixelRatio: 2, landscape: false },
  // iPad Pro 13" (M4+)
  { width: 1032, height: 1376, pixelRatio: 2, landscape: true },
  // iPad Pro 12.9", iPad Air 13"
  { width: 1024, height: 1366, pixelRatio: 2, landscape: true },
  // iPad Pro 11" (M4+)
  { width: 834, height: 1210, pixelRatio: 2, landscape: true },
  // iPad Pro 11"
  { width: 834, height: 1194, pixelRatio: 2, landscape: true },
  // iPad Air 10.9"/11", iPad 10th gen+
  { width: 820, height: 1180, pixelRatio: 2, landscape: true },
  // iPad Pro 10.5", iPad Air 3rd gen
  { width: 834, height: 1112, pixelRatio: 2, landscape: true },
  // iPad 7th–9th gen
  { width: 810, height: 1080, pixelRatio: 2, landscape: true },
  // iPad mini 6th gen+
  { width: 744, height: 1133, pixelRatio: 2, landscape: true },
  // iPad mini 5th gen, iPad 9.7"
  { width: 768, height: 1024, pixelRatio: 2, landscape: true },
];

export type AppleStartupImage = {
  scheme: SplashColorScheme;
  // Image size in physical pixels, formatted as `${width}x${height}`.
  size: string;
  media: string;
};

function listAppleStartupImages(): AppleStartupImage[] {
  const images: AppleStartupImage[] = [];

  for (const scheme of SPLASH_COLOR_SCHEMES) {
    for (const device of APPLE_DEVICES) {
      const portraitWidth = device.width * device.pixelRatio;
      const portraitHeight = device.height * device.pixelRatio;
      const baseMedia = `screen and (device-width: ${device.width}px) and (device-height: ${device.height}px) and (-webkit-device-pixel-ratio: ${device.pixelRatio}) and (prefers-color-scheme: ${scheme})`;

      images.push({
        scheme,
        size: `${portraitWidth}x${portraitHeight}`,
        media: `${baseMedia} and (orientation: portrait)`,
      });

      if (device.landscape) {
        images.push({
          scheme,
          size: `${portraitHeight}x${portraitWidth}`,
          media: `${baseMedia} and (orientation: landscape)`,
        });
      }
    }
  }

  return images;
}

export const APPLE_STARTUP_IMAGES = listAppleStartupImages();

export function getAppleStartupImagePath({
  scheme,
  size,
}: Pick<AppleStartupImage, "scheme" | "size">): string {
  return `/apple-splash/${scheme}/${size}`;
}

export function parseSplashSize(size: string): { width: number; height: number } | null {
  const match = /^(\d+)x(\d+)$/.exec(size);

  if (!match) {
    return null;
  }

  return { width: Number(match[1]), height: Number(match[2]) };
}
