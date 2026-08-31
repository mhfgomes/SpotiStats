"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { TrackSnapshotItem } from "@/components/stats/SnapshotBoard";

interface SnapshotTrackMetadata {
  popularity: number;
  durationMs: number;
  albumExternalUrl?: string;
  artistSpotifyIds: string[];
  externalUrl: string;
}

export function useSnapshotTrackMetadata(items: TrackSnapshotItem[]) {
  const getTrackSnapshotMetadata = useAction(api.spotifyLive.getTrackSnapshotMetadata);
  const [data, setData] = useState<Record<string, SnapshotTrackMetadata>>({});
  const [resolvedRequestKey, setResolvedRequestKey] = useState("");

  const requestKey = useMemo(
    () =>
      items
        .filter(
          (item) =>
            typeof item.popularity !== "number" ||
            typeof item.durationMs !== "number"
        )
        .map((item) => item.trackSpotifyId)
        .join(","),
    [items]
  );

  useEffect(() => {
    if (!requestKey) {
      return;
    }

    let cancelled = false;
    const trackIds = requestKey.split(",");

    getTrackSnapshotMetadata({ trackIds })
      .then((results) => {
        if (cancelled) return;

        setData(
          Object.fromEntries(
            results.map((result) => [
              result.trackSpotifyId,
              {
                popularity: result.popularity,
                durationMs: result.durationMs,
                albumExternalUrl: result.albumExternalUrl,
                artistSpotifyIds: result.artistSpotifyIds,
                externalUrl: result.externalUrl,
              },
            ])
          )
        );
        setResolvedRequestKey(requestKey);
      })
      .catch(() => {
        if (cancelled) return;
        setData({});
        setResolvedRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [getTrackSnapshotMetadata, requestKey]);

  if (!requestKey) {
    return { data: {}, isLoading: false };
  }

  return { data, isLoading: resolvedRequestKey !== requestKey };
}
