import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

const artistValidator = v.object({
  spotifyUserId: v.id("spotifyUsers"),
  timeRange: v.string(),
  rank: v.number(),
  artistSpotifyId: v.string(),
  artistName: v.string(),
  genres: v.array(v.string()),
  imageUrl: v.optional(v.string()),
  artistUri: v.string(),
  externalUrl: v.string(),
  syncedAt: v.number(),
});

export const replaceTopArtists = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    artists: v.array(artistValidator),
  },
  handler: async (ctx, { spotifyUserId, timeRange, artists }) => {
    const existing = await ctx.db
      .query("topArtists")
      .withIndex("by_user_range", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .collect();

    await Promise.all(existing.map((doc) => ctx.db.delete(doc._id)));
    await Promise.all(
      artists.map((artist) => ctx.db.insert("topArtists", artist))
    );
  },
});

/** Public — no auth required. Used by the /api/card image route. */
export const getTopArtistsPublic = query({
  args: { spotifyUserId: v.id("spotifyUsers"), timeRange: v.string() },
  handler: async (ctx, { spotifyUserId, timeRange }) => {
    return ctx.db
      .query("topArtists")
      .withIndex("by_user_range_rank", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .order("asc")
      .collect();
  },
});

/** Public genre aggregation — no auth required. */
export const getTopGenresPublic = query({
  args: { spotifyUserId: v.id("spotifyUsers"), timeRange: v.string() },
  handler: async (ctx, { spotifyUserId, timeRange }) => {
    const artists = await ctx.db
      .query("topArtists")
      .withIndex("by_user_range_rank", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .collect();

    const genreCounts: Record<string, number> = {};
    for (const artist of artists) {
      const weight = Math.max(1, 51 - artist.rank);
      for (const genre of artist.genres) {
        genreCounts[genre] = (genreCounts[genre] ?? 0) + weight;
      }
    }

    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, count]) => ({ genre, count }));
  },
});

export const getTopArtists = query({
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
      .query("topArtists")
      .withIndex("by_user_range_rank", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", timeRange)
      )
      .order("asc")
      .collect();
  },
});

export const getTopGenres = query({
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

    const artists = await ctx.db
      .query("topArtists")
      .withIndex("by_user_range_rank", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", timeRange)
      )
      .collect();

    const genreCounts: Record<string, number> = {};
    for (const artist of artists) {
      const weight = Math.max(1, 51 - artist.rank);
      for (const genre of artist.genres) {
        genreCounts[genre] = (genreCounts[genre] ?? 0) + weight;
      }
    }

    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([genre, count]) => ({ genre, count }));
  },
});
