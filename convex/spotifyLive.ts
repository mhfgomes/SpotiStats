"use node";

import type { Doc, Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getTopArtists, getTopTracks } from "../lib/spotify";
import {
  buildTasteProfile,
  buildTopGenres,
  mapSpotifyTopArtists,
  mapSpotifyTopTracks,
} from "../lib/spotify-live";
import { getSpotifyToken } from "./spotify/tokenHelper";

const timeRangeValidator = v.union(
  v.literal("short_term"),
  v.literal("medium_term"),
  v.literal("long_term")
);

type TimeRangeValue = "short_term" | "medium_term" | "long_term";

interface SnapshotGroup<T extends { rank: number }> {
  syncedAt: number;
  items: T[];
}

interface CurrentUserTopDataResult {
  tracks: ReturnType<typeof mapSpotifyTopTracks>;
  artists: ReturnType<typeof mapSpotifyTopArtists>;
  genres: ReturnType<typeof buildTopGenres>;
  tasteProfile: ReturnType<typeof buildTasteProfile>;
  hasComparisonSnapshot: boolean;
  previousTrackRanks: Record<string, number>;
  previousArtistRanks: Record<string, number>;
  previousGenreRanks: Record<string, number>;
}

interface PublicCardDataResult {
  user: {
    displayName: string;
    avatarUrl?: string;
  };
  tracks: ReturnType<typeof mapSpotifyTopTracks>;
  artists: ReturnType<typeof mapSpotifyTopArtists>;
  genres: ReturnType<typeof buildTopGenres>;
}

function getComparisonSnapshot<T extends { rank: number }>(
  snapshots: SnapshotGroup<T>[],
  savedSnapshotAt: number | null
): SnapshotGroup<T> | null {
  if (snapshots.length === 0) return null;
  if (savedSnapshotAt !== null && snapshots[0]?.syncedAt === savedSnapshotAt) {
    return snapshots[1] ?? null;
  }
  return snapshots[0] ?? null;
}

function buildRankMap<T extends { rank: number }>(
  snapshot: SnapshotGroup<T> | null,
  getId: (item: T) => string
): Record<string, number> | null {
  if (!snapshot) return null;
  return Object.fromEntries(
    snapshot.items.map((item) => [getId(item), item.rank])
  );
}

async function getSpotifyUserByBetterAuthUserIdOrThrow(
  ctx: ActionCtx,
  betterAuthUserId: string
): Promise<Doc<"spotifyUsers">> {
  const spotifyUser = await ctx.runQuery(
    internal.users.getSpotifyUserByBetterAuthUserId,
    { betterAuthUserId }
  );

  if (!spotifyUser) {
    throw new Error("Spotify user not initialized.");
  }

  return spotifyUser;
}

async function maybeSaveSnapshot(
  ctx: ActionCtx,
  spotifyUserId: Id<"spotifyUsers">,
  timeRange: TimeRangeValue,
  tracks: ReturnType<typeof mapSpotifyTopTracks>,
  artists: ReturnType<typeof mapSpotifyTopArtists>,
  genres: ReturnType<typeof buildTopGenres>
): Promise<number | null> {
  return ctx.runMutation(internal.topHistory.saveSnapshotBundleIfNeeded, {
    spotifyUserId,
    timeRange,
    tracks: tracks.map((track) => ({
      rank: track.rank,
      trackSpotifyId: track.trackSpotifyId,
      trackName: track.trackName,
      albumName: track.albumName,
      albumImageUrl: track.albumImageUrl,
      artistNames: track.artistNames,
    })),
    artists: artists.map((artist) => ({
      rank: artist.rank,
      artistSpotifyId: artist.artistSpotifyId,
      artistName: artist.artistName,
      imageUrl: artist.imageUrl,
      genres: artist.genres,
    })),
    genres: genres.map((genre) => ({
      rank: genre.rank,
      genre: genre.genre,
      count: genre.count,
    })),
  });
}

