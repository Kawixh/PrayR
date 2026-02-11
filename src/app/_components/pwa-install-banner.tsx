"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      aria-label={showAndroidBanner ? "Install PrayR" : undefined}
      className={cn(
        "glass-panel animate-in fade-in slide-in-from-top-2 duration-500 rounded-2xl p-4",
        showAndroidBanner
          ? "cursor-pointer border-primary/35 bg-gradient-to-r from-primary/15 via-card to-accent/15"
          : "border-border/80",
      )}
      onClick={showAndroidBanner ? () => void installOnAndroid() : undefined}
      onKeyDown={handleBannerKeyDown}
      role={showAndroidBanner ? "button" : undefined}
      tabIndex={showAndroidBanner ? 0 : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full border border-primary/25 bg-primary/15 p-2 text-primary">
          {showAndroidBanner ? (
            <Download className="size-4" />
          ) : (
            <Sparkles className="size-4" />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="font-display text-xl leading-tight">
            {showAndroidBanner ? "Install PrayR" : "Use PrayR as an App"}
          </p>
          <p className="break-words text-sm leading-6 text-muted-foreground">
            {showIosBanner
              ? "this is a PWA and add to homescreen from safari to make this an app"
              : "Tap this card to install the app directly on Android for a smoother, faster experience."}
          </p>

          {showAndroidBanner ? (
            <p className="text-xs text-muted-foreground">
              {deferredPrompt
                ? "Install prompt is ready"
                : "Preparing install prompt..."}
            </p>
          ) : null}
        </div>

        <button
          aria-label="Dismiss install banner"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
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
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            className="min-h-10 w-full rounded-full px-5 py-2.5 sm:w-auto"
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

          {showAndroidHelp ? (
            <p className="text-xs text-muted-foreground">
              If prompt does not appear, open in Chrome and use
              &quot;Install app&quot; from the menu.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
