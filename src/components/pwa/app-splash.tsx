"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type SplashState = "visible" | "leaving" | "gone";

// Server-rendered into the static shell so it paints with the first HTML bytes,
// then fades out once React has hydrated. CSS limits it to installed (standalone) launches.
export function AppSplash() {
  const [state, setState] = useState<SplashState>("visible");

  useEffect(() => {
    const frame = requestAnimationFrame(() => setState("leaving"));

    return () => cancelAnimationFrame(frame);
  }, []);

  if (state === "gone") {
    return null;
  }

  return (
    <div
      aria-label="Loading PrayR"
      className="app-splash"
      data-state={state}
      onTransitionEnd={() => setState("gone")}
      role="status"
    >
      <Image
        alt=""
        className="app-splash-icon"
        height={88}
        priority
        src="/android-chrome-192x192.png"
        unoptimized
        width={88}
      />
      <span aria-hidden="true" className="app-splash-spinner" />
    </div>
  );
}
