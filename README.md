# PrayR

PrayR is a mobile-first Muslim prayer companion built with Next.js 16 App Router. It provides daily prayer timings, adhkar access, Ramadan-focused resources, feature flags, and PWA support in a clean UI optimized for accessibility and small screens.

## Overview

PrayR focuses on a practical daily flow:

1. Set city, country, method, and school.
2. View accurate Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha timings.
3. Track current prayer status, timeline/cards view, and makruh windows.
4. Access adhkar and Ramadan fasting guidance.
5. Install as a PWA and optionally use browser notifications.

## Full Feature List

### Prayer Dashboard

1. Daily prayer times by city and country.
2. Current prayer status card.
3. Timeline view and cards view.
4. Makruh windows card and indicators.
5. Sehar (Fajr) and Iftar (Maghrib) highlight card.
6. Optional Islamic date/calendar card.
7. Prayer-linked adhkar entry points.
8. Local caching for daily prayer payloads in browser storage.
9. Defensive loading and error states.

### Settings

1. City and country inputs with autocomplete.
2. Country-aware city suggestions.
3. City-country validation before final use.
4. GPS-based reverse geocoding helper.
5. IP-based location resolution fallback (multi-provider).
6. Full calculation method selection list.
7. School selection (Shafi/Hanafi).
8. Dashboard view preference (cards/timeline).
9. Feature toggles persisted to localStorage + cookie.
10. Dev panel for notification permission and test notification.

### Adhkars

1. Adhkar categories listing.
2. Category detail by ID.
3. Daily adhkar endpoint with deterministic day seed.
4. Prayer-aware category recommendation.
5. Language-aware adhkar loading.
6. Adhkar library page with canonical route `/adhkars`.
7. Permanent redirect alias from `/adkars` to `/adhkars`.

### Resources

1. Dedicated `/resources` page with Ramadan fasting guidance.
2. Start/end fasting explanation (Fajr and Maghrib mapping).
3. Dua section and reference material.
4. Linked external educational resources.
5. Feature-flagged Ramadan FAQ section.
6. Resources tab in bottom navigation (feature-flag controlled).

### UX, Accessibility, and UI

1. Mobile-first bottom navbar.
2. Responsive navbar behavior for small screens and large text sizes.
3. Theme switcher with dark, light, and system support.
4. Animated theme transition with reduced-motion fallback.
5. What’s New banner with dismiss persistence.
6. Install prompt banner for Android/iOS PWA flows.
7. Safe-area aware layout and viewport configuration.

### PWA and Runtime

1. Web app manifest (`/manifest.webmanifest`).
2. Service worker registration (`/sw.js`).
3. Installability UX on supported devices.
4. App icons for standard and maskable variants.
5. Standalone launch support.

### SEO and Metadata

1. Metadata for root and route-level pages.
2. Open Graph and Twitter card images via `next/og`.
3. JSON-LD for WebSite, Organization, FAQPage, SoftwareApplication, and WebPage.
4. Dynamic `robots.txt` with `/api/` disallow.
5. Dynamic `sitemap.xml` with feature-aware URLs.
6. Canonicals and alternates on key pages.

### Feature Flag System

Supported flags:

1. `prayerTimings`
2. `resourcesTab`
3. `ramadanResourcesFaq`
4. `sehrAndIftarTimes`
5. `adhkars`
6. `adhkarOfTheDay`
7. `islamicCalendar`

System behavior:

1. Defaults come from env vars with fallback to code defaults.
2. Flags can be overridden in browser storage and cookie.
3. Dependency graph is enforced at resolution time.
4. Server and request contexts both resolve flags consistently.

## API Endpoints

Prayer times:

1. `GET /api/prayer-times?city=&country=&method=&school=`

Adhkar:

1. `GET /api/adhkar/categories`
2. `GET /api/adhkar/category/[id]?language=en|ar`
3. `GET /api/adhkar/daily?dayKey=YYYY-MM-DD&language=en|ar&prayer=...`

Places:

1. `GET /api/places/suggest?kind=city|country&q=&countryCode=`
2. `GET /api/places/validate?city=&country=&countryCode=`
3. `GET /api/places/reverse?lat=&lng=`
4. `GET /api/places/from-ip`

## Tech Stack

### Core

1. Next.js `16.0.10` (App Router, Turbopack build pipeline)
2. React `19.2.3`
3. React DOM `19.2.3`
4. TypeScript `^5`

### UI and Styling

1. Tailwind CSS `^4`
2. shadcn/ui component patterns
3. Radix UI primitives
4. `class-variance-authority`, `clsx`, `tailwind-merge`
5. `lucide-react` icons
6. `tw-animate-css`
7. Google fonts via `next/font` (Manrope, Fraunces)

### Data, Analytics, and Utilities

1. PostHog (`posthog-js`, `posthog-js/react`)
2. External prayer timing backend integration through server route layer
3. GeoNames-backed place lookup/validation utilities

### Tooling

1. ESLint `^9` + `eslint-config-next`
2. PostCSS with `@tailwindcss/postcss`
3. pnpm lockfile and scripts

## Project Structure

1. `src/app` - App Router pages, metadata routes, API routes, and page components.
2. `src/app/_components` - App-specific UI blocks (dashboard, navbar, banners, cards).
3. `src/components` - shared UI and theme infrastructure.
4. `src/components/ui` - shadcn-style primitive components.
5. `src/features` - feature flag definitions, parsing, and resolution.
6. `src/backend` - server utilities for prayer times and adhkar.
7. `src/lib` - shared helpers and domain utilities.
8. `public` - icons, service worker assets, and static files.

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Current env keys:

```env
NEXT_PUBLIC_SITE_URL=https://prayr.help
NEXT_PUBLIC_FEATURE_PRAYER_TIMINGS=1
NEXT_PUBLIC_FEATURE_RESOURCES_TAB=1
NEXT_PUBLIC_FEATURE_RAMADAN_RESOURCES_FAQ=1
NEXT_PUBLIC_FEATURE_SEHR_IFTAR_TIMES=1
NEXT_PUBLIC_FEATURE_ADHKARS=1
NEXT_PUBLIC_FEATURE_ADHKAR_OF_THE_DAY=1
NEXT_PUBLIC_FEATURE_ISLAMIC_CALENDAR=1
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
GEONAMES_USERNAME=
NEXT_PUBLIC_POSTHOG_KEY=
```

Notes:

1. `GEONAMES_USERNAME` is required for place lookup endpoints.
2. `NEXT_PUBLIC_POSTHOG_KEY` enables analytics initialization.
3. Feature flags can be set with `1/0`, `true/false`, `yes/no`, or `on/off`.

## Local Development

Install and run:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

1. `pnpm dev` - start local dev server.
2. `pnpm build` - create production build.
3. `pnpm start` - run production server.
4. `pnpm lint` - run ESLint.

## Build and Deployment Notes

1. This app uses App Router metadata APIs for manifest, robots, and sitemap generation.
2. Feature flags can affect route behavior and visibility (for example adhkar and resources sections).
3. Service worker registration is client-side in root layout client.
4. Route handlers implement validation and return explicit status codes for invalid inputs.

## Product Positioning

PrayR is designed as a production-ready foundation for prayer-time and Islamic daily-practice applications that need:

1. Modern React/Next architecture.
2. Mobile-first and PWA behavior.
3. SEO-safe route architecture.
4. Feature-flag controlled rollout paths.
5. Extensible API route boundaries for location, timings, and adhkar data.
