import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Offline Mode",
  description: "Offline fallback screen for PrayR.",
  alternates: {
    canonical: "/fallback",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function FallbackLayout({ children }: { children: ReactNode }) {
  return children;
}
