"use client";

import { usePathname } from "next/navigation";
import { SyncStatus } from "@/components/stats/SyncStatus";

const PAGE_TITLES: Record<string, string> = {
  "/top-tracks": "Top Tracks",
  "/top-tracks/history": "Top Tracks History",
  "/top-artists": "Top Artists",
  "/top-artists/history": "Top Artists History",
  "/top-genres": "Top Genres",
  "/history": "Listening History",
  "/taste-profile": "Taste Profile",
  "/recap": "Year in Music",
  "/stats-card/classic":     "Classic Card",
  "/stats-card/tracks":      "Tracks Card",
  "/stats-card/artists":     "Artists Card",
  "/stats-card/compact":     "Compact Card",
  "/stats-card/now-playing": "Now Playing Banner",
  "/stats-card/recap":       "Recap Card",
};

export function TopBar() {
  const pathname = usePathname();
  const title = PAGE_TITLES[pathname] ?? "SpotiStats";

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-spotify-black/80 backdrop-blur border-b border-white/5">
      <h1 className="text-lg font-bold">{title}</h1>
      <SyncStatus />
    </header>
  );
}
