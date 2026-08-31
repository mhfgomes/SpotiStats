"use node";

import { internalAction, action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getSpotifyToken } from "./spotify/tokenHelper";

export const getNowPlayingInternal = internalAction({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }) => {
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
  },
});

type NowPlayingResult = {
  trackName: string;
  artistNames: string[];
  albumName: string;
  albumImageUrl: string | null;
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
} | null;

export const getNowPlayingPublic = action({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }): Promise<NowPlayingResult> => {
    return ctx.runAction(internal.nowPlaying.getNowPlayingInternal, {
      spotifyUserId,
    });
  },
});
