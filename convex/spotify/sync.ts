"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { getSpotifyToken } from "./tokenHelper";
import { syncTopTracks, syncTopArtists } from "./fetchTopItems";

/**
 * Full sync for a single user: fetches top tracks and top artists from
 * Spotify and stores them in Convex.
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
