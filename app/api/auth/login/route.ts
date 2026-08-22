import { createHash, randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIES, authBaseUrl, authCookieOptions, getAuthConfig } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const config = getAuthConfig();
  if (!config) return NextResponse.redirect(new URL("/auth?error=not_configured", request.url));

  const state = randomBytes(24).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const baseUrl = authBaseUrl(request.nextUrl.origin);
  const callbackUrl = `${baseUrl}/api/auth/callback`;
  const authorize = new URL(`${config.domain}/oauth2/authorize`);
  authorize.searchParams.set("client_id", config.clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("scope", "openid email profile");
  authorize.searchParams.set("redirect_uri", callbackUrl);
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("code_challenge", challenge);
  authorize.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorize);
  response.cookies.set(AUTH_COOKIES.state, state, authCookieOptions(baseUrl, 600));
  response.cookies.set(AUTH_COOKIES.verifier, verifier, authCookieOptions(baseUrl, 600));
  return response;
}
