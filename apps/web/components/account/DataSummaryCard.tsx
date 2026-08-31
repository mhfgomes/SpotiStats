"use client";

import { Disc3, Mic2, Music2 } from "lucide-react";
import type { AccountPageData } from "@/lib/account";
import { formatDate } from "@/lib/account";

type DataSummaryCardProps = {
  dataSummary: AccountPageData["dataSummary"];
};

type DatasetInfo = {
  label: string;
  icon: typeof Music2;
  snapshotCount: number;
  latestSyncedAt: number | null;
};

export function DataSummaryCard({ dataSummary }: DataSummaryCardProps) {
  const datasets: DatasetInfo[] = [
    {
      label: "Tracks",
      icon: Music2,
      snapshotCount: dataSummary.tracks.snapshotCount,
      latestSyncedAt: dataSummary.tracks.latestSyncedAt,
    },
    {
      label: "Artists",
      icon: Mic2,
      snapshotCount: dataSummary.artists.snapshotCount,
      latestSyncedAt: dataSummary.artists.latestSyncedAt,
    },
    {
      label: "Genres",
      icon: Disc3,
      snapshotCount: dataSummary.genres.snapshotCount,
      latestSyncedAt: dataSummary.genres.latestSyncedAt,
    },
  ];

  return (
    <section className="spotify-card overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <h2 className="text-base font-semibold text-white">Your Data</h2>
        <p className="mt-1 text-sm text-spotify-subtext">
          {dataSummary.latestSyncedAt
            ? `Last synced ${formatDate(dataSummary.latestSyncedAt)}`
            : "No data synced yet"}
        </p>
      </div>

      <div className="grid grid-cols-3 divide-x divide-white/5">
        {datasets.map(({ label, icon: Icon, snapshotCount, latestSyncedAt }) => (
          <div key={label} className="px-5 py-5 text-center">
            <Icon className="mx-auto h-5 w-5 text-spotify-green" />
            <p className="mt-3 text-2xl font-bold tabular-nums text-white">
              {snapshotCount}
            </p>
            <p className="mt-0.5 text-xs text-spotify-subtext">
              {label} {snapshotCount === 1 ? "snapshot" : "snapshots"}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
