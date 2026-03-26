import type { QueryCtx } from "./_generated/server";
import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";

const SNAPSHOT_INTERVAL_MS = 12 * 60 * 60 * 1000;

const trackHistoryItemValidator = v.object({
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
});

const artistHistoryItemValidator = v.object({
  rank: v.number(),
  artistSpotifyId: v.string(),
  artistName: v.string(),
  imageUrl: v.optional(v.string()),
  genres: v.array(v.string()),
});

const genreHistoryItemValidator = v.object({
  rank: v.number(),
  genre: v.string(),
  count: v.number(),
});

function isSameUtcDay(timestampA: number, timestampB: number) {
  const dateA = new Date(timestampA);
  const dateB = new Date(timestampB);

  return (
    dateA.getUTCFullYear() === dateB.getUTCFullYear() &&
    dateA.getUTCMonth() === dateB.getUTCMonth() &&
    dateA.getUTCDate() === dateB.getUTCDate()
  );
}

async function shouldSkipSnapshotSave(
  ctx: { db: QueryCtx["db"] },
  spotifyUserId: string,
  timeRange: string,
  now: number
) {
  const latest = await ctx.db
    .query("topTrackHistory")
    .withIndex("by_user_range_syncedAt", (q) =>
      q.eq("spotifyUserId", spotifyUserId as never).eq("timeRange", timeRange)
    )
    .order("desc")
    .first();

  if (!latest) {
    return false;
  }

  return (
    now - latest.syncedAt < SNAPSHOT_INTERVAL_MS ||
    isSameUtcDay(latest.syncedAt, now)
  );
}

async function getCurrentSpotifyUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return ctx.db
    .query("spotifyUsers")
    .withIndex("by_betterAuthUserId", (q) =>
      q.eq("betterAuthUserId", identity.subject)
    )
    .unique();
}

function groupSnapshots<T extends { syncedAt: number; rank: number }>(
  docs: T[],
  limit: number
) {
  const snapshots = new Map<number, T[]>();

  for (const doc of docs) {
    const existing = snapshots.get(doc.syncedAt);
    if (existing) {
      existing.push(doc);
      continue;
    }

    if (snapshots.size >= limit) {
      break;
    }

    snapshots.set(doc.syncedAt, [doc]);
  }

  return Array.from(snapshots.entries()).map(([syncedAt, items]) => ({
    syncedAt,
    items: items.sort((a, b) => a.rank - b.rank),
  }));
}

export const saveTopTracksSnapshot = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    items: v.array(trackHistoryItemValidator),
  },
  handler: async (ctx, { spotifyUserId, timeRange, syncedAt, items }) => {
    const existing = await ctx.db
      .query("topTrackHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q
          .eq("spotifyUserId", spotifyUserId)
          .eq("timeRange", timeRange)
          .eq("syncedAt", syncedAt)
      )
      .collect();

    await Promise.all(existing.map((doc) => ctx.db.delete(doc._id)));
    await Promise.all(
      items.map((item) =>
        ctx.db.insert("topTrackHistory", {
          spotifyUserId,
          timeRange,
          syncedAt,
          ...item,
        })
      )
    );
  },
});

export const saveTopArtistsSnapshot = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    items: v.array(artistHistoryItemValidator),
  },
  handler: async (ctx, { spotifyUserId, timeRange, syncedAt, items }) => {
    const existing = await ctx.db
      .query("topArtistHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q
          .eq("spotifyUserId", spotifyUserId)
          .eq("timeRange", timeRange)
          .eq("syncedAt", syncedAt)
      )
      .collect();

    await Promise.all(existing.map((doc) => ctx.db.delete(doc._id)));
    await Promise.all(
      items.map((item) =>
        ctx.db.insert("topArtistHistory", {
          spotifyUserId,
          timeRange,
          syncedAt,
          ...item,
        })
      )
    );
  },
});

