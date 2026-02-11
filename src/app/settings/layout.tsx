import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Prayer Settings",
  description:
    "Configure your city, country, calculation method, and school for accurate daily prayer times.",
  alternates: {
    canonical: "/settings",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
