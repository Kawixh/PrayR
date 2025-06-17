"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/theme-toggle";
import { Home, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const Navbar = () => {
  const pathname = usePathname();

  const RenderHomeButton = () => {
    return (
      <Link href="/">
        <Button variant="outline" size="icon">
          <Home />
        </Button>
      </Link>
    );
  };

  const RenderSettingsButton = () => {
    return (
      <Link href="/settings">
        <Button variant="outline" size="icon">
          <Settings />
        </Button>
      </Link>
    );
  };

  const toggleSettings = () => {
    if (pathname === "/settings") {
      return <RenderHomeButton />;
    }

    return <RenderSettingsButton />;
  };

  return (
    <div className="flex justify-end gap-3">
      <ModeToggle />
      {toggleSettings()}
    </div>
  );
};
