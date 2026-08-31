import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

/**
 * Convex auth config — used by the Convex runtime to verify JWTs.
 *
 * When JWKS is not provided, Better Auth dynamically fetches the public keys
 * from the JWKS endpoint (/api/auth/convex/jwks). For production, set the
 * JWKS env var by running: bunx convex run auth:generateJwk | bunx convex env set JWKS
 * then update this to: getAuthConfigProvider({ jwks: process.env.JWKS })
 */
const authConfig: AuthConfig = {
  providers: [getAuthConfigProvider({ jwks: process.env.JWKS })],
};

export default authConfig;
