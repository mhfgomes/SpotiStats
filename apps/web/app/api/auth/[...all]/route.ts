import { handler } from "@/lib/auth-server";

const developmentOrigins = [
  "http://127.0.0.1:8081",
  "http://localhost:8081",
  "http://127.0.0.1:8082",
  "http://localhost:8082",
];

function applyCors(request: Request, response: Response) {
  const origin = request.headers.get("origin");
  const headers = new Headers(response.headers);
  const allowedOrigins = new Set([
    process.env.EXPO_WEB_URL,
    ...(process.env.NODE_ENV === "development" ? developmentOrigins : []),
  ]);

  if (origin && allowedOrigins.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export async function GET(request: Request) {
  return applyCors(request, await handler.GET(request));
}

export async function POST(request: Request) {
  return applyCors(request, await handler.POST(request));
}

export function OPTIONS(request: Request) {
  return applyCors(request, new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type, Cookie, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  }));
}
