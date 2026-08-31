import { makeFunctionReference } from 'convex/server';

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';

export interface TopTrack {
  rank: number;
  trackSpotifyId: string;
  trackName: string;
  albumName: string;
  albumImageUrl?: string;
  artistNames: string[];
  externalUrl: string;
  popularity: number;
}

export interface TopArtist {
  rank: number;
  artistSpotifyId: string;
  artistName: string;
  genres: string[];
  imageUrl?: string;
  externalUrl: string;
}

export interface TopGenre {
  rank: number;
  genre: string;
  count: number;
}

export interface SpotifyTopData {
  tracks: TopTrack[];
  artists: TopArtist[];
  genres: TopGenre[];
  tasteProfile: { axis: string; value: number }[];
  hasComparisonSnapshot: boolean;
  previousTrackRanks: Record<string, number>;
  previousArtistRanks: Record<string, number>;
  previousGenreRanks: Record<string, number>;
}

export interface RecentlyPlayedItem {
  trackSpotifyId: string;
  trackName: string;
  albumName: string;
  albumImageUrl?: string;
  artistNames: string[];
  externalUrl: string;
  playedAt: number;
}

export const initUserSync = makeFunctionReference<
  'action',
  Record<string, never>,
  { spotifyUserId: unknown }
>('users:initUserSync');

export const getCurrentUserTopData = makeFunctionReference<
  'action',
  { timeRange: TimeRange },
  SpotifyTopData
>('spotifyLive:getCurrentUserTopData');

export const getCurrentUserRecentlyPlayed = makeFunctionReference<
  'action',
  { limit?: number },
  RecentlyPlayedItem[]
>('spotifyLive:getCurrentUserRecentlyPlayed');
