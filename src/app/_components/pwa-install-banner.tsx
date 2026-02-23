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
        "animate-in fade-in slide-in-from-top-2 duration-500",
        showAndroidBanner ? "app-banner cursor-pointer" : "app-banner-subtle",
      )}
      onClick={showAndroidBanner ? () => void installOnAndroid() : undefined}
      onKeyDown={handleBannerKeyDown}
      role={showAndroidBanner ? "button" : undefined}
      tabIndex={showAndroidBanner ? 0 : undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-2.5">
          <span className="mt-0.5 text-primary">
            {showAndroidBanner ? (
              <Download className="size-4" />
            ) : (
              <Sparkles className="size-4" />
            )}
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              {showAndroidBanner ? "Install PrayR" : "Use PrayR as an App"}
            </p>
            <p className="mt-0.5 break-words text-xs leading-5 text-muted-foreground sm:text-sm">
              {showIosBanner
                ? "Open Safari share menu and tap Add to Home Screen."
                : "Install on Android for faster launch and home screen access."}
            </p>
          </div>
        </div>

        <button
          aria-label="Dismiss install banner"
          className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
        <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-3 sm:flex-row sm:items-center sm:justify-between">
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
          ) : deferredPrompt ? (
            <p className="text-xs text-muted-foreground">Install prompt is ready.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
