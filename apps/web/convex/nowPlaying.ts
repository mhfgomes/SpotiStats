"use node";

import { internalAction, action, type ActionCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getSpotifyToken } from "./spotify/tokenHelper";

type NowPlayingResult = {
  trackName: string;
  artistNames: string[];
  albumName: string;
  albumImageUrl: string | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
} | null;

// Spotify's currently-playing endpoint is hit at most once per user per TTL,
// however many banner/profile viewers are polling.
const CACHE_TTL_MS = 5_000;

export const getNowPlayingInternal = internalAction({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }): Promise<NowPlayingResult> => {
    const cached = await ctx.runQuery(internal.nowPlayingCache.get, {
      spotifyUserId,
    });
    const now = Date.now();
    if (cached && now - cached.fetchedAt < CACHE_TTL_MS) {
      const data = cached.data;
      if (!data?.isPlaying) return data;
      return {
        ...data,
        progressMs: Math.min(data.durationMs, data.progressMs + (now - cached.fetchedAt)),
      };
    }

    const data = await fetchNowPlaying(ctx, spotifyUserId);
    await ctx.runMutation(internal.nowPlayingCache.set, {
      spotifyUserId,
      data,
      fetchedAt: now,
    });
    return data;
  },
});

async function fetchNowPlaying(
  ctx: ActionCtx,
  spotifyUserId: Id<"spotifyUsers">
): Promise<NowPlayingResult> {
  const user = await ctx.runQuery(internal.users.getSpotifyUserById, {
    id: spotifyUserId,
  });
  if (!user) return null;

  let token: string;
  try {
    token = await getSpotifyToken(ctx, user.betterAuthUserId);
  } catch {
    return null;
  }

  let res: Response;
  try {
    res = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  } catch {
    return null;
  }

  // 204 = nothing playing; non-ok = error or missing scope
  if (res.status === 204 || !res.ok) return null;

  const data = await res.json() as {
    is_playing: boolean;
    progress_ms: number;
    currently_playing_type: string;
    item: {
      name: string;
      duration_ms: number;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
    };
  };

  if (!data?.item || data.currently_playing_type !== "track") return null;

  return {
    trackName: data.item.name,
    artistNames: data.item.artists.map((a) => a.name),
    albumName: data.item.album.name,
    albumImageUrl: data.item.album.images[0]?.url ?? null,
    isPlaying: data.is_playing,
    progressMs: data.progress_ms,
    durationMs: data.item.duration_ms,
  };
}


export const getNowPlayingPublic = action({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }): Promise<NowPlayingResult> => {
    return ctx.runAction(internal.nowPlaying.getNowPlayingInternal, {
      spotifyUserId,
    });
  },
});

/** Public — now playing for a public profile, only if its owner opted in. */
export const getNowPlayingForProfile = action({
  args: { handle: v.string() },
  handler: async (ctx, { handle }): Promise<NowPlayingResult> => {
    const spotifyUserId = await ctx.runQuery(
      internal.publicProfiles.getNowPlayingOwner,
      { handle }
    );
    if (!spotifyUserId) return null;
    return ctx.runAction(internal.nowPlaying.getNowPlayingInternal, {
      spotifyUserId,
    });
  },
});
