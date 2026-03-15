# SpotiStats

A personal Spotify analytics dashboard built with Next.js, Convex, and Better Auth. View your listening history, top tracks, top artists, genres, and generate shareable stats cards.

## Features

- **Top Tracks & Artists** — View your most-played music across different time ranges (4 weeks, 6 months, all time)
- **Listening History** — Browse your recently played tracks fetched live from Spotify
- **Genre Analysis** — See your top genres with visual breakdowns
- **Taste Profile** — Interactive radar chart showing your music preferences
- **Shareable Stats Card** — Generate downloadable PNG cards with your all-time stats
- **Live Banner API** — Dynamic image URL for GitHub READMEs, Discord bios, etc.
- **Auto-Sync** — Background sync for top tracks and artists via Convex cron jobs

## Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS, Recharts
- **Backend**: Convex (database, functions, cron jobs)
- **Auth**: Better Auth with Spotify OAuth
- **API**: Spotify Web API

## Project Structure

```
app/
├── (auth)/login/         # Spotify OAuth login page
├── (dashboard)/          # Protected dashboard routes
│   ├── top-tracks/       # Top tracks view
│   ├── top-artists/      # Top artists view
│   ├── top-genres/       # Genre breakdown
│   ├── history/          # Recently played
│   ├── taste-profile/    # Radar chart
│   ├── recap/            # Shareable card generator
│   └── stats-card/       # Stats card view
├── api/                  # API routes
│   ├── auth/             # Better Auth callbacks
│   ├── card/[userId]/    # Dynamic stats card image
│   └── now-playing/      # Now playing widget

components/
├── layout/               # Sidebar, top bar, providers
├── recap/                # Share card components
├── stats/                # Charts, lists, visualizations
└── ui/                   # Radix UI primitives

convex/
├── auth.ts               # Better Auth integration
├── crons.ts              # Scheduled top tracks/artists sync
├── schema.ts             # Database schema
├── spotify/              # Spotify API sync functions
└── *.ts                  # Queries and mutations
```

## Database Schema

- **spotifyUsers** — User profiles linked to Better Auth
- **topTracks** — Top 50 tracks per user per time range
- **topArtists** — Top 50 artists per user per time range

## Getting Started

### Prerequisites

- [bun](https://bun.sh) installed
- Spotify Developer account

### Setup

1. **Clone and install**

   ```bash
   bun install
   ```

2. **Create Spotify App**

   - Go to https://developer.spotify.com/dashboard
   - Create a new app
   - Add Redirect URI: `http://127.0.0.1:3000/api/auth/callback/spotify`
   - Note your Client ID and Client Secret

3. **Initialize Convex**

   ```bash
   bunx convex dev
   ```

   Copy the deployment URLs to `.env.local` when prompted.

4. **Set environment variables**

   ```bash
   bunx convex env set BETTER_AUTH_SECRET "$(openssl rand -base64 32)"
   bunx convex env set SITE_URL "http://127.0.0.1:3000"
   bunx convex env set SPOTIFY_CLIENT_ID "<your-client-id>"
   bunx convex env set SPOTIFY_CLIENT_SECRET "<your-client-secret>"
   ```

5. **Run development servers**

   ```bash
   # Terminal 1
   bunx convex dev

   # Terminal 2
   bun dev
   ```

6. Open http://127.0.0.1:3000 and sign in with Spotify

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Scripts

```bash
bun dev          # Start Next.js dev server
bunx convex dev  # Start Convex dev server
bun run build    # Build for production
bun run lint     # Run ESLint
```

## License

MIT
