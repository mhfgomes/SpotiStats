"use node";

import type { ActionCtx } from "../_generated/server";
import { components } from "../_generated/api";

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

/**
 * Gets a valid Spotify access token for a user identified by their Better Auth user ID.
 * Automatically refreshes expired tokens by calling Spotify's token endpoint.
 */
export async function getSpotifyToken(
  ctx: ActionCtx,
  betterAuthUserId: string
): Promise<string> {
  // Query the account record from the Better Auth component
  const account = await ctx.runQuery(
    components.betterAuth.adapter.findOne,
    {
      model: "account",
      where: [
        { field: "userId", value: betterAuthUserId },
        { field: "providerId", value: "spotify" },
      ],
    }
  ) as {
    accessToken?: string | null;
    refreshToken?: string | null;
    accessTokenExpiresAt?: number | null;
  } | null;

  if (!account) {
    throw new Error(
      `No Spotify account linked for user ${betterAuthUserId}. Please re-authenticate.`
    );
  }

  const now = Date.now();
  const isExpired =
    account.accessTokenExpiresAt != null &&
    account.accessTokenExpiresAt < now + 60_000; // refresh 1 min early

  if (!isExpired && account.accessToken) {
    return account.accessToken;
  }

  // Refresh using Spotify's token endpoint
  if (!account.refreshToken) {
    throw new Error(
      "Spotify access token expired and no refresh token available. Please re-authenticate."
    );
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const basic = toBase64(`${clientId}:${clientSecret}`);

  const res = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: account.refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to refresh Spotify token: ${res.status} ${body}`);
  }

  const data = await res.json() as {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
  };

  const newAccessToken = data.access_token;
  const newExpiresAt = Date.now() + data.expires_in * 1000;
  const newRefreshToken = data.refresh_token ?? account.refreshToken;

  // Update the token in the Better Auth component database
  await ctx.runMutation(components.betterAuth.adapter.updateOne, {
    input: {
      model: "account",
      where: [
        { field: "userId", value: betterAuthUserId },
        { field: "providerId", value: "spotify" },
      ],
      update: {
        accessToken: newAccessToken,
        accessTokenExpiresAt: newExpiresAt,
        refreshToken: newRefreshToken,
      },
    },
  });

  return newAccessToken;
}
