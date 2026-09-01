import { action, mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { components } from "./_generated/api";
import { v } from "convex/values";

type SnapshotDoc = {
  timeRange: string;
  syncedAt: number;
};

type BetterAuthUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: number;
};

type BetterAuthAccount = {
  id: string;
  userId: string;
  providerId: string;
  scope?: string | null;
  createdAt: number;
  updatedAt: number;
  accessTokenExpiresAt?: number | null;
};

type BetterAuthSession = {
  id?: string;
  _id?: string;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
  ipAddress?: string | null;
  userAgent?: string | null;
  userId: string;
};

type BetterAuthFindManyResult<T> = {
  page: T[];
};

type SessionLocationResult = {
  ip: string;
  locationLabel: string | null;
};

function getSessionId(session: BetterAuthSession): string | null {
  return session.id ?? session._id ?? null;
}

function formatDeviceLabel(userAgent: string | null | undefined): string {
  if (!userAgent) return "Unknown device";

  const lower = userAgent.toLowerCase();

  const platform = lower.includes("iphone")
    ? "iPhone"
    : lower.includes("ipad")
      ? "iPad"
      : lower.includes("android")
        ? "Android"
        : lower.includes("macintosh") || lower.includes("mac os x")
          ? "macOS"
          : lower.includes("windows")
            ? "Windows"
            : lower.includes("linux")
              ? "Linux"
              : null;

  const browser = lower.includes("edg/")
    ? "Edge"
    : lower.includes("firefox/")
      ? "Firefox"
      : lower.includes("chrome/") || lower.includes("crios/")
        ? "Chrome"
        : lower.includes("safari/")
          ? "Safari"
          : null;

  if (platform && browser) {
    return `${platform} · ${browser}`;
  }

  return platform ?? browser ?? "Unknown device";
}

function buildSnapshotCount<T extends SnapshotDoc>(docs: T[]) {
  return new Set(docs.map((doc) => `${doc.timeRange}:${doc.syncedAt}`)).size;
}

function maxSyncedAt<T extends { syncedAt: number }>(docs: T[]) {
  if (docs.length === 0) return null;
  return docs.reduce((latest, doc) => Math.max(latest, doc.syncedAt), 0);
}

function maxTimestamp(values: Array<number | null>) {
  const presentValues = values.filter((value): value is number => value != null);
  if (presentValues.length === 0) return null;
  return Math.max(...presentValues);
}

