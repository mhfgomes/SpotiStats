"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";
import { CARD_THEMES, type CardThemeKey } from "@/lib/themes";
import { NowPlayingCard } from "@/components/public-profile/NowPlayingCard";

// Spotify has no push API for playback, so skips are picked up on the next poll.
const POLL_INTERVAL_MS = 10_000;
// Small grace period so we refetch just after the track should have ended.
const TRACK_END_GRACE_MS = 1_500;

type NowPlaying = FunctionReturnType<typeof api.nowPlaying.getNowPlayingForProfile>;

export function NowPlayingWidget({
  handle,
  themeKey,
}: {
  handle: string;
  themeKey: string;
}) {
  const getNowPlaying = useAction(api.nowPlaying.getNowPlayingForProfile);
  const [snapshot, setSnapshot] = useState<{ data: NowPlaying; fetchedAt: number } | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const theme = CARD_THEMES[themeKey as CardThemeKey] ?? CARD_THEMES.midnight;

  const requestId = useRef(0);
  const load = useCallback(() => {
    const id = ++requestId.current;
    getNowPlaying({ handle })
      .then((data) => {
        if (id === requestId.current) setSnapshot({ data, fetchedAt: Date.now() });
      })
      .catch(() => {
        if (id === requestId.current) setSnapshot({ data: null, fetchedAt: Date.now() });
      });
  }, [getNowPlaying, handle]);

  // Poll while the tab is visible; refetch as soon as it becomes visible again.
  useEffect(() => {
    const requests = requestId;
    let interval: ReturnType<typeof setInterval> | undefined;
    const start = () => {
      clearInterval(interval);
      load();
      interval = setInterval(load, POLL_INTERVAL_MS);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") start();
      else clearInterval(interval);
    };

    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      requests.current++; // ignore responses still in flight
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [load]);

  // Refetch right when the current track should finish, instead of waiting for the next poll.
  const remainingMs =
    snapshot?.data?.isPlaying
      ? snapshot.data.durationMs - snapshot.data.progressMs
      : null;
  useEffect(() => {
    if (remainingMs == null) return;
    const timeout = setTimeout(load, Math.max(0, remainingMs) + TRACK_END_GRACE_MS);
    return () => clearTimeout(timeout);
  }, [remainingMs, snapshot?.fetchedAt, load]);

  // Advance the progress bar between polls while playing.
  const isPlaying = Boolean(snapshot?.data?.isPlaying);
  useEffect(() => {
    if (!isPlaying) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [isPlaying]);

  const data = snapshot?.data ?? null;
  const track = data && {
    ...data,
    progressMs: data.isPlaying
      ? Math.min(data.durationMs, data.progressMs + Math.max(0, now - snapshot!.fetchedAt))
      : data.progressMs,
  };

  return <NowPlayingCard track={track} theme={theme} />;
}
