"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { TimeRange } from "@/types/spotify";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";

interface GenreBreakdownProps {
  timeRange: TimeRange;
}

type GenreChartView = "ranking" | "share";

const GENRE_CHART_COLORS = [
  "#22c55e",
  "#06b6d4",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#3b82f6",
  "#f97316",
  "#14b8a6",
  "#eab308",
  "#a855f7",
  "#10b981",
  "#fb7185",
  "#38bdf8",
  "#84cc16",
];

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    value: number;
    name?: string;
    payload: { genre: string; count: number; share?: number };
  }>;
}) => {
  if (active && payload?.length) {
    const item = payload[0].payload;
    const share = item.share ?? 0;

    return (
      <div className="bg-spotify-card border border-white/10 rounded-lg px-3 py-2">
        <p className="text-sm font-medium">{item.genre}</p>
        <p className="text-xs text-spotify-subtext">
          Score: {item.count}
        </p>
        {share > 0 ? (
          <p className="text-xs text-spotify-subtext">
            Share: {share.toFixed(1)}%
          </p>
        ) : null}
      </div>
    );
  }
  return null;
};

function GenreBreakdownSkeleton({ view }: { view: GenreChartView }) {
  const barWidths = ["85%", "72%", "65%", "58%", "50%", "44%", "38%", "32%", "26%", "20%"];

  if (view === "share") {
    return (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
        <div className="flex h-[320px] items-center justify-center">
          <Skeleton className="h-56 w-56 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/10 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-10" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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

export function GenreBreakdown({ timeRange }: GenreBreakdownProps) {
  const [view, setView] = useState<GenreChartView>("ranking");
  const { data, error, isLoading, isRefreshing } = useSpotifyTopData(timeRange);
  const genres = data?.genres ?? [];

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">Could not load genre data.</p>
        <p className="text-spotify-subtext text-xs mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {view === "ranking" ? "Genre Ranking" : "Genre Share"}
            </p>
            <p className="text-xs text-spotify-subtext">
              {view === "ranking"
                ? "Weighted by your top artist positions"
                : "Portion of the total score across your top genres"}
            </p>
          </div>

          <div className="inline-flex w-fit rounded-full border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setView("ranking")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "ranking"
                  ? "bg-white text-black"
                  : "text-spotify-subtext hover:text-white"
              }`}
            >
              Ranking
            </button>
            <button
              type="button"
              onClick={() => setView("share")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "share"
                  ? "bg-white text-black"
                  : "text-spotify-subtext hover:text-white"
              }`}
            >
              Share
            </button>
          </div>
        </div>

        <GenreBreakdownSkeleton view={view} />
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
  const totalScore = top15.reduce((sum, genre) => sum + genre.count, 0);
  const chartData = top15.map((genre, index) => ({
    ...genre,
    share: totalScore > 0 ? (genre.count / totalScore) * 100 : 0,
    fill: GENRE_CHART_COLORS[index % GENRE_CHART_COLORS.length],
  }));

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {view === "ranking" ? "Genre Ranking" : "Genre Share"}
          </p>
          <p className="text-xs text-spotify-subtext">
            {view === "ranking"
              ? "Weighted by your top artist positions"
              : "Portion of the total score across your top genres"}
          </p>
        </div>

        <div className="inline-flex w-fit rounded-full border border-white/10 bg-black/20 p-1">
          <button
            type="button"
            onClick={() => setView("ranking")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "ranking"
                ? "bg-white text-black"
                : "text-spotify-subtext hover:text-white"
            }`}
          >
            Ranking
          </button>
          <button
            type="button"
            onClick={() => setView("share")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              view === "share"
                ? "bg-white text-black"
                : "text-spotify-subtext hover:text-white"
            }`}
          >
            Share
          </button>
        </div>
      </div>

      {isLoading || isRefreshing ? (
        <GenreBreakdownSkeleton view={view} />
      ) : view === "ranking" ? (
        <div className="min-w-0 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
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
                {chartData.map((entry) => (
                  <Cell key={entry.genre} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_180px]">
          <div className="min-w-0 h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.slice(0, 8)}
                  dataKey="count"
                  nameKey="genre"
                  innerRadius={68}
                  outerRadius={108}
                  paddingAngle={2}
                  stroke="rgba(18,18,18,0.9)"
                  strokeWidth={2}
                >
                  {chartData.slice(0, 8).map((entry) => (
                    <Cell key={entry.genre} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {chartData.slice(0, 8).map((genre) => (
              <div
                key={genre.genre}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/6 bg-black/10 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: genre.fill }}
                  />
                  <span className="truncate text-xs text-white/90">
                    {genre.genre}
                  </span>
                </div>
                <span className="shrink-0 text-xs font-medium text-spotify-subtext">
                  {genre.share.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
