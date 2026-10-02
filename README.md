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

## Mobile release builds

The Mobile release workflow builds Android and iOS in parallel. Mobile changes on
`main` populate the Gradle and iOS compiler caches that subsequent release tags
can restore. Pull requests touching the mobile app, shared dependency files, or
the mobile workflows run native test builds with those caches read-only. Both
the Android APK and unsigned iOS IPA are uploaded and linked in a PR comment,
which is updated after successful builds of new commits. Downloads require
GitHub sign-in and expire after seven days; the iOS IPA requires signing before
installation on a device. Fork PR comments use a separate trusted workflow that
becomes active once it exists on the default branch. Only `v*` tags and manual
release dispatches publish releases.
The first build after merging these workflow changes will populate cold caches.

Android APKs target `arm64-v8a` by default, supporting modern 64-bit ARM phones.
They do not support 32-bit ARM devices or x86 emulators. To package additional
architectures locally, override the default:

```bash
ANDROID_ARCHITECTURES=arm64-v8a,armeabi-v7a,x86,x86_64 pnpm package:android
```

Android builds enable Gradle task-output caching and parallel execution. iOS
builds enable React Native's ccache support before CocoaPods installation, cache
compiler outputs by runner architecture and Xcode version, and report cache hit
statistics in the workflow logs. Native projects are still generated from the
current app configuration rather than restored from a cache.

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
