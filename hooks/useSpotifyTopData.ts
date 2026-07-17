"use client";

import { useCallback, useEffect, useReducer } from "react";
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
  previousTrackSnapshotSyncedAt: number | null;
  previousArtistSnapshotSyncedAt: number | null;
  previousGenreSnapshotSyncedAt: number | null;
  previousTrackRanks: Record<string, number>;
  previousArtistRanks: Record<string, number>;
  previousGenreRanks: Record<string, number>;
}

interface SpotifyTopDataState {
  data: SpotifyTopData | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  refetch: () => void;
}

type SpotifyTopDataAction =
  | { type: "request" }
  | { type: "success"; data: SpotifyTopData }
  | { type: "error"; error: string };

function spotifyTopDataReducer(
  state: Omit<SpotifyTopDataState, "refetch">,
  action: SpotifyTopDataAction
): Omit<SpotifyTopDataState, "refetch"> {
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
  const [reloadToken, setReloadToken] = useReducer((n: number) => n + 1, 0);

  const refetch = useCallback(() => {
    setReloadToken();
  }, []);

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
  }, [getTopData, timeRange, reloadToken]);

  return { ...state, refetch };
}
