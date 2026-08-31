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

export interface AccountPageData {
  authUser: { id: string; name: string; email: string; image: string | null; emailVerified: boolean; createdAt: number } | null;
  spotifyAccount: { connected: boolean; providerId: 'spotify'; scope: string | null; linkedAt: number | null; updatedAt: number | null; accessTokenExpiresAt: number | null };
  spotifyProfile: { spotifyUserId: string; spotifyId: string; displayName: string; avatarUrl: string | null } | null;
  sessions: { id: string; isCurrent: boolean; createdAt: number; updatedAt: number; expiresAt: number; ipAddressMasked: string | null; userAgent: string | null; deviceLabel: string }[];
  dataSummary: {
    tracks: { rowCount: number; snapshotCount: number; latestSyncedAt: number | null };
    artists: { rowCount: number; snapshotCount: number; latestSyncedAt: number | null };
    genres: { rowCount: number; snapshotCount: number; latestSyncedAt: number | null };
    totalRows: number;
    latestSyncedAt: number | null;
  };
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

export const getAccountPageData = makeFunctionReference<'query', Record<string, never>, AccountPageData>('account:getAccountPageData');
export const revokeOtherSessions = makeFunctionReference<'mutation', Record<string, never>, { revokedCount: number }>('account:revokeOtherSessions');
export const revokeSession = makeFunctionReference<'mutation', { sessionId: string }, { revoked: boolean; currentSession: boolean }>('account:revokeSession');
