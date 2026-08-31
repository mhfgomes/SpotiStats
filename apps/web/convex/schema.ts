import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  spotifyUsers: defineTable({
    betterAuthUserId: v.string(), // Better Auth user ID (from user table inside component)
    spotifyId: v.string(),        // Spotify account ID
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    // Legacy sync fields kept temporarily so existing documents still validate.
    lastSyncedAt: v.optional(v.number()),
    syncInProgress: v.optional(v.boolean()),
  })
    .index("by_betterAuthUserId", ["betterAuthUserId"])
    .index("by_spotifyId", ["spotifyId"]),

  topTrackHistory: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    rank: v.number(),
    trackSpotifyId: v.string(),
    trackName: v.string(),
    albumName: v.string(),
    albumExternalUrl: v.optional(v.string()),
    albumImageUrl: v.optional(v.string()),
    artistNames: v.array(v.string()),
    artistSpotifyIds: v.optional(v.array(v.string())),
    durationMs: v.optional(v.number()),
    popularity: v.optional(v.number()),
    externalUrl: v.optional(v.string()),
  }).index("by_user_range_syncedAt", ["spotifyUserId", "timeRange", "syncedAt"]),

  topArtistHistory: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    rank: v.number(),
    artistSpotifyId: v.string(),
    artistName: v.string(),
    imageUrl: v.optional(v.string()),
    genres: v.array(v.string()),
  }).index("by_user_range_syncedAt", ["spotifyUserId", "timeRange", "syncedAt"]),

  topGenreHistory: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    rank: v.number(),
    genre: v.string(),
    count: v.number(),
  }).index("by_user_range_syncedAt", ["spotifyUserId", "timeRange", "syncedAt"]),
});
