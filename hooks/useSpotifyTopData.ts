"use client";

import { useEffect, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TimeRange } from "@/types/spotify";
import type {
  LiveTopArtist,
  LiveTopGenre,
  LiveTopTrack,
  TasteProfilePoint,
} from "@/lib/spotify-live";

interface SpotifyTopData {
  tracks: LiveTopTrack[];
  artists: LiveTopArtist[];
  genres: LiveTopGenre[];
  tasteProfile: TasteProfilePoint[];
  hasComparisonSnapshot: boolean;
  previousTrackRanks: Record<string, number>;
  previousArtistRanks: Record<string, number>;
  previousGenreRanks: Record<string, number>;
}

interface SpotifyTopDataState {
  data: SpotifyTopData | null;
  error: string | null;
  isLoading: boolean;
}

export function useSpotifyTopData(timeRange: TimeRange): SpotifyTopDataState {
  const getTopData = useAction(api.spotifyLive.getCurrentUserTopData);
  const [state, setState] = useState<SpotifyTopDataState>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    let cancelled = false;

    setState((current) => ({
      data: current.data,
      error: null,
      isLoading: true,
    }));

    getTopData({ timeRange })
      .then((data) => {
        if (cancelled) return;
        setState({ data, error: null, isLoading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          data: null,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load Spotify stats.",
          isLoading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [getTopData, timeRange]);

  return state;
}
