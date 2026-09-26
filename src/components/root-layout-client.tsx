"use client";

import React from "react";

export default function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    // A caching service worker in dev serves stale pages over hot reload.
    if (process.env.NODE_ENV !== "production") {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) =>
          Promise.all(registrations.map((registration) => registration.unregister())),
        );
      return;
    }

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  }, []);

  return <>{children}</>;
}
