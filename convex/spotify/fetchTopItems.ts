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

export async function syncTopTracks(
  ctx: ActionCtx,
  spotifyUserId: Id<"spotifyUsers">,
  accessToken: string
) {
  for (const timeRange of TIME_RANGES) {
    const response = await getTopTracks(accessToken, timeRange, 50);

    const tracks = response.items.map((track: SpotifyTrack, index: number) => ({
      spotifyUserId,
      timeRange,
      rank: index + 1,
      trackSpotifyId: track.id,
      trackName: track.name,
      albumName: track.album.name,
      albumImageUrl: track.album.images[0]?.url,
      artistNames: track.artists.map((a: SpotifyArtistSimple) => a.name),
      artistSpotifyIds: track.artists.map((a: SpotifyArtistSimple) => a.id),
      durationMs: track.duration_ms,
      explicit: track.explicit,
      trackUri: track.uri,
      externalUrl: track.external_urls.spotify,
      popularity: track.popularity,
      syncedAt: Date.now(),
    }));

    await ctx.runMutation(internal.tracks.replaceTopTracks, {
      spotifyUserId,
      timeRange,
      tracks,
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

    const artists = response.items.map((artist: SpotifyArtist, index: number) => ({
      spotifyUserId,
      timeRange,
      rank: index + 1,
      artistSpotifyId: artist.id,
      artistName: artist.name,
      genres: artist.genres,
      imageUrl: artist.images[0]?.url,
      artistUri: artist.uri,
      externalUrl: artist.external_urls.spotify,
      syncedAt: Date.now(),
    }));

    await ctx.runMutation(internal.artists.replaceTopArtists, {
      spotifyUserId,
      timeRange,
      artists,
    });
  }
}
