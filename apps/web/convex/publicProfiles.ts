import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { CARD_THEMES } from "../lib/themes";
import {
  BLOCK_TEXT_MAX_LENGTH,
  BLOCK_TITLE_MAX_LENGTH,
  DEFAULT_PROFILE_BLOCKS,
  MAX_PROFILE_BLOCKS,
  PROFILE_TIME_RANGES,
  isStatsBlock,
  profileBlockValidator,
  type ProfileBlock,
} from "../lib/profileBlocks";

const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])$/;
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "account",
  "login",
  "logout",
  "settings",
  "spotistats",
  "support",
  "u",
]);
const BIO_MAX_LENGTH = 160;
const MIN_ITEMS = 1;
const MAX_ITEMS = 20;
const SNAPSHOT_FETCH_LIMIT = 50;

const linkTypeValidator = v.union(v.literal("custom"), v.literal("spotifyId"));

const displaySettingsArgs = {
  linkType: linkTypeValidator,
  slug: v.optional(v.string()),
  bio: v.optional(v.string()),
  theme: v.string(),
  showAvatar: v.boolean(),
  blocks: v.array(profileBlockValidator),
};

type PublicProfileSettings = Pick<
  Doc<"publicProfiles">,
  "enabled" | "linkType" | "slug" | "bio" | "theme" | "showAvatar"
> & { blocks: ProfileBlock[] };
type ProfileDisplaySettings = Omit<PublicProfileSettings, "enabled">;

const DEFAULT_SETTINGS: Omit<PublicProfileSettings, "slug"> = {
  enabled: false,
  linkType: "spotifyId",
  bio: undefined,
  theme: "midnight",
  showAvatar: true,
  blocks: DEFAULT_PROFILE_BLOCKS,
};

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function suggestSlug(displayName: string) {
  const fromName = displayName
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30)
    .replace(/-+$/g, "");
  return SLUG_PATTERN.test(fromName) && !RESERVED_SLUGS.has(fromName)
    ? fromName
    : "";
}

function clampCount(value: number | undefined) {
  return Math.min(MAX_ITEMS, Math.max(MIN_ITEMS, Math.round(value ?? 10)));
}

/** A stored profile's settings, converting legacy fixed-section profiles to blocks. */
function profileSettings(profile: Doc<"publicProfiles">): PublicProfileSettings {
  const { enabled, linkType, slug, bio, theme, showAvatar } = profile;
  if (profile.blocks) {
    return { enabled, linkType, slug, bio, theme, showAvatar, blocks: profile.blocks };
  }

  const timeRange = profile.timeRange ?? "medium_term";
  const legacyBlocks: Array<ProfileBlock | null> = [
    profile.showNowPlaying ? { id: "nowPlaying", type: "nowPlaying" } : null,
    profile.showArtists
      ? { id: "artists", type: "artists", timeRange, count: profile.artistCount ?? 10, layout: "grid" }
      : null,
    profile.showTracks
      ? { id: "tracks", type: "tracks", timeRange, count: profile.trackCount ?? 10, layout: "list" }
      : null,
    profile.showGenres ? { id: "genres", type: "genres", timeRange, count: 8 } : null,
  ];
  return {
    enabled,
    linkType,
    slug,
    bio,
    theme,
    showAvatar,
    blocks: legacyBlocks.filter((block): block is ProfileBlock => block !== null),
  };
}

/** Validates and normalizes user-supplied blocks. */
function sanitizeBlocks(blocks: ProfileBlock[]): ProfileBlock[] {
  if (blocks.length > MAX_PROFILE_BLOCKS) {
    throw new Error(`A profile can have at most ${MAX_PROFILE_BLOCKS} blocks.`);
  }
  const seenIds = new Set<string>();
  return blocks.map((block) => {
    if (!block.id || seenIds.has(block.id)) throw new Error("Invalid block id.");
    seenIds.add(block.id);

    const title = block.title?.trim().slice(0, BLOCK_TITLE_MAX_LENGTH) || undefined;
    if (block.type === "text") {
      return {
        id: block.id,
        type: block.type,
        title,
        text: block.text?.trim().slice(0, BLOCK_TEXT_MAX_LENGTH) ?? "",
      };
    }
    if (!isStatsBlock(block.type)) {
      return { id: block.id, type: block.type, title };
    }
    const timeRange = block.timeRange ?? "medium_term";
    if (!(PROFILE_TIME_RANGES as readonly string[]).includes(timeRange)) {
      throw new Error("Unknown time range.");
    }
    return {
      id: block.id,
      type: block.type,
      title,
      timeRange,
      count: clampCount(block.count),
      layout: block.type === "genres" ? undefined : block.layout ?? "list",
    };
  });
}

