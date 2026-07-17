"use client";

import { RecentlyPlayed } from "@/components/stats/RecentlyPlayed";
import { SyncStatus } from "@/components/stats/SyncStatus";

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-spotify-subtext">
          Your recently played tracks, fetched live from Spotify
        </p>
        <SyncStatus />
      </div>

      <div className="spotify-card">
        <div className="flex items-center gap-4 border-b border-white/5 px-3 py-2 text-xs uppercase tracking-wider text-spotify-subtext">
          <span className="w-10 shrink-0" />
          <span className="min-w-0 flex-1">Track</span>
          <span className="hidden min-w-0 flex-1 md:flex">Artist</span>
          <span className="hidden min-w-0 flex-1 lg:flex">Album</span>
          <span className="hidden shrink-0 sm:block">Played at</span>
        </div>
        <RecentlyPlayed />
      </div>
    </div>
  );
}
