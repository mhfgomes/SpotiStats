import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const nowPlayingDataValidator = v.object({
  trackName: v.string(),
  artistNames: v.array(v.string()),
  albumName: v.string(),
  albumImageUrl: v.union(v.string(), v.null()),
  isPlaying: v.boolean(),
  progressMs: v.number(),
  durationMs: v.number(),
});

export const get = internalQuery({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }) => {
    return ctx.db
      .query("nowPlayingCache")
      .withIndex("by_spotifyUserId", (q) => q.eq("spotifyUserId", spotifyUserId))
      .unique();
  },
});

export const set = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    data: v.union(nowPlayingDataValidator, v.null()),
    fetchedAt: v.number(),
  },
  handler: async (ctx, { spotifyUserId, data, fetchedAt }) => {
    const existing = await ctx.db
      .query("nowPlayingCache")
      .withIndex("by_spotifyUserId", (q) => q.eq("spotifyUserId", spotifyUserId))
      .unique();

    if (!existing) {
      await ctx.db.insert("nowPlayingCache", { spotifyUserId, data, fetchedAt });
    } else if (fetchedAt > existing.fetchedAt) {
      // Concurrent refreshes: keep whichever response is newest.
      await ctx.db.patch(existing._id, { data, fetchedAt });
    }
  },
});
