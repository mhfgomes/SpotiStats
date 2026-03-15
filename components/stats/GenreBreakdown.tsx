"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";
import { getRankChange, RankChangeBadge } from "./RankChangeBadge";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";

interface GenreBreakdownProps {
  timeRange: TimeRange;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { genre: string } }>;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-spotify-card border border-white/10 rounded-lg px-3 py-2">
        <p className="text-sm font-medium">{payload[0].payload.genre}</p>
        <p className="text-xs text-spotify-subtext">
          Score: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function GenreBreakdown({ timeRange }: GenreBreakdownProps) {
  const { data, error, isLoading } = useSpotifyTopData(timeRange);
  const genres = data?.genres ?? [];

  if (isLoading) {
    const barWidths = ["85%", "72%", "65%", "58%", "50%", "44%", "38%", "32%", "26%", "20%"];
    return (
      <div className="space-y-5 py-2">
        {barWidths.map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-32 shrink-0" />
            <Skeleton className="h-6 rounded-sm" style={{ width: w }} />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">Could not load genre data.</p>
        <p className="text-spotify-subtext text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (genres.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">No genre data available.</p>
      </div>
    );
  }

  const top15 = genres.slice(0, 15);

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={top15}
          layout="vertical"
          margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#B3B3B3", fontSize: 11 }}
          />
          <YAxis
            dataKey="genre"
            type="category"
            width={140}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#fff", fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {top15.map((entry: { genre: string; count: number }, index: number) => (
              <Cell
                key={entry.genre}
                fill={
                  index === 0
                    ? "#1DB954"
                    : `rgba(29,185,84,${Math.max(0.2, 1 - index * 0.06)})`
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="rounded-xl border border-white/8 bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
          <p className="text-sm font-medium">Relative Position</p>
          <p className="text-xs text-spotify-subtext">
            Compared with the previous saved snapshot
          </p>
        </div>

        <div className="divide-y divide-white/5">
          {top15.slice(0, 10).map((genre, index) => {
            const previousRank = data?.hasComparisonSnapshot
              ? data.previousGenreRanks[genre.genre] ?? null
              : undefined;

            return (
              <div
                key={genre.genre}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="flex w-12 shrink-0 items-center gap-2">
                  <div className="flex w-4 justify-center">
                    <RankChangeBadge
                      change={getRankChange(index + 1, previousRank)}
                    />
                  </div>
                  <span className="w-6 text-right font-mono text-sm text-spotify-subtext">
                    {index + 1}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{genre.genre}</p>
                  <p className="text-xs text-spotify-subtext">
                    Score {genre.count}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
