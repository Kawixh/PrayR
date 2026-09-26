"use client";

import { WifiOff } from "lucide-react";
import { useOffline } from "next/offline";

export function OfflineBanner() {
  const isOffline = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.5rem)] z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-2 duration-200"
      role="status"
    >
      <p className="flex items-center gap-2 rounded-full border border-border/80 bg-card/95 px-3.5 py-1.5 text-xs font-medium text-foreground shadow-lg backdrop-blur">
        <WifiOff aria-hidden="true" className="size-3.5 text-muted-foreground" />
        You&apos;re offline. Reconnect to refresh prayer times.
      </p>
    </div>
  );
}
