import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const historyItemValidator = v.object({
  spotifyUserId: v.id("spotifyUsers"),
  trackSpotifyId: v.string(),
  trackName: v.string(),
  albumName: v.string(),
  albumImageUrl: v.optional(v.string()),
  artistNames: v.array(v.string()),
  playedAt: v.number(),
  contextType: v.optional(v.string()),
  contextUri: v.optional(v.string()),
});

export const appendPlayHistory = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    items: v.array(historyItemValidator),
    newCursor: v.string(),
  },
  handler: async (ctx, { spotifyUserId, items, newCursor }) => {
    for (const item of items) {
      const existing = await ctx.db
        .query("playHistory")
        .withIndex("by_user_playedAt", (q) =>
          q.eq("spotifyUserId", spotifyUserId).eq("playedAt", item.playedAt)
        )
        .first();

      if (!existing) {
        await ctx.db.insert("playHistory", item);
      }
    }

    const cursorDoc = await ctx.db
      .query("syncCursors")
      .withIndex("by_spotifyUser", (q) =>
        q.eq("spotifyUserId", spotifyUserId)
      )
      .unique();

    if (cursorDoc) {
      await ctx.db.patch(cursorDoc._id, {
        recentlyPlayedAfterCursor: newCursor,
      });
    } else {
      await ctx.db.insert("syncCursors", {
        spotifyUserId,
        recentlyPlayedAfterCursor: newCursor,
      });
    }
  },
});

export const getRecentlyPlayed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 50 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const spotifyUser = await ctx.db
      .query("spotifyUsers")
      .withIndex("by_betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", identity.subject)
      )
      .unique();

    if (!spotifyUser) return [];

    return ctx.db
      .query("playHistory")
      .withIndex("by_user_playedAt", (q) =>
        q.eq("spotifyUserId", spotifyUser._id)
      )
      .order("desc")
      .take(limit);
  },
});
