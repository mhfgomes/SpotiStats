"use client";

import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

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

interface TasteRadarProps {
  profile: { axis: string; value: number }[];
}

export function TasteRadar({ profile }: TasteRadarProps) {
  return (
    <ResponsiveContainer width="100%" height={340}>
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
