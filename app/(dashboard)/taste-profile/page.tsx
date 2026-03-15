"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TasteRadar } from "@/components/stats/TasteRadar";
import { Skeleton } from "@/components/ui/skeleton";

const AXIS_META: Record<string, { desc: string }> = {
  Energy:       { desc: "Electronic, dance, hip-hop, metal — high-tempo and high-intensity music" },
  Acoustic:     { desc: "Folk, singer-songwriter, classical — organic and unplugged sounds" },
  Mood:         { desc: "Jazz, soul, R&B, lo-fi — emotionally rich and introspective listening" },
  Experimental: { desc: "Avant-garde, psychedelic, post-rock — unconventional and boundary-pushing" },
  Mainstream:   { desc: "Pop, dance pop, chart hits — widely popular and commercially produced" },
  Underground:  { desc: "Indie, alternative, shoegaze — niche genres and DIY scenes" },
};

export default function TasteProfilePage() {
  const profile = useQuery(api.tasteProfile.computeTasteProfile);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-spotify-subtext text-sm">
          Based on your top artists&apos; genres over the past 4 weeks
        </p>
      </div>

      {profile === undefined ? (
        <div className="spotify-card p-6 flex gap-8">
          <Skeleton className="h-80 w-full rounded-xl" />
        </div>
      ) : !profile || profile.length === 0 ? (
        <div className="spotify-card p-6 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-spotify-subtext text-sm">No taste profile data yet.</p>
          <p className="text-spotify-subtext text-xs mt-1">
            Sync your top artists to generate your taste profile.
          </p>
        </div>
      ) : (
        <div className="spotify-card p-6 flex flex-col lg:flex-row gap-6">

          {/* Radar chart */}
          <div className="lg:w-1/2 shrink-0">
            <TasteRadar profile={profile} />
          </div>

          {/* Axis breakdown */}
          <div className="flex-1 flex flex-col justify-center gap-4">
            {profile.map(({ axis, value }) => (
              <div key={axis}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white">{axis}</span>
                  <span className="text-sm font-bold text-spotify-green tabular-nums">{value}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="h-full bg-spotify-green rounded-full transition-all duration-500"
                    style={{ width: `${value}%` }}
                  />
                </div>
                <p className="text-xs text-spotify-subtext leading-snug">
                  {AXIS_META[axis]?.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
