import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIES, getBackendApiUrl } from "@/lib/auth";

const ALLOWED = [
  /^listings$/,
  /^listings\/[A-Za-z0-9_-]+$/,
  /^listings\/[A-Za-z0-9_-]+\/(media\/presign|viewing-requests|offers)$/,
  /^me\/role$/,
  /^me\/favorites(?:\/[A-Za-z0-9_-]+)?$/,
  /^me\/saved-searches(?:\/[A-Za-z0-9_-]+)?$/,
];

const METHOD_RULES: Record<string, RegExp[]> = {
  GET: [/^me\/favorites$/, /^me\/saved-searches$/],
  POST: [
    /^listings$/,
    /^listings\/[A-Za-z0-9_-]+\/(media\/presign|viewing-requests|offers)$/,
    /^me\/role$/,
    /^me\/favorites\/[A-Za-z0-9_-]+$/,
    /^me\/saved-searches$/,
  ],
  PATCH: [/^listings\/[A-Za-z0-9_-]+$/],
  DELETE: [/^me\/favorites\/[A-Za-z0-9_-]+$/, /^me\/saved-searches\/[A-Za-z0-9_-]+$/],
};

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const apiUrl = getBackendApiUrl();
  if (!apiUrl) return NextResponse.json({ error: "backend_not_configured" }, { status: 503 });

  const segments = (await context.params).path;
  const path = segments.join("/");
  const methodAllowed = METHOD_RULES[request.method]?.some((pattern) => pattern.test(path));
  if (!ALLOWED.some((pattern) => pattern.test(path)) || !methodAllowed) {
    return NextResponse.json({ error: "route_not_allowed" }, { status: 404 });
  }

  const accessToken = (await cookies()).get(AUTH_COOKIES.access)?.value;
  if (!accessToken) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const target = new URL(`${apiUrl}/${path}`);
  request.nextUrl.searchParams.forEach((value, key) => target.searchParams.append(key, value));
  const body = request.method === "GET" || request.method === "DELETE" ? undefined : await request.text();

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers: {
        authorization: `Bearer ${accessToken}`,
        ...(body ? { "content-type": request.headers.get("content-type") ?? "application/json" } : {}),
      },
      body,
      cache: "no-store",
    });
    return new NextResponse(await upstream.text(), {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") ?? "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "backend_unavailable" }, { status: 502 });
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
