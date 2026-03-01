"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { getSpotifyToken } from "./tokenHelper";
import { syncTopTracks, syncTopArtists } from "./fetchTopItems";
import { syncRecentlyPlayed } from "./fetchRecentlyPlayed";

/**
 * Full sync for a single user: fetches top tracks, top artists, and recently
 * played from Spotify and stores them in Convex.
 */
export const fullSync = internalAction({
  args: {
    betterAuthUserId: v.string(),
    spotifyUserId: v.id("spotifyUsers"),
  },
  handler: async (ctx, { betterAuthUserId, spotifyUserId }) => {
    await ctx.runMutation(internal.users.setSyncInProgress, {
      spotifyUserId,
      inProgress: true,
    });

    try {
      const accessToken = await getSpotifyToken(ctx, betterAuthUserId);

      await syncTopTracks(ctx, spotifyUserId, accessToken);
      await syncTopArtists(ctx, spotifyUserId, accessToken);
      await syncRecentlyPlayed(ctx, spotifyUserId, accessToken);

      await ctx.runMutation(internal.users.updateLastSynced, { spotifyUserId });
    } finally {
      await ctx.runMutation(internal.users.setSyncInProgress, {
        spotifyUserId,
        inProgress: false,
      });
    }
  },
});

/**
 * Fan-out: sync all users (called by cron every 6h).
 */
export const fullSyncAllUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getAllSpotifyUsers, {});
    await Promise.allSettled(
      users.map((user: Doc<"spotifyUsers">) =>
        ctx.runAction(internal.spotify.sync.fullSync, {
          betterAuthUserId: user.betterAuthUserId,
          spotifyUserId: user._id,
        })
      )
    );
  },
});

/**
 * Fan-out: sync only recently played for all users (called by cron every 30m).
 */
export const syncRecentlyPlayedAllUsers = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.users.getAllSpotifyUsers, {});
    await Promise.allSettled(
      users.map(async (user: Doc<"spotifyUsers">) => {
        try {
          const accessToken = await getSpotifyToken(ctx, user.betterAuthUserId);
          await syncRecentlyPlayed(ctx, user._id, accessToken);
        } catch (err) {
          console.error(`Failed to sync history for user ${user._id}:`, err);
        }
      })
    );
  },
});
