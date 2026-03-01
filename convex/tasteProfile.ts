import { query } from "./_generated/server";

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

export const computeTasteProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const spotifyUser = await ctx.db
      .query("spotifyUsers")
      .withIndex("by_betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", identity.subject)
      )
      .unique();

    if (!spotifyUser) return null;

    const artists = await ctx.db
      .query("topArtists")
      .withIndex("by_user_range", (q) =>
        q.eq("spotifyUserId", spotifyUser._id).eq("timeRange", "medium_term")
      )
      .collect();

    if (artists.length === 0) return null;

    const scores: Record<string, number> = {
      Energy: 0,
      Acoustic: 0,
      Mood: 0,
      Experimental: 0,
      Mainstream: 0,
      Underground: 0,
    };

    for (const artist of artists) {
      const weight = Math.max(1, 51 - artist.rank);
      const genresLower = artist.genres.map((g) => g.toLowerCase());

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
  },
});
