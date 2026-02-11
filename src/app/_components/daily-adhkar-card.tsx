"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ADHKAR_LANGUAGE_STORAGE_KEY,
  AdhkarLanguage,
  isAdhkarLanguage,
} from "@/lib/adhkar";
import { BookOpenText, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalDayKey } from "../_utils/time";

type DailyAdhkarPayload = {
  dayKey: string;
  language: AdhkarLanguage;
  category: {
    id: number;
    title: string;
    titleAr: string;
  };
  adhkar: {
    id: string;
    arabicText: string;
    translatedText: string;
    repeat: string | null;
    source: string | null;
  };
  error?: string;
};

export function DailyAdhkarCard() {
  const [language, setLanguage] = useState<AdhkarLanguage>("en");
  const [dailyAdhkar, setDailyAdhkar] = useState<DailyAdhkarPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedLanguage = localStorage.getItem(ADHKAR_LANGUAGE_STORAGE_KEY);

    if (isAdhkarLanguage(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const dayKey = getLocalDayKey();

    const loadDailyAdhkar = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          dayKey,
          language,
        });
        const response = await fetch(`/api/adhkar/daily?${params.toString()}`, {
          cache: "no-store",
          method: "GET",
          signal: controller.signal,
        });
        const data = (await response.json()) as DailyAdhkarPayload;

        if (!response.ok || !data.adhkar) {
          throw new Error(data.error ?? "Failed to fetch daily adhkar.");
        }

        setDailyAdhkar(data);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setDailyAdhkar(null);
        setError(
          fetchError instanceof Error ? fetchError.message : "Failed to load daily adhkar.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadDailyAdhkar();

    return () => {
      controller.abort();
    };
  }, [language]);

  if (loading) {
    return (
      <Card className="glass-panel rounded-2xl border-border/80 p-5">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          <p>Loading daily adhkar...</p>
        </div>
      </Card>
    );
  }

  if (error || !dailyAdhkar) {
    return (
      <Card className="glass-panel rounded-2xl border-border/80 p-5">
        <p className="text-sm text-muted-foreground">
          Daily adhkar is temporarily unavailable.
        </p>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden rounded-2xl border-primary/30 bg-gradient-to-br from-primary/15 via-card to-accent/20 p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-14 -top-12 size-44 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-12 size-44 rounded-full bg-accent/25 blur-3xl" />

      <div className="relative z-10 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="soft-chip mb-2 inline-flex">Adhkar of the Day</p>
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">
              {dailyAdhkar.language === "ar"
                ? dailyAdhkar.category.titleAr
                : dailyAdhkar.category.title}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Day key: {dailyAdhkar.dayKey}
            </p>
          </div>

          <Button asChild className="rounded-full" size="sm" variant="outline">
            <Link href={`/adhkars?category=${dailyAdhkar.category.id}`}>
              Open chapter
              <BookOpenText className="size-4" />
            </Link>
          </Button>
        </div>

        <p className="font-display text-right text-2xl leading-relaxed sm:text-[2rem]" dir="rtl">
          {dailyAdhkar.adhkar.arabicText}
        </p>

        {dailyAdhkar.language === "en" ? (
          <p className="whitespace-pre-line text-sm leading-7 text-foreground/90 sm:text-base">
            {dailyAdhkar.adhkar.translatedText ||
              "No source translation provided for this entry."}
          </p>
        ) : null}

        {dailyAdhkar.adhkar.repeat ? (
          <p className="text-xs font-semibold tracking-wide text-primary">
            Repeat: {dailyAdhkar.adhkar.repeat}
          </p>
        ) : null}
      </div>
    </Card>
  );
}

