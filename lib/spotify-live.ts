import type {
  SpotifyArtist,
  SpotifyArtistSimple,
  SpotifyTrack,
} from "../types/spotify";

export interface LiveTopTrack {
  rank: number;
  trackSpotifyId: string;
  trackName: string;
  albumName: string;
  albumExternalUrl?: string;
  albumImageUrl?: string;
  artistNames: string[];
  artistSpotifyIds: string[];
  durationMs: number;
  explicit: boolean;
  externalUrl: string;
  popularity: number;
}

export interface LiveTopArtist {
  rank: number;
  artistSpotifyId: string;
  artistName: string;
  genres: string[];
  imageUrl?: string;
  externalUrl: string;
}

export interface LiveTopGenre {
  rank: number;
  genre: string;
  count: number;
}

export interface TasteProfilePoint {
  axis: string;
  value: number;
}

const AXIS_KEYWORDS: Record<string, string[]> = {
  Energy: [
    "edm", "electronic", "dance", "techno", "house", "trance", "drum and bass",
    "dubstep", "hardstyle", "metal", "punk", "hardcore", "electro", "rave",
    "bass", "trap", "hip hop", "rap", "workout", "power",
  ],
  Acoustic: [
    "acoustic", "folk", "singer-songwriter", "country", "bluegrass", "americana",
    "classical", "chamber", "string", "piano", "guitar", "unplugged", "indie folk",
    "pastoral", "ambient folk",
  ],
  Mood: [
    "jazz", "soul", "r&b", "blues", "gospel", "neo soul", "mood", "chill",
    "lo-fi", "lounge", "smooth", "quiet storm", "mellow", "downtempo", "bossa nova",
  ],
  Experimental: [
    "experimental", "avant-garde", "noise", "abstract", "art rock", "krautrock",
    "industrial", "glitch", "progressive", "psychedelic", "post-rock", "ambient",
    "drone", "new wave", "art pop", "weird", "unconventional",
  ],
  Mainstream: [
    "pop", "dance pop", "electropop", "synth pop", "teen pop", "k-pop",
    "mainstream", "radio", "chart", "commercial", "contemporary", "adult contemporary",
    "top 40",
  ],
  Underground: [
    "underground", "indie", "alternative", "lo-fi", "bedroom pop", "shoegaze",
    "post-punk", "emo", "math rock", "post-hardcore", "vaporwave", "chillwave",
    "obscure", "deep", "niche",
  ],
};

export function mapSpotifyTopTracks(items: SpotifyTrack[]): LiveTopTrack[] {
  return items.map((track, index) => ({
    rank: index + 1,
    trackSpotifyId: track.id,
    trackName: track.name,
    albumName: track.album.name,
    albumExternalUrl: track.album.external_urls?.spotify,
    albumImageUrl: track.album.images[0]?.url,
    artistNames: track.artists.map((artist: SpotifyArtistSimple) => artist.name),
    artistSpotifyIds: track.artists.map((artist: SpotifyArtistSimple) => artist.id),
    durationMs: track.duration_ms,
    explicit: track.explicit,
    externalUrl: track.external_urls.spotify,
    popularity: track.popularity,
  }));
}

export function mapSpotifyTopArtists(items: SpotifyArtist[]): LiveTopArtist[] {
  return items.map((artist, index) => ({
    rank: index + 1,
    artistSpotifyId: artist.id,
    artistName: artist.name,
    genres: artist.genres,
    imageUrl: artist.images[0]?.url,
    externalUrl: artist.external_urls.spotify,
  }));
}

export function buildTopGenres(
  artists: Pick<LiveTopArtist, "rank" | "genres">[],
  limit = 20
): LiveTopGenre[] {
  const genreCounts: Record<string, number> = {};

  for (const artist of artists) {
    const weight = Math.max(1, 51 - artist.rank);
    for (const genre of artist.genres) {
      genreCounts[genre] = (genreCounts[genre] ?? 0) + weight;
    }
  }

  return Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([genre, count], index) => ({
      rank: index + 1,
      genre,
      count,
    }));
}

export function buildTasteProfile(
  artists: Pick<LiveTopArtist, "rank" | "genres">[]
): TasteProfilePoint[] {
  const scores: Record<string, number> = {
    Energy: 0,
    Acoustic: 0,
    Mood: 0,
    Experimental: 0,
    Mainstream: 0,
    Underground: 0,
  };

  for (const artist of artists.slice(0, 20)) {
    const weight = Math.max(1, 51 - artist.rank);
    const genresLower = artist.genres.map((genre) => genre.toLowerCase());

    for (const [axis, keywords] of Object.entries(AXIS_KEYWORDS)) {
      for (const genre of genresLower) {
        for (const keyword of keywords) {
          if (genre.includes(keyword)) {
            scores[axis] += weight;
            break;
          }
        }
      }
    }
  }

  const maxScore = Math.max(...Object.values(scores), 1);
  return Object.entries(scores).map(([axis, score]) => ({
    axis,
    value: Math.round((score / maxScore) * 100),
  }));
}
