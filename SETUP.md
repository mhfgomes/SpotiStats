# SpotiStats Setup Guide

## Prerequisites
- Node.js 22.13+ and pnpm 10+ installed
- A Spotify Developer account

## Step 1 — Spotify Developer App

1. Go to https://developer.spotify.com/dashboard
2. Create a new app
3. Add Redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify`
4. Add the mobile Redirect URI: `https://your-deployment.convex.site/api/auth/callback/spotify`
   ⚠️ Use `127.0.0.1` NOT `localhost` — Spotify rejects `localhost`
5. Note your **Client ID** and **Client Secret**

## Step 2 — Initialize Convex

```bash
pnpm --filter @spotistats/web exec convex dev
```

On first run, this creates a new Convex deployment and generates `convex/_generated/`.

**Stop the process (Ctrl+C) after it logs "Ready! Your project is...".**

Copy the `CONVEX_DEPLOYMENT`, `NEXT_PUBLIC_CONVEX_URL`, and `NEXT_PUBLIC_CONVEX_SITE_URL` from the output into `apps/web/.env.local`.

## Step 3 — Set Convex Environment Variables

```bash
# Generate a secret
openssl rand -base64 32

pnpm --filter @spotistats/web exec convex env set BETTER_AUTH_SECRET "<your-generated-secret>"
pnpm --filter @spotistats/web exec convex env set SITE_URL "http://127.0.0.1:3000"
pnpm --filter @spotistats/web exec convex env set SPOTIFY_CLIENT_ID "<your-client-id>"
pnpm --filter @spotistats/web exec convex env set SPOTIFY_CLIENT_SECRET "<your-client-secret>"
```

## Step 4 — Generate JWKS (Required for JWT auth)

```bash
# Start convex dev, then run:
pnpm --filter @spotistats/web exec convex run auth:generateJwk

# Take the output and set it as an env var:
pnpm --filter @spotistats/web exec convex env set JWKS '<output-from-above>'
```

Wait — the `generateJwk` function isn't defined yet. Better Auth v0.10 requires you to
call `auth.api.rotateKeys()` once to generate the initial JWKS. Add this to `convex/auth.ts`:

```typescript
export const generateJwk = internalAction({
  args: {},
  handler: async (ctx) => {
    const auth = createAuth(ctx);
    return await auth.api.rotateKeys();
  },
});
```

Then set the generated value with the same `pnpm --filter @spotistats/web exec convex env set` command.

## Step 5 — Update .env.local

```bash
# apps/web/.env.local
CONVEX_DEPLOYMENT=dev:your-deployment-slug
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
```

## Step 6 — Run Development

In two terminal tabs:

```bash
# Tab 1
pnpm --filter @spotistats/web exec convex dev

# Tab 2
pnpm dev
```

Open http://127.0.0.1:3000 (not localhost!)

## Step 7 — First Login

1. Click "Continue with Spotify"
2. Authorize the app
3. You'll be redirected to the dashboard
4. Your dashboard will fetch data live from Spotify on load
5. Snapshot history will start saving automatically as you browse

## Mobile app

The Expo app uses the same Better Auth session, Convex deployment, and Spotify actions as the web dashboard.

For simulators, Expo Go, and Expo web, it automatically reads the public Convex URLs from `apps/web/.env.local`. For a deployed build, create `apps/mobile/.env.local`:

```bash
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_AUTH_URL=https://your-deployment.convex.site
```

Then start the backend and mobile app:

```bash
pnpm --filter @spotistats/web exec convex dev
pnpm dev
pnpm dev:mobile
```

For production Expo web, set `EXPO_WEB_URL` in Convex to the deployed Expo origin. The native callback scheme is `spotistats://`.

## Verification Checklist

- [ ] Sign in with Spotify → session established
- [ ] `spotifyUsers` row appears in Convex dashboard
- [ ] `topTrackHistory`, `topArtistHistory`, and `topGenreHistory` snapshots appear after browsing
- [ ] `/top-tracks` shows 50 tracks with album art
- [ ] `/taste-profile` shows the radar chart
- [ ] `/recap` generates a downloadable PNG

## Production Deployment

```bash
# Deploy Convex
pnpm --filter @spotistats/web exec convex deploy

# Deploy Next.js to Vercel
vercel --prod
```

Update Spotify Dashboard redirect URI to your production URL.
Update `SITE_URL` in Convex env to production URL.