/** The URL handle a profile should be served under. */
function canonicalHandle(
  settings: Pick<PublicProfileSettings, "linkType" | "slug">,
  spotifyUser: Doc<"spotifyUsers">
) {
  return settings.linkType === "custom" && settings.slug
    ? settings.slug
    : spotifyUser.spotifyId;
}

async function getCurrentSpotifyUser(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return ctx.db
    .query("spotifyUsers")
    .withIndex("by_betterAuthUserId", (q) =>
      q.eq("betterAuthUserId", identity.subject)
    )
    .unique();
}

async function getProfileForUser(ctx: QueryCtx, spotifyUserId: Id<"spotifyUsers">) {
  return ctx.db
    .query("publicProfiles")
    .withIndex("by_spotifyUserId", (q) => q.eq("spotifyUserId", spotifyUserId))
    .unique();
}

async function getProfileBySlug(ctx: QueryCtx, slug: string) {
  return ctx.db
    .query("publicProfiles")
    .withIndex("by_slug", (q) => q.eq("slug", normalizeSlug(slug)))
    .unique();
}

async function getSpotifyUserBySpotifyId(ctx: QueryCtx, spotifyId: string) {
  return ctx.db
    .query("spotifyUsers")
    .withIndex("by_spotifyId", (q) => q.eq("spotifyId", spotifyId))
    .unique();
}

/**
 * Resolves a URL handle to an enabled profile. Custom handles win; otherwise
 * the handle is treated as a Spotify user ID. Both forms always resolve, so
 * switching link type never breaks previously shared links.
 */
async function resolveHandle(ctx: QueryCtx, handle: string) {
  const bySlug = await getProfileBySlug(ctx, handle);
  if (bySlug) {
    const spotifyUser = await ctx.db.get(bySlug.spotifyUserId);
    return spotifyUser ? { profile: bySlug, spotifyUser } : null;
  }

  const spotifyUser = await getSpotifyUserBySpotifyId(ctx, handle);
  if (!spotifyUser) return null;
  const profile = await getProfileForUser(ctx, spotifyUser._id);
  return profile ? { profile, spotifyUser } : null;
}

async function checkSlugAvailable(
  ctx: QueryCtx,
  slug: string,
  spotifyUserId: Id<"spotifyUsers"> | undefined
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!SLUG_PATTERN.test(slug)) {
    return {
      ok: false,
      reason: "Handle must be 3–30 characters: lowercase letters, numbers and dashes.",
    };
  }
  if (RESERVED_SLUGS.has(slug)) {
    return { ok: false, reason: "That handle is reserved." };
  }
  const slugOwner = await getProfileBySlug(ctx, slug);
  if (slugOwner && slugOwner.spotifyUserId !== spotifyUserId) {
    return { ok: false, reason: "That handle is already taken." };
  }
  // A handle may not shadow someone else's Spotify ID link.
  const idOwner = await getSpotifyUserBySpotifyId(ctx, slug);
  if (idOwner && idOwner._id !== spotifyUserId) {
    return { ok: false, reason: "That handle is already taken." };
  }
  return { ok: true };
}

/** Latest snapshot rows for a user/range, sorted by rank. */
type HistoryTable = "topTrackHistory" | "topArtistHistory" | "topGenreHistory";

