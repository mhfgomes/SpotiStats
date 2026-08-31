export type AccountPageData = {
  authUser: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    emailVerified: boolean;
    createdAt: number;
  } | null;
  spotifyAccount: {
    connected: boolean;
    providerId: "spotify";
    scope: string | null;
    linkedAt: number | null;
    updatedAt: number | null;
    accessTokenExpiresAt: number | null;
  };
  spotifyProfile: {
    spotifyUserId: string;
    spotifyId: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
  sessions: Array<{
    id: string;
    isCurrent: boolean;
    createdAt: number;
    updatedAt: number;
    expiresAt: number;
    ipAddressMasked: string | null;
    userAgent: string | null;
    deviceLabel: string;
  }>;
  dataSummary: {
    tracks: {
      rowCount: number;
      snapshotCount: number;
      latestSyncedAt: number | null;
    };
    artists: {
      rowCount: number;
      snapshotCount: number;
      latestSyncedAt: number | null;
    };
    genres: {
      rowCount: number;
      snapshotCount: number;
      latestSyncedAt: number | null;
    };
    totalRows: number;
    latestSyncedAt: number | null;
  };
};

export type FeedbackState =
  | {
      type: "success" | "error";
      message: string;
    }
  | null;

export function formatDate(value: number | null | undefined) {
  if (value == null) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(value);
}

export function formatDateTime(value: number | null | undefined) {
  if (value == null) return "Never";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export function formatScope(scope: string | null | undefined) {
  if (!scope) return "Unavailable";
  return scope
    .split(" ")
    .filter(Boolean)
    .join(", ");
}
