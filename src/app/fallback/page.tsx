"use client";

import { Button } from "@/components/ui/button";
import { Wifi, WifiOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Fallback() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      router.push("/");
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  return (
    <section className="flex min-h-[60svh] items-center justify-center">
      <div className="glass-panel w-full max-w-xl rounded-3xl p-6 text-center sm:p-8">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          {isOnline ? <Wifi className="size-5" /> : <WifiOff className="size-5" />}
        </div>

        <h1 className="font-display text-3xl sm:text-4xl">
          {isOnline ? "You are back online" : "You are offline"}
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
          {isOnline
            ? "Connection restored. You can return to your prayer dashboard."
            : "Please check your internet connection and try again."}
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          {isOnline ? (
            <Button asChild className="min-h-10 rounded-full px-6 py-2.5" size="sm">
              <Link href="/">Return home</Link>
            </Button>
          ) : (
            <Button
              className="min-h-10 rounded-full px-6 py-2.5"
              onClick={() => window.location.reload()}
              size="sm"
              type="button"
            >
              Try again
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
