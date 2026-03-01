import { internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

export const getCursor = internalQuery({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }) => {
    const doc = await ctx.db
      .query("syncCursors")
      .withIndex("by_spotifyUser", (q) =>
        q.eq("spotifyUserId", spotifyUserId)
      )
      .unique();
    return doc?.recentlyPlayedAfterCursor;
  },
});

export const getSyncStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const spotifyUser = await ctx.db
      .query("spotifyUsers")
      .withIndex("by_betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", identity.subject)
      )
      .unique();

    if (!spotifyUser) return null;

    return {
      lastSyncedAt: spotifyUser.lastSyncedAt ?? null,
      syncInProgress: spotifyUser.syncInProgress,
    };
  },
});
