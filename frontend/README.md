# Multiverse Markets: frontend

Landing page and wallet sign-in for Multiverse Markets, which turns Farcaster arguments
into prediction markets on Uniswap V4, resolved by Chainlink CRE.

Next.js 16 (App Router, Turbopack), React 19, Tailwind CSS 4, GSAP + Lenis for scroll
motion, and Privy + wagmi for sign-in and wallets on Base Sepolia.

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in NEXT_PUBLIC_PRIVY_APP_ID
npm run dev                  # http://localhost:3000
```

Without a Privy app id the site still runs; sign-in is shown as unavailable.

### Privy dashboard

In [dashboard.privy.io](https://dashboard.privy.io), for the app whose id is in `.env.local`:

- **User management → Authentication:** enable the login methods you want (email,
  wallet, Google, Farcaster). The sign-in modal shows exactly what is enabled there.
- **App settings → Domains:** add `http://localhost:3000`, the deployed URL, and
  `https://farcaster.xyz` for the Farcaster mini-app.

The **App secret** is for servers only. Never put it in a `NEXT_PUBLIC_` variable.

## Scripts

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Dev server with hot reload       |
| `npm run build` | Production build                 |
| `npm run start` | Serve the production build       |
| `npm run lint`  | ESLint                           |

## Layout

```
src/
  app/              layout (fonts, providers), page, global styles, favicon
  components/       page sections (Hero, Explore, HowItWorks, Benefits, Faq, Footer)
    wallet/         Privy/wagmi providers, sign-in button, account menu, mini-app login
  lib/              wagmi and Privy config, GSAP/Lenis setup, shared hooks, demo data
public/             benefit tile artwork, standalone logo
```

## Notes

- Fonts load through `next/font/google`, so the build fetches them from Google Fonts.
  Offline, Next.js falls back to system fonts and logs a warning.
- `next.config.ts` turns off Turbopack's on-disk caches, which have served stale CSS
  in development.
- Market data on the page (hero timeline, market card, phone screens) is demo content
  until markets are read from the contracts.
