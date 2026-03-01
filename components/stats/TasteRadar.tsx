"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: { axis: string } }>;
}) => {
  if (active && payload?.length) {
    return (
      <div className="bg-spotify-card border border-white/10 rounded-lg px-3 py-2">
        <p className="text-sm font-medium">{payload[0].payload.axis}</p>
        <p className="text-xs text-spotify-subtext">
          {payload[0].value}% match
        </p>
      </div>
    );
  }
  return null;
};

export function TasteRadar() {
  const profile = useQuery(api.tasteProfile.computeTasteProfile);

  if (profile === undefined) {
    return <Skeleton className="h-80 w-full rounded-xl" />;
  }

  if (!profile || profile.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-spotify-subtext text-sm">
          No taste profile data yet.
        </p>
        <p className="text-spotify-subtext text-xs mt-1">
          Sync your top artists to generate your taste profile.
        </p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <RadarChart data={profile} margin={{ top: 20, right: 40, bottom: 20, left: 40 }}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="axis"
          tick={{ fill: "#fff", fontSize: 13, fontWeight: 500 }}
        />
        <Radar
          name="Taste"
          dataKey="value"
          stroke="#1DB954"
          fill="#1DB954"
          fillOpacity={0.6}
          strokeWidth={2}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