export const saveTopGenresSnapshot = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    syncedAt: v.number(),
    items: v.array(genreHistoryItemValidator),
  },
  handler: async (ctx, { spotifyUserId, timeRange, syncedAt, items }) => {
    const existing = await ctx.db
      .query("topGenreHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q
          .eq("spotifyUserId", spotifyUserId)
          .eq("timeRange", timeRange)
          .eq("syncedAt", syncedAt)
      )
      .collect();

    await Promise.all(existing.map((doc) => ctx.db.delete(doc._id)));
    await Promise.all(
      items.map((item) =>
        ctx.db.insert("topGenreHistory", {
          spotifyUserId,
          timeRange,
          syncedAt,
          ...item,
        })
      )
    );
  },
});

export const saveSnapshotBundleIfNeeded = internalMutation({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    tracks: v.array(trackHistoryItemValidator),
    artists: v.array(artistHistoryItemValidator),
    genres: v.array(genreHistoryItemValidator),
  },
  handler: async (ctx, { spotifyUserId, timeRange, tracks, artists, genres }) => {
    const syncedAt = Date.now();

    if (
      await shouldSkipSnapshotSave(
        ctx,
        spotifyUserId,
        timeRange,
        syncedAt
      )
    ) {
      return null;
    }

    await Promise.all([
      ...tracks.map((item) =>
        ctx.db.insert("topTrackHistory", {
          spotifyUserId,
          timeRange,
          syncedAt,
          ...item,
        })
      ),
      ...artists.map((item) =>
        ctx.db.insert("topArtistHistory", {
          spotifyUserId,
          timeRange,
          syncedAt,
          ...item,
        })
      ),
      ...genres.map((item) =>
        ctx.db.insert("topGenreHistory", {
          spotifyUserId,
          timeRange,
          syncedAt,
          ...item,
        })
      ),
    ]);

    return syncedAt;
  },
});

export const getTopTracksHistory = query({
  args: {
    timeRange: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { timeRange, limit = 6 }) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    if (!spotifyUser) return [];

    const docs = await ctx.db
      .query("topTrackHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", timeRange)
      )
      .order("desc")
      .take(limit * 60);

    return groupSnapshots(docs, limit);
  },
});

export const getTopTracksHistoryByUser = internalQuery({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { spotifyUserId, timeRange, limit = 6 }) => {
    const docs = await ctx.db
      .query("topTrackHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .order("desc")
      .take(limit * 60);

    return groupSnapshots(docs, limit);
  },
});

export const getLatestTopTracksSnapshotTimestamp = internalQuery({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
  },
  handler: async (ctx, { spotifyUserId, timeRange }) => {
    const latest = await ctx.db
      .query("topTrackHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .order("desc")
      .first();

    return latest?.syncedAt ?? null;
  },
});

export const getTopArtistsHistory = query({
  args: {
    timeRange: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { timeRange, limit = 6 }) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    if (!spotifyUser) return [];

    const docs = await ctx.db
      .query("topArtistHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", timeRange)
      )
      .order("desc")
      .take(limit * 60);

    return groupSnapshots(docs, limit);
  },
});

export const getTopArtistsHistoryByUser = internalQuery({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { spotifyUserId, timeRange, limit = 6 }) => {
    const docs = await ctx.db
      .query("topArtistHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .order("desc")
      .take(limit * 60);

    return groupSnapshots(docs, limit);
  },
});

export const getTopGenresHistory = query({
  args: {
    timeRange: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { timeRange, limit = 6 }) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    if (!spotifyUser) return [];

    const docs = await ctx.db
      .query("topGenreHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", timeRange)
      )
      .order("desc")
      .take(limit * 30);

    return groupSnapshots(docs, limit);
  },
});

export const getTopGenresHistoryByUser = internalQuery({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { spotifyUserId, timeRange, limit = 6 }) => {
    const docs = await ctx.db
      .query("topGenreHistory")
      .withIndex("by_user_range_syncedAt", (q) =>
        q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
      )
      .order("desc")
      .take(limit * 30);

    return groupSnapshots(docs, limit);
  },
});
