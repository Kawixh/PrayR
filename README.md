# PrayR

PrayR is a modern prayer times web app for Muslims who want a clean daily salah flow without clutter.  
It gives accurate prayer times by city and country, helpful Islamic context, and a smooth mobile first experience.

## What this project is

1. A Next.js 16 app built with React 19, TypeScript 5, Tailwind CSS v4, and shadcn ui.
2. A daily Muslim companion focused on prayer timing, adhkar, reminders, and settings that actually matter.
3. A PWA ready product that can be installed on phone home screens.

## What it does

1. Shows daily Fajr Sunrise Dhuhr Asr Maghrib and Isha timings.
2. Supports multiple trusted calculation methods and school selection.
3. Gives current prayer status and day timeline view.
4. Includes makruh window guidance.
5. Includes adhkar browsing and daily adhkar feeds.
6. Supports city and country search with validation and geo lookup helpers.
7. Supports local browser notifications for prayer reminders.
8. Adds SEO metadata plus JSON LD schema for search visibility.

## Who it is for

1. Muslims who want reliable daily salah timings in a simple UI.
2. Students and developers building modern Islamic utility products.
3. Teams that want a strong base for SEO friendly faith and lifestyle apps.

## Current feature set

1. Prayer dashboard with cards and timeline modes.
2. Prayer times API route with city country method and school params.
3. Settings page with location method school reminder and feature controls.
4. Adhkar categories route daily adhkar route and category detail route.
5. Place suggest validate reverse geocode and IP based location routes.
6. Theme support for light dark and system mode.
7. PWA manifest icons install banner and social share images.
8. Sitemap robots and structured metadata for technical SEO.

## Tech stack

1. Next.js 16 App Router
2. React 19
3. TypeScript 5
4. Tailwind CSS v4
5. shadcn ui plus Radix UI
6. PostHog analytics

## Local setup

1. Install dependencies

```bash
pnpm install
```

2. Create env file

```bash
cp .env.example .env.local
```

3. Set required values in `.env.local`

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
GEONAMES_USERNAME=your_geonames_username
```

4. Run dev server

```bash
pnpm dev
```

5. Open `http://localhost:3000`

## Scripts

1. `pnpm dev` runs local dev server.
2. `pnpm build` creates production build.
3. `pnpm start` runs production server.
4. `pnpm lint` runs ESLint.

## Feature ideas you can add next

1. Multi city watchlist for people who travel often.
2. Qibla direction with compass calibration.
3. Ramzan mode with suhoor and iftar helpers.
4. Mosque iqamah schedule sync and manual offsets.
5. Widget and lock screen support for mobile apps.
6. User accounts and cloud sync for settings and streaks.
7. Offline cached prayer data for low network areas.
8. More language packs for global reach and SEO long tail.
9. Programmatic city landing pages for local prayer keyword ranking.
10. AI assistant for fiqh aware prayer and adhkar guidance.

## LinkedIn description under 2000 letters

I built PrayR a modern Muslim prayer times app with Next.js 16 React 19 TypeScript 5 Tailwind v4 and shadcn ui. It gives accurate daily salah times by city and country for Fajr Sunrise Dhuhr Asr Maghrib and Isha. Users can choose trusted calculation methods and school preferences so timings match local practice. The app has a clean prayer dashboard with timeline view current prayer state makruh windows adhkar library daily adhkar and local prayer reminders. It also supports smart place search city country validation and IP based location fallback. On the product side it is PWA ready with install banner mobile icons and theme support. On the growth side it is built with strong technical SEO including sitemap robots metadata Open Graph Twitter cards and JSON LD schema like FAQ WebSite Organization WebPage and SoftwareApplication. This project is for Muslims who want a simple reliable daily prayer companion and for teams building scalable faith tech products with strong UX and search visibility.
