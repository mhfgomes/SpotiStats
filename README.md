# SpotiStats

A Spotify analytics product with a Next.js web dashboard and an Expo React Native app, managed as a pnpm monorepo.

## Workspace

```text
apps/
├── web/       Next.js, Convex, Better Auth, and Spotify API integration
└── mobile/    Expo SDK 57 and Expo Router
```

## Requirements

- Node.js 22.13 or newer
- pnpm 10 or newer
- A Spotify developer application

## Install

```bash
pnpm install
```

Copy `apps/web/example.env` to `apps/web/.env.local`, then configure Spotify, Convex, and Better Auth as described in [SETUP.md](./SETUP.md).

## Development

```bash
pnpm dev           # web app
pnpm dev:mobile    # Expo development server
```

From the Expo terminal, press `i` for iOS, `a` for Android, or `w` for web.

The mobile app talks directly to the public Convex HTTP endpoint for authentication and reuses the web app's public Convex URLs during local development. For a deployed build, copy `apps/mobile/.env.example` to `apps/mobile/.env.local` and provide the deployment URLs.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build:ci
```

## Features

- Top tracks and artists across Spotify time ranges
- Listening history and genre analysis
- Historical snapshots and rank changes
- Taste profiles and shareable recap cards
- A native mobile listening dashboard

## License

MIT
