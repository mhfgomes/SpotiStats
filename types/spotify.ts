export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyExternalUrls {
  spotify: string;
}

export interface SpotifyArtistSimple {
  id: string;
  name: string;
  uri: string;
  external_urls: SpotifyExternalUrls;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  images: SpotifyImage[];
  uri: string;
  external_urls: SpotifyExternalUrls;
  artists: SpotifyArtistSimple[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  external_urls: SpotifyExternalUrls;
  album: SpotifyAlbum;
  artists: SpotifyArtistSimple[];
  duration_ms: number;
  explicit: boolean;
  popularity: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  external_urls: SpotifyExternalUrls;
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
  followers: { total: number };
}

export interface SpotifyPlayHistoryItem {
  track: SpotifyTrack;
  played_at: string; // ISO 8601
  context: {
    type: string;
    uri: string;
  } | null;
}

export interface SpotifyPagingObject<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
  previous: string | null;
  href: string;
}

export interface SpotifyRecentlyPlayedResponse {
  items: SpotifyPlayHistoryItem[];
  next: string | null;
  cursors: {
    after: string;
    before: string;
  };
  limit: number;
  href: string;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  uri: string;
  external_urls: SpotifyExternalUrls;
}
