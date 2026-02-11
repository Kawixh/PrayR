"use client";

import { ModeToggle } from "@/components/theme-manager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BookOpenText, Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const navItems = [
  {
    href: "/",
    label: "Prayer Times",
    icon: Home,
    matches: (pathname: string) => pathname === "/",
  },
  {
    href: "/adhkars",
    label: "Adhkars",
    icon: BookOpenText,
    matches: (pathname: string) => pathname.startsWith("/adhkars"),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
    matches: (pathname: string) => pathname.startsWith("/settings"),
  },
];

export const Navbar = () => {
  const pathname = usePathname();
  const navPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const navPanel = navPanelRef.current;
    if (!navPanel) {
      return;
    }

    const root = document.documentElement;
    const updateReserve = () => {
      const panelHeight = navPanel.getBoundingClientRect().height;
      const reserve = Math.ceil(panelHeight + 24);
      root.style.setProperty("--bottom-nav-reserve", `${reserve}px`);
    };

    updateReserve();

    let observer: ResizeObserver | null = null;
    if ("ResizeObserver" in window) {
      observer = new ResizeObserver(updateReserve);
      observer.observe(navPanel);
    }

    window.addEventListener("resize", updateReserve);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updateReserve);
      root.style.removeProperty("--bottom-nav-reserve");
    };
  }, []);

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div
          className="pointer-events-auto glass-panel rounded-2xl border-border/80 p-2 sm:p-2.5"
          ref={navPanelRef}
        >
          <div className="flex flex-wrap items-stretch gap-2">
            <div className="grid min-w-0 flex-1 grid-cols-3 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matches(pathname);

                return (
                  <Button
                    asChild
                    className={cn(
                      "min-h-10 h-auto rounded-xl px-2 py-2 whitespace-normal sm:px-3",
                      isActive
                        ? "border-primary/35 bg-primary/16 text-foreground shadow-sm"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border/80 hover:bg-background/60 hover:text-foreground",
                    )}
                    key={item.href}
                    size="sm"
                    variant="outline"
                  >
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className="flex w-full flex-col items-center justify-center gap-1 text-center"
                      href={item.href}
                    >
                      <Icon className="size-4" />
                      <span className="text-xs leading-tight font-semibold tracking-normal [overflow-wrap:anywhere]">
                        {item.label}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>

            <ModeToggle className="ml-auto self-center shrink-0 sm:ml-0" />
          </div>
        </div>
      </div>
    </nav>
  );
};
