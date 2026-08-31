import {
  internalQuery,
  internalMutation,
  action,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * Creates the spotifyUsers row if it doesn't exist yet.
 */
export const ensureSpotifyUser = internalMutation({
  args: {
    betterAuthUserId: v.string(),
    spotifyId: v.string(),
    displayName: v.string(),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("spotifyUsers")
      .withIndex("by_betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", args.betterAuthUserId)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        displayName: args.displayName,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("spotifyUsers", {
      betterAuthUserId: args.betterAuthUserId,
      spotifyId: args.spotifyId,
      displayName: args.displayName,
      avatarUrl: args.avatarUrl,
    });
  },
});

/** Public — returns only safe display fields. Used by /api/card route. */
export const getSpotifyUserPublic = query({
  args: { spotifyUserId: v.id("spotifyUsers") },
  handler: async (ctx, { spotifyUserId }) => {
    const user = await ctx.db.get(spotifyUserId);
    if (!user) return null;
    return { displayName: user.displayName, avatarUrl: user.avatarUrl };
  },
});

/** Get the current user's Spotify profile row */
export const getSpotifyUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    return ctx.db
      .query("spotifyUsers")
      .withIndex("by_betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", identity.subject)
      )
      .unique();
  },
});

/**
 * Called from the frontend after Spotify OAuth login succeeds.
 * Fetches the Spotify profile and ensures the spotifyUsers row exists.
 */
export const initUserSync = action({
  args: {},
  handler: async (ctx): Promise<{ spotifyUserId: unknown }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const betterAuthUserId = identity.subject;

    // Get the Spotify access token
    const { getSpotifyToken } = await import("./spotify/tokenHelper");
    const accessToken = await getSpotifyToken(ctx, betterAuthUserId);

    // Fetch Spotify profile
    const { getSpotifyProfile } = await import("../lib/spotify");
    const profile = await getSpotifyProfile(accessToken);

    const spotifyUserId = await ctx.runMutation(
      internal.users.ensureSpotifyUser,
      {
        betterAuthUserId,
        spotifyId: profile.id,
        displayName: profile.display_name,
        avatarUrl: profile.images?.[0]?.url,
      }
    );

    return { spotifyUserId };
  },
});

export const getSpotifyUserById = internalQuery({
  args: { id: v.id("spotifyUsers") },
  handler: async (ctx, { id }) => {
    return ctx.db.get(id);
  },
});

export const getSpotifyUserByBetterAuthUserId = internalQuery({
  args: { betterAuthUserId: v.string() },
  handler: async (ctx, { betterAuthUserId }) => {
    return ctx.db
      .query("spotifyUsers")
      .withIndex("by_betterAuthUserId", (q) =>
        q.eq("betterAuthUserId", betterAuthUserId)
      )
      .unique();
  },
});
