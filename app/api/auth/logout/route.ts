import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIES, authBaseUrl, authCookieOptions, getAuthConfig } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const config = getAuthConfig();
  const baseUrl = authBaseUrl(request.nextUrl.origin);
  const destination = config
    ? new URL(`${config.domain}/logout`)
    : new URL("/", baseUrl);
  if (config) {
    destination.searchParams.set("client_id", config.clientId);
    destination.searchParams.set("logout_uri", `${baseUrl}/`);
  }

  const response = NextResponse.redirect(destination);
  Object.values(AUTH_COOKIES).forEach((name) => {
    response.cookies.set(name, "", authCookieOptions(baseUrl, 0));
  });
  return response;
}
