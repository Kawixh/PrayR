"use client";

import { useEffect, useState } from "react";
import LiquidGlass from "./ui/liquid-glass";

const InstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      (deferredPrompt as any).prompt();
      const { outcome } = await (deferredPrompt as any).userChoice;
      setDeferredPrompt(null);
      setIsInstallable(false);
      console.log(`User response to the install prompt: ${outcome}`);
    }
  };

  return (
    <>
      {isInstallable && (
        <LiquidGlass className="flex flex-col items-center justify-center gap-2 p-4">
          <button onClick={handleInstallClick} className="install-button">
            <p style={{ mixBlendMode: "difference", color: "white" }}>
              Install App
            </p>
          </button>
        </LiquidGlass>
      )}
    </>
  );
};

export default InstallButton;
