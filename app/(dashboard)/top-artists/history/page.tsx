"use client";

import { TopHistoryPage } from "@/components/stats/TopHistoryPage";

export default function TopArtistsHistoryPage() {
  return (
    <TopHistoryPage
      kind="artists"
      backHref="/top-artists"
      backLabel="Back to Top Artists"
      description="Browse saved snapshots of your top artists across Spotify syncs."
    />
  );
}
