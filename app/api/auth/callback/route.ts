import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIES, authBaseUrl, authCookieOptions, getAuthConfig, verifyIdToken } from "@/lib/auth";

export const runtime = "nodejs";

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  error?: string;
}

function authError(request: NextRequest, reason: string) {
  const url = new URL("/auth", request.url);
  url.searchParams.set("error", reason);
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const config = getAuthConfig();
  if (!config) return authError(request, "not_configured");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get(AUTH_COOKIES.state)?.value;
  const verifier = request.cookies.get(AUTH_COOKIES.verifier)?.value;
  if (!code || !state || !expectedState || state !== expectedState || !verifier) {
    return authError(request, "invalid_callback");
  }

  const baseUrl = authBaseUrl(request.nextUrl.origin);
  const callbackUrl = `${baseUrl}/api/auth/callback`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.clientId,
    code,
    code_verifier: verifier,
    redirect_uri: callbackUrl,
  });

  try {
    const tokenResponse = await fetch(`${config.domain}/oauth2/token`, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });
    const tokens = (await tokenResponse.json()) as TokenResponse;
    if (!tokenResponse.ok || !tokens.id_token || !tokens.access_token) {
      return authError(request, tokens.error ?? "token_exchange_failed");
    }
    await verifyIdToken(tokens.id_token, config);

    const response = NextResponse.redirect(new URL("/account?auth=success", baseUrl));
    const tokenAge = tokens.expires_in ?? 3600;
    response.cookies.set(AUTH_COOKIES.id, tokens.id_token, authCookieOptions(baseUrl, tokenAge));
    response.cookies.set(AUTH_COOKIES.access, tokens.access_token, authCookieOptions(baseUrl, tokenAge));
    response.cookies.set(AUTH_COOKIES.state, "", authCookieOptions(baseUrl, 0));
    response.cookies.set(AUTH_COOKIES.verifier, "", authCookieOptions(baseUrl, 0));
    return response;
  } catch {
    return authError(request, "token_exchange_failed");
  }
}
