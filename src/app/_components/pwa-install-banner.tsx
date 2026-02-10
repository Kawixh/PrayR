"use client";

import { Button } from "@/components/ui/button";
import { Download, Sparkles, X } from "lucide-react";
import { KeyboardEvent, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

type Platform = "ios" | "android" | "other";

function detectPlatform(): Platform {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return "ios";
  }

  if (/android/.test(userAgent)) {
    return "android";
  }

  return "other";
}

function isRunningAsInstalledApp(): boolean {
  const isStandaloneDisplayMode = window.matchMedia(
    "(display-mode: standalone)",
  ).matches;
  const isIosStandalone =
    "standalone" in navigator &&
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

  return (
    isStandaloneDisplayMode ||
    isIosStandalone ||
    document.referrer.startsWith("android-app://")
  );
}

export function PwaInstallBanner() {
  const [platform] = useState<Platform>(() =>
    typeof navigator === "undefined" ? "other" : detectPlatform(),
  );
  const [isInstalled, setIsInstalled] = useState(() =>
    typeof window === "undefined" ? true : isRunningAsInstalledApp(),
  );
  const [dismissed, setDismissed] = useState(false);
  const [showAndroidHelp, setShowAndroidHelp] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowAndroidHelp(false);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const showIosBanner = !isInstalled && platform === "ios";
  const showAndroidBanner = !isInstalled && platform === "android";

  if (dismissed || (!showIosBanner && !showAndroidBanner)) {
    return null;
  }

  const installOnAndroid = async () => {
    if (!deferredPrompt) {
      setShowAndroidHelp(true);
      return;
    }

    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const handleBannerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!showAndroidBanner) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      void installOnAndroid();
    }
  };

  return (
    <div
      aria-label={showAndroidBanner ? "Install application" : undefined}
      className={`relative overflow-hidden rounded-2xl border p-4 shadow-lg backdrop-blur animate-in fade-in slide-in-from-top-2 duration-500 ${
        showAndroidBanner
          ? "cursor-pointer border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card"
          : "border-border/70 bg-card/90"
      }`}
      onClick={showAndroidBanner ? () => void installOnAndroid() : undefined}
      onKeyDown={handleBannerKeyDown}
      role={showAndroidBanner ? "button" : undefined}
      tabIndex={showAndroidBanner ? 0 : undefined}
    >
      {showAndroidBanner ? (
        <>
          <div className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 size-40 rounded-full bg-emerald-400/15 blur-2xl" />
        </>
      ) : null}

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex flex-1 items-start gap-3">
          <div className="mt-0.5 rounded-full bg-primary/15 p-2 text-primary">
            {showAndroidBanner ? (
              <Download className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-semibold leading-5 text-card-foreground">
              {showAndroidBanner ? "Install PrayR App" : "Use PrayR as an App"}
            </p>
            <p className="text-sm leading-5 text-muted-foreground">
              {showIosBanner
                ? "This is a PWA and add to homescreen from Safari to make this an app."
                : "Tap this banner to install the full app experience on Android."}
            </p>
          </div>
        </div>

        <button
          aria-label="Dismiss install banner"
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={(event) => {
            event.stopPropagation();
            setDismissed(true);
          }}
          type="button"
        >
          <X className="size-4" />
        </button>
      </div>

      {showAndroidBanner ? (
        <div className="relative z-10 mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {deferredPrompt
              ? "Install prompt is ready."
              : "Preparing install prompt..."}
          </div>

          <Button
            className="h-8"
            onClick={(event) => {
              event.stopPropagation();
              void installOnAndroid();
            }}
            size="sm"
            type="button"
          >
            <Download className="size-4" />
            Install now
          </Button>
        </div>
      ) : null}

      {showAndroidBanner && showAndroidHelp ? (
        <p className="relative z-10 mt-2 text-xs text-muted-foreground">
          If the prompt still does not appear, open this site in Chrome and use
          &quot;Install app&quot; from the browser menu.
        </p>
      ) : null}
    </div>
  );
}
