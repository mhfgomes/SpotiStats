#!/usr/bin/env bun
/**
 * Bootstrap an anonymous local Convex deployment and regenerate
 * convex/_generated for CI (no cloud account / deploy key required).
 */
import { spawnSync } from "node:child_process";
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { exportJWK, exportPKCS8, generateKeyPair } from "jose";

function run(
  command: string,
  args: string[],
  options: { env?: NodeJS.ProcessEnv; input?: string } = {},
) {
  const result = spawnSync(command, args, {
    stdio: options.input === undefined ? "inherit" : ["pipe", "inherit", "inherit"],
    env: options.env ?? process.env,
    input: options.input,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function loadDotEnvLocal(env: NodeJS.ProcessEnv) {
  if (!existsSync(".env.local")) return;
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!match) continue;
    env[match[1]] = match[2];
  }
}

async function createPlaceholderJwks() {
  const keys = await generateKeyPair("RS256", { extractable: true });
  const publicKey = await exportJWK(keys.publicKey);
  const privateKey = await exportPKCS8(keys.privateKey);
  return JSON.stringify([
    {
      id: "ci-placeholder-key",
      publicKey: JSON.stringify(publicKey),
      privateKey,
      createdAt: 0,
      alg: "RS256",
    },
  ]);
}

const env: NodeJS.ProcessEnv = {
  ...process.env,
  CONVEX_AGENT_MODE: "anonymous",
};

if (!existsSync(".env.local")) {
  console.log("Initializing anonymous Convex deployment...");
  run("bunx", ["convex", "init"], { env });
}

loadDotEnvLocal(env);

const placeholderVars: Record<string, string> = {
  SITE_URL: "http://127.0.0.1:3000",
  BETTER_AUTH_SECRET: "ci-placeholder-secret-not-for-production",
  SPOTIFY_CLIENT_ID: "ci-placeholder",
  SPOTIFY_CLIENT_SECRET: "ci-placeholder",
  JWKS: await createPlaceholderJwks(),
};

for (const [name, value] of Object.entries(placeholderVars)) {
  console.log(`Setting ${name}...`);
  run("bunx", ["convex", "env", "set", name, "--force"], { env, input: value });
}

console.log("Running Convex codegen...");
run("bunx", ["convex", "codegen", "--typecheck", "enable"], { env });

if (
  existsSync(".env.local") &&
  !readFileSync(".env.local", "utf8").includes("NEXT_PUBLIC_SITE_URL=")
) {
  appendFileSync(".env.local", "NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000\n");
}

console.log("Convex codegen complete.");