export const getCurrentUserTopData = action({
  args: { timeRange: timeRangeValidator },
  handler: async (ctx, { timeRange }): Promise<CurrentUserTopDataResult> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const spotifyUser = await getSpotifyUserByBetterAuthUserIdOrThrow(
      ctx,
      identity.subject
    );
    const accessToken = await getSpotifyToken(ctx, identity.subject);

    const [tracksResponse, artistsResponse] = await Promise.all([
      getTopTracks(accessToken, timeRange, 50),
      getTopArtists(accessToken, timeRange, 50),
    ]);

    const tracks = mapSpotifyTopTracks(tracksResponse.items);
    const artists = mapSpotifyTopArtists(artistsResponse.items);
    const genres = buildTopGenres(artists);
    const tasteProfile = buildTasteProfile(artists);

    const savedSnapshotAt = await maybeSaveSnapshot(
      ctx,
      spotifyUser._id,
      timeRange,
      tracks,
      artists,
      genres
    );

    const [trackHistory, artistHistory, genreHistory] = await Promise.all([
      ctx.runQuery(internal.topHistory.getTopTracksHistoryByUser, {
        spotifyUserId: spotifyUser._id,
        timeRange,
        limit: 2,
      }),
      ctx.runQuery(internal.topHistory.getTopArtistsHistoryByUser, {
        spotifyUserId: spotifyUser._id,
        timeRange,
        limit: 2,
      }),
      ctx.runQuery(internal.topHistory.getTopGenresHistoryByUser, {
        spotifyUserId: spotifyUser._id,
        timeRange,
        limit: 2,
      }),
    ]);

    const previousTracks = buildRankMap(
      getComparisonSnapshot(trackHistory, savedSnapshotAt),
      (item: { trackSpotifyId: string }) => item.trackSpotifyId
    );
    const previousArtists = buildRankMap(
      getComparisonSnapshot(artistHistory, savedSnapshotAt),
      (item: { artistSpotifyId: string }) => item.artistSpotifyId
    );
    const previousGenres = buildRankMap(
      getComparisonSnapshot(genreHistory, savedSnapshotAt),
      (item: { genre: string }) => item.genre
    );

    return {
      tracks,
      artists,
      genres,
      tasteProfile,
      hasComparisonSnapshot:
        previousTracks !== null ||
        previousArtists !== null ||
        previousGenres !== null,
      previousTrackRanks: previousTracks ?? {},
      previousArtistRanks: previousArtists ?? {},
      previousGenreRanks: previousGenres ?? {},
    };
  },
});

export const getPublicCardData = action({
  args: {
    spotifyUserId: v.id("spotifyUsers"),
    timeRange: timeRangeValidator,
  },
  handler: async (
    ctx,
    { spotifyUserId, timeRange }
  ): Promise<PublicCardDataResult | null> => {
    const spotifyUser = await ctx.runQuery(internal.users.getSpotifyUserById, {
      id: spotifyUserId,
    });

    if (!spotifyUser) {
      return null;
    }

    let accessToken: string;
    try {
      accessToken = await getSpotifyToken(ctx, spotifyUser.betterAuthUserId);
    } catch {
      return {
        user: {
          displayName: spotifyUser.displayName,
          avatarUrl: spotifyUser.avatarUrl,
        },
        tracks: [],
        artists: [],
        genres: [],
      };
    }

    const [tracksResponse, artistsResponse] = await Promise.all([
      getTopTracks(accessToken, timeRange, 50),
      getTopArtists(accessToken, timeRange, 50),
    ]);

    const tracks = mapSpotifyTopTracks(tracksResponse.items);
    const artists = mapSpotifyTopArtists(artistsResponse.items);
    const genres = buildTopGenres(artists, 5);

    return {
      user: {
        displayName: spotifyUser.displayName,
        avatarUrl: spotifyUser.avatarUrl,
      },
      tracks,
      artists,
      genres,
    };
  },
});
