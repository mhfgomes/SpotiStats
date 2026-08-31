import { betterAuth } from "better-auth";
import { createClient, convexAdapter } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { expo } from "@better-auth/expo";
import type { GenericCtx } from "@convex-dev/better-auth";
import type { GenericDataModel } from "convex/server";
import type { DataModel } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import { components } from "./_generated/api";
import authConfig from "./auth.config";

/**
 * Factory function that creates a Better Auth instance bound to the current
 * Convex request context (for database access via the convexAdapter).
 */
export const createAuth = <DM extends GenericDataModel>(ctx: GenericCtx<DM>) => {
  const isLocalDevelopment = process.env.SITE_URL?.startsWith("http://") ?? false;
  const siteUrl = process.env.SITE_URL ?? "http://127.0.0.1:3000";
  const authUrl = process.env.CONVEX_SITE_URL;

  if (!authUrl) {
    throw new Error("CONVEX_SITE_URL must be configured for authentication");
  }

  return betterAuth({
    // OAuth starts and completes on the web app's origin. The Next.js auth
    // route proxies requests to Convex while preserving first-party cookies.
    baseURL: siteUrl,
    basePath: "/api/auth",
    secret: process.env.BETTER_AUTH_SECRET,
    database: convexAdapter(
      ctx as unknown as GenericCtx<GenericDataModel>,
      components.betterAuth
    ),
    socialProviders: {
      spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID as string,
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
        scope: [
          "user-read-private",
          "user-read-email",
          "user-top-read",
          "user-read-recently-played",
          "user-read-currently-playing",
          "user-read-playback-state",
        ],
      },
    },
    trustedOrigins: [
      siteUrl,
      authUrl,
      process.env.EXPO_WEB_URL ?? "http://127.0.0.1:8081",
      "http://localhost:8081",
      "http://localhost:8082",
      "spotistats://",
      "spotistats://*",
      ...(isLocalDevelopment ? ["exp://", "exp://**"] : []),
    ],
    plugins: [
      expo(),
      convex({
        authConfig,
        jwks: process.env.JWKS,
      }),
    ],
  });
};

/**
 * Convex-side auth client — provides utility methods for queries/mutations/actions.
 */
export const authComponent = createClient<DataModel>(components.betterAuth);

/**
 * One-time JWKS key generation. Run once after first deploy:
 *   bunx convex run auth:generateJwk | bunx convex env set JWKS
 * Then update auth.config.ts to use: getAuthConfigProvider({ jwks: process.env.JWKS })
 */
export const generateJwk = internalAction({
  args: {},
  handler: async (ctx) => {
    const auth = createAuth(ctx);
    // rotateKeys is added by the convex() plugin. The result contains Date objects
    // which Convex cannot serialize, so we convert them to ISO strings first.
    const result = await (auth.api as { rotateKeys: () => Promise<unknown> }).rotateKeys();
    return JSON.parse(JSON.stringify(result, (_, v) =>
      v instanceof Date ? v.toISOString() : v
    ));
  },
});
