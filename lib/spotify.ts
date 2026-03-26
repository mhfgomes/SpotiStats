import type {
  SpotifyPagingObject,
  SpotifySeveralTracksResponse,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyRecentlyPlayedResponse,
  SpotifyUserProfile,
  TimeRange,
} from "../types/spotify";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

async function spotifyFetch<T>(
  accessToken: string,
  path: string,
  params?: Record<string, string>
): Promise<T> {
  const url = new URL(`${SPOTIFY_API_BASE}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Spotify API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function getSpotifyProfile(
  accessToken: string
): Promise<SpotifyUserProfile> {
  return spotifyFetch<SpotifyUserProfile>(accessToken, "/me");
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange,
  limit = 50
): Promise<SpotifyPagingObject<SpotifyTrack>> {
  return spotifyFetch<SpotifyPagingObject<SpotifyTrack>>(
    accessToken,
    "/me/top/tracks",
    { time_range: timeRange, limit: String(limit) }
  );
}

export async function getTopArtists(
  accessToken: string,
  timeRange: TimeRange,
  limit = 50
): Promise<SpotifyPagingObject<SpotifyArtist>> {
  return spotifyFetch<SpotifyPagingObject<SpotifyArtist>>(
    accessToken,
    "/me/top/artists",
    { time_range: timeRange, limit: String(limit) }
  );
}

export async function getRecentlyPlayed(
  accessToken: string,
  limit = 50,
  after?: string,
  before?: string
): Promise<SpotifyRecentlyPlayedResponse> {
  const params: Record<string, string> = { limit: String(limit) };
  if (after) params.after = after;
  if (before) params.before = before;
  return spotifyFetch<SpotifyRecentlyPlayedResponse>(
    accessToken,
    "/me/player/recently-played",
    params
  );
}

export async function getTracksByIds(
  accessToken: string,
  trackIds: string[]
): Promise<SpotifyTrack[]> {
  if (trackIds.length === 0) return [];

  const chunks: string[][] = [];
  for (let index = 0; index < trackIds.length; index += 50) {
    chunks.push(trackIds.slice(index, index + 50));
  }

  const responses = await Promise.all(
    chunks.map((ids) =>
      spotifyFetch<SpotifySeveralTracksResponse>(accessToken, "/tracks", {
        ids: ids.join(","),
      })
    )
  );

  return responses.flatMap((response) => response.tracks);
}
