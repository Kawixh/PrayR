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
    <nav className="glass-panel rounded-2xl p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-2xl leading-none text-foreground">PrayR</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gentle daily prayer companion
          </p>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap">
          <div className="flex flex-1 items-center gap-2 sm:flex-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.matches(pathname);

              return (
                <Button
                  asChild
                  className={cn(
                    "h-9 flex-1 gap-2 rounded-full px-3 sm:flex-none",
                    isActive
                      ? "border-primary/30 bg-primary/15 text-foreground hover:bg-primary/20"
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

          <ModeToggle className="shrink-0" />
        </div>
      </div>
    </nav>
  );
};
