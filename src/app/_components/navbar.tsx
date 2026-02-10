"use client";

import { ModeToggle } from "@/components/theme-manager";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Prayer Times",
    icon: Home,
    matches: (pathname: string) => pathname === "/",
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

  return (
    <nav
      aria-label="Primary"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+0.75rem)] z-50"
    >
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="pointer-events-auto glass-panel rounded-2xl border-border/80 p-2">
          <div className="flex items-center gap-2">
            <div className="grid flex-1 grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.matches(pathname);

                return (
                  <Button
                    asChild
                    className={cn(
                      "h-10 gap-2 rounded-xl px-3",
                      isActive
                        ? "border-primary/35 bg-primary/16 text-foreground shadow-sm"
                        : "border-transparent bg-transparent text-muted-foreground hover:border-border/80 hover:bg-background/60 hover:text-foreground",
                    )}
                    key={item.href}
                    size="sm"
                    variant="outline"
                  >
                    <Link href={item.href}>
                      <Icon className="size-4" />
                      <span className="text-xs font-semibold tracking-wide">
                        {item.label}
                      </span>
                    </Link>
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border/75 bg-background/65 px-2 py-1">
              <span className="font-display text-xs tracking-wide text-muted-foreground">
                PrayR
              </span>
              <ModeToggle className="shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
