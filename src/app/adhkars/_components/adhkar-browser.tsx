"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ADHKAR_LANGUAGE_OPTIONS,
  ADHKAR_LANGUAGE_STORAGE_KEY,
  AdhkarLanguage,
  isAdhkarLanguage,
  PrayerWithAdhkar,
} from "@/lib/adhkar";
import { cn } from "@/lib/utils";
import { BookOpenText, ExternalLink, Languages, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type AdhkarCategory = {
  id: number;
  title: string;
  titleAr: string;
};

type AdhkarItem = {
  id: string;
  arabicText: string;
  translatedText: string;
  repeat: string | null;
  source: string | null;
  audioUrl: string | null;
};

type AdhkarChapter = {
  id: number;
  title: string;
  titleAr: string;
  language: AdhkarLanguage;
  items: AdhkarItem[];
};

type ChapterResponse = {
  chapter: AdhkarChapter;
  error?: string;
};

type AdhkarBrowserProps = {
  categories: AdhkarCategory[];
  sourceUrl: string;
  prayer: PrayerWithAdhkar | null;
  recommendedCategoryIds: number[];
  initialCategoryId: number | null;
};

export function AdhkarBrowser({
  categories,
  sourceUrl,
  prayer,
  recommendedCategoryIds,
  initialCategoryId,
}: AdhkarBrowserProps) {
  const [language, setLanguage] = useState<AdhkarLanguage>("en");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    initialCategoryId ?? recommendedCategoryIds[0] ?? categories[0]?.id ?? null,
  );
  const [chapter, setChapter] = useState<AdhkarChapter | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recommendedCategories = useMemo(
    () =>
      recommendedCategoryIds
        .map((id) => categories.find((category) => category.id === id))
        .filter((category): category is AdhkarCategory => category !== undefined),
    [categories, recommendedCategoryIds],
  );

  useEffect(() => {
    const savedLanguage = localStorage.getItem(ADHKAR_LANGUAGE_STORAGE_KEY);

    if (isAdhkarLanguage(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(ADHKAR_LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!selectedCategoryId) {
      return;
    }

    const controller = new AbortController();

    const loadChapter = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          language,
        });

        const response = await fetch(
          `/api/adhkar/category/${selectedCategoryId}?${params.toString()}`,
          {
            cache: "no-store",
            method: "GET",
            signal: controller.signal,
          },
        );
        const data = (await response.json()) as ChapterResponse;

        if (!response.ok || !data.chapter) {
          throw new Error(data.error ?? "Failed to fetch adhkar chapter.");
        }

        setChapter(data.chapter);
      } catch (fetchError) {
        if ((fetchError as Error).name === "AbortError") {
          return;
        }

        setChapter(null);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch adhkar chapter.",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadChapter();

    return () => {
      controller.abort();
    };
  }, [language, selectedCategoryId]);

  return (
    <section className="space-y-5">
      <Card className="relative overflow-hidden rounded-3xl border-border/80 p-5 sm:p-6">
        <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 size-52 rounded-full bg-accent/25 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="soft-chip inline-flex w-fit items-center gap-2">
              <Sparkles className="size-3.5" />
              Source-preserved wording
            </p>

            <div className="space-y-2">
              <h1 className="font-display text-3xl leading-tight sm:text-4xl">
                Daily Adhkar Library
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Arabic text is shown as provided by the source. English follows
                the source translation text directly, without generated wording.
              </p>
            </div>

            {prayer ? (
              <p className="text-sm text-primary">
                Showing recommended adhkar for {prayer}.
              </p>
            ) : null}
          </div>

          <Button asChild className="rounded-full" size="sm" variant="outline">
            <a href={sourceUrl} rel="noreferrer" target="_blank">
              JSON docs
              <ExternalLink className="size-4" />
            </a>
          </Button>
        </div>
      </Card>

      <Card className="glass-panel rounded-2xl border-border/80 p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Language
            </span>
            <Select
              onValueChange={(value) => {
                if (isAdhkarLanguage(value)) {
                  setLanguage(value);
                }
              }}
              value={language}
            >
              <SelectTrigger className="rounded-xl bg-background/60">
                <Languages className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {ADHKAR_LANGUAGE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Adhkar List
            </span>
            <Select
              onValueChange={(value) => {
                const parsed = Number(value);

                if (!Number.isNaN(parsed)) {
                  setSelectedCategoryId(parsed);
                }
              }}
              value={selectedCategoryId ? String(selectedCategoryId) : undefined}
            >
              <SelectTrigger className="rounded-xl bg-background/60">
                <BookOpenText className="size-4 text-muted-foreground" />
                <SelectValue placeholder="Select chapter" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {language === "ar"
                      ? `${category.id}. ${category.titleAr}`
                      : `${category.id}. ${category.title}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>

        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Urdu is not shown yet because this free source does not provide a
          verified Urdu adhkar translation set.
        </p>
      </Card>

      {recommendedCategories.length > 0 ? (
        <Card className="glass-panel rounded-2xl border-border/80 p-4">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-1 text-sm text-muted-foreground">Recommended:</p>
            {recommendedCategories.map((category) => {
              const active = category.id === selectedCategoryId;

              return (
                <Button
                  className={cn(
                    "min-h-9 rounded-full px-4 py-2 text-sm",
                    active && "shadow-sm",
                  )}
                  key={category.id}
                  onClick={() => setSelectedCategoryId(category.id)}
                  size="sm"
                  variant={active ? "default" : "outline"}
                >
                  {language === "ar" ? category.titleAr : category.title}
                </Button>
              );
            })}
          </div>
        </Card>
      ) : null}

      {loading ? (
        <Card className="glass-panel rounded-2xl border-border/80 p-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            <p>Loading adhkar details...</p>
          </div>
        </Card>
      ) : null}

      {error ? (
        <Card className="glass-panel rounded-2xl border-destructive/50 bg-destructive/10 p-6">
          <p className="text-sm text-destructive">{error}</p>
        </Card>
      ) : null}

      {chapter && !loading && !error ? (
        <div className="space-y-3">
          <Card className="glass-panel rounded-2xl border-border/80 p-4 sm:p-5">
            <h2 className="font-display text-2xl leading-tight sm:text-3xl">
              {language === "ar" ? chapter.titleAr : chapter.title}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Showing {chapter.items.length} adhkar entries.
            </p>
          </Card>

          {chapter.items.map((item, index) => (
            <Card
              className="glass-panel rounded-2xl border-border/80 p-4 sm:p-5"
              key={`${item.id}-${index}`}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="soft-chip">Adhkar #{index + 1}</p>
                {item.repeat ? (
                  <p className="text-xs font-semibold tracking-wide text-primary">
                    Repeat: {item.repeat}
                  </p>
                ) : null}
              </div>

              <p
                className="font-display text-right text-2xl leading-relaxed sm:text-[2rem]"
                dir="rtl"
              >
                {item.arabicText}
              </p>

              {language === "en" ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-foreground/90 sm:text-base">
                  {item.translatedText || "No source translation provided for this entry."}
                </p>
              ) : null}

              {item.source ? (
                <p className="mt-4 text-xs leading-5 text-muted-foreground">
                  Source note: {item.source}
                </p>
              ) : null}

              {item.audioUrl ? (
                <div className="mt-4">
                  <Button asChild className="rounded-full" size="sm" variant="outline">
                    <a href={item.audioUrl} rel="noreferrer" target="_blank">
                      Open audio
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : null}

      {!loading && !error && !chapter ? (
        <Card className="glass-panel rounded-2xl border-border/80 p-6">
          <p className="text-sm text-muted-foreground">
            Select an adhkar chapter to start reading.
          </p>
        </Card>
      ) : null}

      <Card className="glass-panel rounded-2xl border-border/80 p-4 text-sm text-muted-foreground">
        Need prayer-time shortcuts? Go back to{" "}
        <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/">
          prayer times
        </Link>{" "}
        and use the “View Adhkars” button on each prayer.
      </Card>
    </section>
  );
}