async function latestSnapshot<T extends HistoryTable>(
  ctx: QueryCtx,
  table: T,
  spotifyUserId: Id<"spotifyUsers">,
  timeRange: string,
  limit: number
) {
  // All history tables share the same index shape.
  const historyTable = table as "topTrackHistory";
  const latest = await ctx.db
    .query(historyTable)
    .withIndex("by_user_range_syncedAt", (q) =>
      q.eq("spotifyUserId", spotifyUserId).eq("timeRange", timeRange)
    )
    .order("desc")
    .first();
  if (!latest) return { syncedAt: null, items: [] as Doc<T>[] };

  const docs = await ctx.db
    .query(historyTable)
    .withIndex("by_user_range_syncedAt", (q) =>
      q
        .eq("spotifyUserId", spotifyUserId)
        .eq("timeRange", timeRange)
        .eq("syncedAt", latest.syncedAt)
    )
    .collect();

  return {
    syncedAt: latest.syncedAt,
    items: (docs as unknown as Doc<T>[])
      .sort((a, b) => a.rank - b.rank)
      .slice(0, limit),
  };
}

async function resolveBlock(
  block: ProfileBlock,
  snapshot: <T extends HistoryTable>(
    table: T,
    timeRange: string
  ) => Promise<{ syncedAt: number | null; items: Doc<T>[] }>
) {
  const base = { id: block.id, title: block.title ?? null };
  const timeRange = block.timeRange ?? "medium_term";
  const count = clampCount(block.count);

  switch (block.type) {
    case "artists": {
      const { syncedAt, items } = await snapshot("topArtistHistory", timeRange);
      return {
        ...base,
        type: block.type,
        timeRange,
        layout: block.layout ?? "grid",
        syncedAt,
        items: items.slice(0, count).map((artist) => ({
          rank: artist.rank,
          name: artist.artistName,
          imageUrl: artist.imageUrl ?? null,
          genres: artist.genres.slice(0, 2),
          url: `https://open.spotify.com/artist/${artist.artistSpotifyId}`,
        })),
      };
    }
    case "tracks": {
      const { syncedAt, items } = await snapshot("topTrackHistory", timeRange);
      return {
        ...base,
        type: block.type,
        timeRange,
        layout: block.layout ?? "list",
        syncedAt,
        items: items.slice(0, count).map((track) => ({
          rank: track.rank,
          name: track.trackName,
          artistNames: track.artistNames,
          albumName: track.albumName,
          imageUrl: track.albumImageUrl ?? null,
          url: track.externalUrl ?? null,
        })),
      };
    }
    case "genres": {
      const { syncedAt, items } = await snapshot("topGenreHistory", timeRange);
      return {
        ...base,
        type: block.type,
        timeRange,
        syncedAt,
        items: items.slice(0, count).map((genre) => ({
          name: genre.genre,
          count: genre.count,
        })),
      };
    }
    case "nowPlaying":
      return { ...base, type: block.type };
    case "text":
      return { ...base, type: block.type, text: block.text ?? "" };
  }
}

