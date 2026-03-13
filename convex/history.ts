import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const historyItemValidator = v.object({
  spotifyUserId: v.id("spotifyUsers"),
  trackSpotifyId: v.string(),
  trackName: v.string(),
  albumName: v.string(),
  albumSpotifyId: v.optional(v.string()),
  albumImageUrl: v.optional(v.string()),
  artistNames: v.array(v.string()),
  artistSpotifyIds: v.optional(v.array(v.string())),
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
    const minPlayedAt = Math.min(...items.map((i) => i.playedAt));
    const existing = await ctx.db
      .query("playHistory")
      .withIndex("by_user_playedAt", (q) =>
        q.eq("spotifyUserId", spotifyUserId).gte("playedAt", minPlayedAt)
      )
      .collect();
    const existingTimestamps = new Set(existing.map((e) => e.playedAt));
    await Promise.all(
      items
        .filter((item) => !existingTimestamps.has(item.playedAt))
        .map((item) => ctx.db.insert("playHistory", item))
    );

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