function isPrivateOrLocalIp(ip: string) {
  const normalized = ip.trim().toLowerCase();
  const isPrivate172Range = /^172\.(1[6-9]|2\d|3[0-1])\./.test(normalized);

  return (
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized.startsWith("10.") ||
    normalized.startsWith("192.168.") ||
    isPrivate172Range ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

async function getUserSessions(ctx: QueryCtx | MutationCtx, userId: string) {
  return await ctx.runQuery(components.betterAuth.adapter.findMany, {
    model: "session",
    where: [{ field: "userId", value: userId }],
    limit: 250,
    paginationOpts: {
      cursor: null,
      numItems: 250,
    },
  }) as BetterAuthFindManyResult<BetterAuthSession>;
}

async function lookupLocation(ip: string) {
  if (isPrivateOrLocalIp(ip)) {
    return "Local / private network";
  }

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json() as {
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
    };

    if (payload.success === false) {
      return null;
    }

    const parts = [payload.city, payload.region, payload.country].filter(
      (part): part is string => Boolean(part)
    );

    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

export const getAccountPageData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const [authUser, spotifyAccount, sessions, spotifyProfile] = await Promise.all([
      ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", value: identity.subject }],
      }),
      ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "account",
        where: [
          { field: "userId", value: identity.subject },
          { field: "providerId", value: "spotify" },
        ],
      }),
      getUserSessions(ctx, identity.subject),
      ctx.db
        .query("spotifyUsers")
        .withIndex("by_betterAuthUserId", (q) =>
          q.eq("betterAuthUserId", identity.subject)
        )
        .unique(),
    ]) as [
      BetterAuthUser | null,
      BetterAuthAccount | null,
      BetterAuthFindManyResult<BetterAuthSession>,
      Doc<"spotifyUsers"> | null,
    ];

    let trackDocs: Doc<"topTrackHistory">[] = [];
    let artistDocs: Doc<"topArtistHistory">[] = [];
    let genreDocs: Doc<"topGenreHistory">[] = [];

    if (spotifyProfile) {
      [trackDocs, artistDocs, genreDocs] = await Promise.all([
        ctx.db
          .query("topTrackHistory")
          .withIndex("by_user_range_syncedAt", (q) =>
            q.eq("spotifyUserId", spotifyProfile._id)
          )
          .collect(),
        ctx.db
          .query("topArtistHistory")
          .withIndex("by_user_range_syncedAt", (q) =>
            q.eq("spotifyUserId", spotifyProfile._id)
          )
          .collect(),
        ctx.db
          .query("topGenreHistory")
          .withIndex("by_user_range_syncedAt", (q) =>
            q.eq("spotifyUserId", spotifyProfile._id)
          )
          .collect(),
      ]);
    }

    const normalizedSessions = sessions.page
      .flatMap((session) => {
        const id = getSessionId(session);
        if (!id) return [];
        return [{
        id,
        isCurrent: id === identity.sessionId,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
        ipAddressMasked: session.ipAddress ?? null,
        userAgent: session.userAgent ?? null,
        deviceLabel: formatDeviceLabel(session.userAgent),
        }];
      })
      .sort((left, right) => {
        if (left.isCurrent !== right.isCurrent) {
          return left.isCurrent ? -1 : 1;
        }
        return right.updatedAt - left.updatedAt;
      });

    const trackSummary = {
      rowCount: trackDocs.length,
      snapshotCount: buildSnapshotCount(trackDocs),
      latestSyncedAt: maxSyncedAt(trackDocs),
    };
    const artistSummary = {
      rowCount: artistDocs.length,
      snapshotCount: buildSnapshotCount(artistDocs),
      latestSyncedAt: maxSyncedAt(artistDocs),
    };
    const genreSummary = {
      rowCount: genreDocs.length,
      snapshotCount: buildSnapshotCount(genreDocs),
      latestSyncedAt: maxSyncedAt(genreDocs),
    };

    return {
      authUser: authUser
        ? {
            id: authUser.id,
            name: authUser.name,
            email: authUser.email,
            image: authUser.image ?? null,
            emailVerified: authUser.emailVerified,
            createdAt: authUser.createdAt,
          }
        : null,
      spotifyAccount: {
        connected: Boolean(spotifyAccount),
        providerId: "spotify" as const,
        scope: spotifyAccount?.scope ?? null,
        linkedAt: spotifyAccount?.createdAt ?? null,
        updatedAt: spotifyAccount?.updatedAt ?? null,
        accessTokenExpiresAt: spotifyAccount?.accessTokenExpiresAt ?? null,
      },
      spotifyProfile: spotifyProfile
        ? {
            spotifyUserId: String(spotifyProfile._id),
            spotifyId: spotifyProfile.spotifyId,
            displayName: spotifyProfile.displayName,
            avatarUrl: spotifyProfile.avatarUrl ?? null,
          }
        : null,
      sessions: normalizedSessions,
      dataSummary: {
        tracks: trackSummary,
        artists: artistSummary,
        genres: genreSummary,
        totalRows:
          trackSummary.rowCount +
          artistSummary.rowCount +
          genreSummary.rowCount,
        latestSyncedAt: maxTimestamp([
          trackSummary.latestSyncedAt,
          artistSummary.latestSyncedAt,
          genreSummary.latestSyncedAt,
        ]),
      },
    };
  },
});

export const revokeOtherSessions = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const sessions = await getUserSessions(ctx, identity.subject);

    const otherSessionIds = sessions.page
      .map(getSessionId)
      .filter((sessionId): sessionId is string => sessionId !== null)
      .filter((sessionId) => sessionId !== identity.sessionId);

    if (otherSessionIds.length === 0) {
      return { revokedCount: 0 };
    }

    await ctx.runMutation(components.betterAuth.adapter.deleteMany, {
      input: {
        model: "session",
        where: otherSessionIds.map((sessionId, index) => ({
          field: "_id" as const,
          value: sessionId,
          ...(index === 0 ? {} : { connector: "OR" as const }),
        })),
      },
      paginationOpts: {
        cursor: null,
        numItems: Math.max(otherSessionIds.length, 1),
      },
    });

    return { revokedCount: otherSessionIds.length };
  },
});

export const revokeSession = mutation({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, { sessionId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    if (sessionId === identity.sessionId) {
      return {
        revoked: false,
        currentSession: true,
      };
    }

    const session = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "session",
      where: [
        { field: "_id", value: sessionId },
        { field: "userId", value: identity.subject },
      ],
    }) as BetterAuthSession | null;

    if (!session) {
      return {
        revoked: false,
        currentSession: false,
      };
    }

    await ctx.runMutation(components.betterAuth.adapter.deleteOne, {
      input: {
        model: "session",
        where: [
          { field: "_id", value: sessionId },
          { field: "userId", value: identity.subject },
        ],
      },
    });

    return {
      revoked: true,
      currentSession: false,
    };
  },
});

export const getSessionLocations = action({
  args: {
    ips: v.array(v.string()),
  },
  handler: async (ctx, { ips }): Promise<SessionLocationResult[]> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const uniqueIps = Array.from(
      new Set(
        ips
          .map((ip) => ip.trim())
          .filter((ip): ip is string => Boolean(ip))
      )
    );

    const locationsByIp = new Map<string, string | null>();

    for (const ip of uniqueIps) {
      locationsByIp.set(ip, await lookupLocation(ip));
    }

    return uniqueIps.map((ip) => ({
      ip,
      locationLabel: locationsByIp.get(ip) ?? null,
    }));
  },
});
