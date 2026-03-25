"use client";

import { TasteRadar } from "@/components/stats/TasteRadar";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpotifyTopData } from "@/hooks/useSpotifyTopData";

const AXIS_META: Record<string, { desc: string }> = {
  Energy:       { desc: "Electronic, dance, hip-hop, metal — high-tempo and high-intensity music" },
  Acoustic:     { desc: "Folk, singer-songwriter, classical — organic and unplugged sounds" },
  Mood:         { desc: "Jazz, soul, R&B, lo-fi — emotionally rich and introspective listening" },
  Experimental: { desc: "Avant-garde, psychedelic, post-rock — unconventional and boundary-pushing" },
  Mainstream:   { desc: "Pop, dance pop, chart hits — widely popular and commercially produced" },
  Underground:  { desc: "Indie, alternative, shoegaze — niche genres and DIY scenes" },
};

const AXIS_ORDER = Object.keys(AXIS_META);

function TasteProfileSkeleton() {
  return (
    <div className="spotify-card p-6 flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 shrink-0">
        <div className="relative h-[340px] w-full overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative size-60 rounded-full border border-white/10">
              <div className="absolute inset-5 rounded-full border border-white/10" />
              <div className="absolute inset-10 rounded-full border border-white/10" />
              <div className="absolute inset-[4.5rem] rounded-full border border-white/10" />
              <Skeleton className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-spotify-green/20" />
            </div>
          </div>

          <Skeleton className="absolute left-1/2 top-3 h-4 w-20 -translate-x-1/2 rounded-full" />
          <Skeleton className="absolute bottom-3 left-1/2 h-4 w-24 -translate-x-1/2 rounded-full" />
          <Skeleton className="absolute left-5 top-1/2 h-4 w-24 -translate-y-1/2 rounded-full" />
          <Skeleton className="absolute right-5 top-1/2 h-4 w-24 -translate-y-1/2 rounded-full" />
          <Skeleton className="absolute left-10 top-12 h-4 w-20 rounded-full" />
          <Skeleton className="absolute bottom-12 right-10 h-4 w-24 rounded-full" />
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {AXIS_ORDER.map((axis, index) => (
          <div key={axis}>
            <div className="flex items-center justify-between mb-1">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <Skeleton
              className="mb-1.5 h-1.5 rounded-full"
              style={{ width: `${88 - index * 4}%` }}
            />
            <Skeleton className="h-3 w-full max-w-md rounded-full" />
            <Skeleton className="mt-1 h-3 w-4/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TasteProfilePage() {
  const { data, error, isLoading } = useSpotifyTopData("short_term");
  const profile = data?.tasteProfile ?? [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-spotify-subtext text-sm">
          Based on your top artists&apos; genres over the past 4 weeks
        </p>
      </div>

      {isLoading ? (
        <TasteProfileSkeleton />
      ) : error ? (
        <div className="spotify-card p-6 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-spotify-subtext text-sm">Could not load taste profile.</p>
          <p className="text-spotify-subtext text-xs mt-1">{error}</p>
        </div>
      ) : profile.length === 0 ? (
        <div className="spotify-card p-6 flex flex-col items-center justify-center py-16 text-center">
          <p className="text-spotify-subtext text-sm">No taste profile data yet.</p>
          <p className="text-spotify-subtext text-xs mt-1">
            Spotify did not return enough artist genre data yet.
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