async function buildPublicProfile(
  ctx: QueryCtx,
  spotifyUser: Doc<"spotifyUsers">,
  settings: ProfileDisplaySettings
) {
  // Several blocks may read the same table/range; fetch each snapshot once.
  const cache = new Map<string, Promise<{ syncedAt: number | null; items: unknown[] }>>();
  const snapshot = <T extends HistoryTable>(table: T, timeRange: string) => {
    const key = `${table}:${timeRange}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        latestSnapshot(ctx, table, spotifyUser._id, timeRange, SNAPSHOT_FETCH_LIMIT)
      );
    }
    return cache.get(key) as Promise<{ syncedAt: number | null; items: Doc<T>[] }>;
  };

  const blocks = await Promise.all(
    settings.blocks.map((block) => resolveBlock(block, snapshot))
  );

  const syncedAt = blocks
    .map((block) => ("syncedAt" in block ? block.syncedAt : null))
    .filter((value): value is number => value != null)
    .reduce<number | null>((max, value) => Math.max(max ?? 0, value), null);

  return {
    handle: canonicalHandle(settings, spotifyUser),
    displayName: spotifyUser.displayName,
    avatarUrl: settings.showAvatar ? spotifyUser.avatarUrl ?? null : null,
    bio: settings.bio?.trim() || null,
    theme: settings.theme,
    syncedAt,
    blocks,
  };
}

/** The signed-in user's profile settings (or defaults if never configured). */
export const getMyPublicProfile = query({
  args: {},
  handler: async (ctx) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    if (!spotifyUser) return null;

    const profile = await getProfileForUser(ctx, spotifyUser._id);
    if (profile) {
      return {
        ...profileSettings(profile),
        updatedAt: profile.updatedAt,
        spotifyId: spotifyUser.spotifyId,
        exists: true as const,
      };
    }

    return {
      ...DEFAULT_SETTINGS,
      slug: suggestSlug(spotifyUser.displayName),
      spotifyId: spotifyUser.spotifyId,
      updatedAt: null,
      exists: false as const,
    };
  },
});

export const checkSlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    return checkSlugAvailable(ctx, normalizeSlug(slug), spotifyUser?._id);
  },
});

export const updateMyPublicProfile = mutation({
  args: { ...displaySettingsArgs, enabled: v.boolean() },
  handler: async (ctx, args) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    if (!spotifyUser) throw new Error("Not authenticated");

    if (!(args.theme in CARD_THEMES)) {
      throw new Error("Unknown theme.");
    }

    const existing = await getProfileForUser(ctx, spotifyUser._id);

    // Keep a previously claimed handle when switching to the Spotify ID link,
    // so old custom links keep redirecting.
    let slug = args.slug ? normalizeSlug(args.slug) : undefined;
    if (args.linkType === "custom") {
      if (!slug) throw new Error("Choose a handle for your custom link.");
      const result = await checkSlugAvailable(ctx, slug, spotifyUser._id);
      if (!result.ok) throw new Error(result.reason);
    } else if (slug !== existing?.slug) {
      slug = existing?.slug;
    }

    const settings = {
      ...args,
      // Drop legacy fixed-section fields once the profile is saved as blocks.
      allowIndexing: undefined,
      timeRange: undefined,
      showTracks: undefined,
      showArtists: undefined,
      showGenres: undefined,
      showNowPlaying: undefined,
      trackCount: undefined,
      artistCount: undefined,
      slug,
      bio: args.bio?.trim().slice(0, BIO_MAX_LENGTH) || undefined,
      blocks: sanitizeBlocks(args.blocks),
      updatedAt: Date.now(),
    };

    if (existing) {
      await ctx.db.patch(existing._id, settings);
    } else {
      await ctx.db.insert("publicProfiles", {
        spotifyUserId: spotifyUser._id,
        ...settings,
      });
    }

    return { handle: canonicalHandle(settings, spotifyUser) };
  },
});

/**
 * Public — returns null unless the owner has enabled their profile, and only
 * includes the sections they opted into.
 */
export const getPublicProfileByHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, { handle }) => {
    const resolved = await resolveHandle(ctx, handle);
    if (!resolved?.profile.enabled) return null;

    return buildPublicProfile(
      ctx,
      resolved.spotifyUser,
      profileSettings(resolved.profile)
    );
  },
});

/** Renders the signed-in user's profile with unsaved draft settings. */
export const previewMyPublicProfile = query({
  args: displaySettingsArgs,
  handler: async (ctx, settings) => {
    const spotifyUser = await getCurrentSpotifyUser(ctx);
    if (!spotifyUser) return null;

    return buildPublicProfile(ctx, spotifyUser, {
      ...settings,
      blocks: sanitizeBlocks(settings.blocks),
    });
  },
});

/** Resolves a handle to its owner only if they've opted into now-playing. */
export const getNowPlayingOwner = internalQuery({
  args: { handle: v.string() },
  handler: async (ctx, { handle }) => {
    const resolved = await resolveHandle(ctx, handle);
    const hasNowPlaying = resolved && profileSettings(resolved.profile).blocks.some(
      (block) => block.type === "nowPlaying"
    );
    if (!resolved?.profile.enabled || !hasNowPlaying) {
      return null;
    }
    return resolved.spotifyUser._id;
  },
});
