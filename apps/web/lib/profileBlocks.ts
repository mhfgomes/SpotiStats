// Shared definitions for public profile blocks — used by the Convex schema,
// publicProfiles functions and the profile editor.

import { v, type Infer } from "convex/values";

export const PROFILE_BLOCK_TYPES = [
  "artists",
  "tracks",
  "genres",
  "nowPlaying",
  "text",
] as const;
export const PROFILE_TIME_RANGES = ["short_term", "medium_term", "long_term"] as const;
export const PROFILE_BLOCK_COUNTS = [3, 5, 10, 15, 20] as const;
export const MAX_PROFILE_BLOCKS = 12;
export const BLOCK_TITLE_MAX_LENGTH = 60;
export const BLOCK_TEXT_MAX_LENGTH = 500;

export const profileBlockValidator = v.object({
  id: v.string(),
  type: v.union(...PROFILE_BLOCK_TYPES.map((type) => v.literal(type))),
  /** Custom heading; falls back to a generated one. */
  title: v.optional(v.string()),
  timeRange: v.optional(v.string()),
  count: v.optional(v.number()),
  layout: v.optional(v.union(v.literal("grid"), v.literal("list"))),
  /** Body for "text" blocks. */
  text: v.optional(v.string()),
});

export type ProfileBlock = Infer<typeof profileBlockValidator>;
export type ProfileBlockType = ProfileBlock["type"];

export const PROFILE_BLOCK_LABELS: Record<ProfileBlockType, string> = {
  artists: "Top artists",
  tracks: "Top tracks",
  genres: "Top genres",
  nowPlaying: "Now playing",
  text: "Text",
};

/** Blocks that read stats for a time range. */
export function isStatsBlock(type: ProfileBlockType) {
  return type === "artists" || type === "tracks" || type === "genres";
}

export function createProfileBlock(type: ProfileBlockType): ProfileBlock {
  const id = Math.random().toString(36).slice(2, 10);
  switch (type) {
    case "artists":
      return { id, type, timeRange: "medium_term", count: 10, layout: "grid" };
    case "tracks":
      return { id, type, timeRange: "medium_term", count: 10, layout: "list" };
    case "genres":
      return { id, type, timeRange: "medium_term", count: 5 };
    case "nowPlaying":
      return { id, type };
    case "text":
      return { id, type, text: "" };
  }
}

export const DEFAULT_PROFILE_BLOCKS: ProfileBlock[] = [
  { id: "artists", type: "artists", timeRange: "medium_term", count: 10, layout: "grid" },
  { id: "tracks", type: "tracks", timeRange: "medium_term", count: 10, layout: "list" },
  { id: "genres", type: "genres", timeRange: "medium_term", count: 5 },
];
