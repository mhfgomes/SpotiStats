import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [convexClient()],
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  basePath: "/api/auth",
});

export const { signIn, signOut, useSession } = authClient;
