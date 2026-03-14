"use node";

import type { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { getTopTracks, getTopArtists } from "../../lib/spotify";
import type {
  TimeRange,
  SpotifyTrack,
  SpotifyArtistSimple,
  SpotifyArtist,
} from "../../types/spotify";
import type { Id } from "../_generated/dataModel";

const TIME_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

function buildGenreSnapshot(artists: SpotifyArtist[]) {
  const genreCounts: Record<string, number> = {};

  for (const [index, artist] of artists.entries()) {
    const weight = Math.max(1, 50 - index);
    for (const genre of artist.genres) {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + weight;
    }
  }

  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([genre, count], index) => ({
      rank: index + 1,
      genre,
      count,
    }));
}

export async function syncTopTracks(
  ctx: ActionCtx,
  spotifyUserId: Id<"spotifyUsers">,
  accessToken: string
) {
  for (const timeRange of TIME_RANGES) {
    const response = await getTopTracks(accessToken, timeRange, 50);
    const syncedAt = Date.now();

    const tracks = response.items.map((track: SpotifyTrack, index: number) => ({
      spotifyUserId,
      timeRange,
      rank: index + 1,
      trackSpotifyId: track.id,
      trackName: track.name,
      albumName: track.album.name,
      albumExternalUrl: track.album.external_urls?.spotify,
      albumImageUrl: track.album.images[0]?.url,
      artistNames: track.artists.map((a: SpotifyArtistSimple) => a.name),
      artistSpotifyIds: track.artists.map((a: SpotifyArtistSimple) => a.id),
      durationMs: track.duration_ms,
      explicit: track.explicit,
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      syncedAt,
    }));

    await ctx.runMutation(internal.tracks.replaceTopTracks, {
      spotifyUserId,
      timeRange,
      tracks,
    });

    await ctx.runMutation(internal.topHistory.saveTopTracksSnapshot, {
      spotifyUserId,
      timeRange,
      syncedAt,
      items: tracks.map((track) => ({
        rank: track.rank,
        trackSpotifyId: track.trackSpotifyId,
        trackName: track.trackName,
        albumName: track.albumName,
        albumImageUrl: track.albumImageUrl,
        artistNames: track.artistNames,
      })),
    });
  }
}

export async function syncTopArtists(
  ctx: ActionCtx,
  spotifyUserId: Id<"spotifyUsers">,
  accessToken: string
) {
  for (const timeRange of TIME_RANGES) {
    const response = await getTopArtists(accessToken, timeRange, 50);
    const syncedAt = Date.now();

    const artists = response.items.map((artist: SpotifyArtist, index: number) => ({
      spotifyUserId,
      timeRange,
      rank: index + 1,
      artistSpotifyId: artist.id,
      artistName: artist.name,
      genres: artist.genres,
      imageUrl: artist.images[0]?.url,
      externalUrl: artist.external_urls.spotify,
      syncedAt,
    }));

    await ctx.runMutation(internal.artists.replaceTopArtists, {
      spotifyUserId,
      timeRange,
      artists,
    });

    await ctx.runMutation(internal.topHistory.saveTopArtistsSnapshot, {
      spotifyUserId,
      timeRange,
      syncedAt,
      items: artists.map((artist) => ({
        rank: artist.rank,
        artistSpotifyId: artist.artistSpotifyId,
        artistName: artist.artistName,
        imageUrl: artist.imageUrl,
        genres: artist.genres,
      })),
    });

    await ctx.runMutation(internal.topHistory.saveTopGenresSnapshot, {
      spotifyUserId,
      timeRange,
      syncedAt,
      items: buildGenreSnapshot(response.items),
    });
  }
}
