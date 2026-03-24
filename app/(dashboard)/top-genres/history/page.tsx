"use client";

import { TopHistoryPage } from "@/components/stats/TopHistoryPage";

export default function TopGenresHistoryPage() {
  return (
    <TopHistoryPage
      kind="genres"
      backHref="/top-genres"
      backLabel="Back to Top Genres"
      description="Browse saved snapshots of your top genres across Spotify syncs."
    />
  );
}
