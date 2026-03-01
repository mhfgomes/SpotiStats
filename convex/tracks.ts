import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const trackValidator = v.object({
  spotifyUserId: v.id("spotifyUsers"),
  timeRange: v.string(),
  rank: v.number(),
  trackSpotifyId: v.string(),
  trackName: v.string(),
  albumName: v.string(),
  albumImageUrl: v.optional(v.string()),
  artistNames: v.array(v.string()),
  artistSpotifyIds: v.array(v.string()),
  durationMs: v.number(),
  explicit: v.boolean(),
  trackUri: v.string(),
  externalUrl: v.string(),
  popularity: v.number(),
  syncedAt: v.number(),
});

export const replaceTopTracks = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    tracks: v.array(trackValidator),
  },
  handler: async (ctx, { spotifyUserId, timeRange, tracks }) => {
    const existing = await ctx.db
      .query("topTracks")
      .withIndex("by_user_range", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .collect();

    await Promise.all(existing.map((doc) => ctx.db.delete(doc._id)));
    await Promise.all(tracks.map((track) => ctx.db.insert("topTracks", track)));
  },
});

/** Public — no auth required. Used by the /api/card image route. */
export const getTopTracksPublic = query({
  args: { spotifyUserId: v.id("spotifyUsers"), timeRange: v.string() },
  handler: async (ctx, { spotifyUserId, timeRange }) => {
    return ctx.db
      .query("topTracks")
      .withIndex("by_user_range_rank", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .order("asc")
      .collect();
  },
});

export const getTopTracks = query({
  args: { timeRange: v.string() },
  handler: async (ctx, { timeRange }) => {
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
      .query("topTracks")
      .withIndex("by_user_range_rank", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", timeRange)
      )
      .order("asc")
      .collect();
  },
});
