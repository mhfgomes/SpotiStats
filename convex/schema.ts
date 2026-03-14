import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  spotifyUsers: defineTable({
    betterAuthUserId: v.string(), // Better Auth user ID (from user table inside component)
    spotifyId: v.string(),        // Spotify account ID
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
    lastSyncedAt: v.optional(v.number()),
    syncInProgress: v.boolean(),
  })
    .index("by_betterAuthUserId", ["betterAuthUserId"])
    .index("by_spotifyId", ["spotifyId"]),

  topTracks: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    rank: v.number(),
    trackSpotifyId: v.string(),
    trackName: v.string(),
    albumName: v.string(),
    albumExternalUrl: v.optional(v.string()),
    albumImageUrl: v.optional(v.string()),
    artistNames: v.array(v.string()),
    artistSpotifyIds: v.array(v.string()),
    durationMs: v.number(),
    explicit: v.boolean(),
    trackUri: v.optional(v.string()),
    externalUrl: v.string(),
    popularity: v.number(),
    syncedAt: v.number(),
  })
    .index("by_user_range", ["spotifyUserId", "timeRange"])
    .index("by_user_range_rank", ["spotifyUserId", "timeRange", "rank"]),

  topArtists: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    rank: v.number(),
    artistSpotifyId: v.string(),
    artistName: v.string(),
    genres: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    artistUri: v.optional(v.string()),
    externalUrl: v.string(),
    syncedAt: v.number(),
  })
    .index("by_user_range", ["spotifyUserId", "timeRange"])
    .index("by_user_range_rank", ["spotifyUserId", "timeRange", "rank"]),

  topTrackHistory: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    rank: v.number(),
    trackSpotifyId: v.string(),
    trackName: v.string(),
    albumName: v.string(),
    albumImageUrl: v.optional(v.string()),
    artistNames: v.array(v.string()),
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

  playHistory: defineTable({
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
  })
    .index("by_user_playedAt", ["spotifyUserId", "playedAt"])
    .index("by_user_track", ["spotifyUserId", "trackSpotifyId"]),

  syncCursors: defineTable({
    spotifyUserId: v.id("spotifyUsers"),
    recentlyPlayedAfterCursor: v.optional(v.string()),
  }).index("by_spotifyUser", ["spotifyUserId"]),
});
