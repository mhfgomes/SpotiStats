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
- pnpm 12.8.1 or newer
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

## Dependency compatibility

Use `pnpm --filter @spotistats/mobile exec expo install --check` and `pnpm peers check` when updating dependencies.

- Expo SDK 57 requires React 19.2.3, React Native 0.86.3, and its supported native-library versions. Keep these aligned with Expo's compatibility check.
- `@convex-dev/better-auth` 0.12.5 requires Better Auth below 1.7. Keep `better-auth`, `@better-auth/core`, and `@better-auth/expo` on the same supported release.
- The current React ESLint plugin supports ESLint 9, and the TypeScript ESLint parser supports TypeScript below 6.1. Keep ESLint 9.39.5 and TypeScript 6.0.3 until their plugins support newer majors.
- The Xcode tooling's `uuid` dependency is overridden to 11.1.1 to include security fixes while preserving CommonJS support. Expo Router's `query-string` still uses a vulnerable `decode-uri-component`; the patched decoder is ESM and requires an upstream migration.

## Features

- Top tracks and artists across Spotify time ranges
- Listening history and genre analysis
- Historical snapshots and rank changes
- Taste profiles and shareable recap cards
- A native mobile listening dashboard

## License

MIT
