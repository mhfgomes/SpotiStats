"use client";

import { TopHistoryPage } from "@/components/stats/TopHistoryPage";

export default function TopTracksHistoryPage() {
  return (
    <TopHistoryPage
      kind="tracks"
      backHref="/top-tracks"
      backLabel="Back to Top Tracks"
      description="Browse saved snapshots of your top tracks across Spotify syncs."
    />
  );
}
