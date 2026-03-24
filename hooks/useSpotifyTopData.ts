"use client";

import { useEffect, useReducer } from "react";
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
  isRefreshing: boolean;
}

type SpotifyTopDataAction =
  | { type: "request" }
  | { type: "success"; data: SpotifyTopData }
  | { type: "error"; error: string };

function spotifyTopDataReducer(
  state: SpotifyTopDataState,
  action: SpotifyTopDataAction
): SpotifyTopDataState {
  switch (action.type) {
    case "request":
      return {
        data: state.data,
        error: null,
        isLoading: state.data === null,
        isRefreshing: state.data !== null,
      };
    case "success":
      return {
        data: action.data,
        error: null,
        isLoading: false,
        isRefreshing: false,
      };
    case "error":
      return {
        data: state.data,
        error: action.error,
        isLoading: false,
        isRefreshing: false,
      };
    default:
      return state;
  }
}

export function useSpotifyTopData(timeRange: TimeRange): SpotifyTopDataState {
  const getTopData = useAction(api.spotifyLive.getCurrentUserTopData);
  const [state, dispatch] = useReducer(spotifyTopDataReducer, {
    data: null,
    error: null,
    isLoading: true,
    isRefreshing: false,
  });

  useEffect(() => {
    let cancelled = false;

    dispatch({ type: "request" });

    getTopData({ timeRange })
      .then((data) => {
        if (cancelled) return;
        dispatch({ type: "success", data });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        dispatch({
          type: "error",
          error:
            error instanceof Error
              ? error.message
              : "Failed to load Spotify stats.",
        });
      });

    return () => {
      cancelled = true;
    };
  }, [getTopData, timeRange]);

  return state;
}
