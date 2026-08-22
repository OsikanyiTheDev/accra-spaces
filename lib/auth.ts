import { cookies } from "next/headers";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

export const AUTH_COOKIES = {
  access: "accra_spaces_access",
  id: "accra_spaces_id",
  state: "accra_spaces_oauth_state",
  verifier: "accra_spaces_pkce_verifier",
} as const;

export interface AuthConfig {
  baseUrl?: string;
  clientId: string;
  domain: string;
  issuer: string;
  region: string;
  userPoolId: string;
}

export interface Session {
  sub: string;
  email?: string;
  name?: string;
  groups: string[];
  role: "seeker" | "landlord" | "agent" | "admin";
  canPost: boolean;
}

let remoteKeys: ReturnType<typeof createRemoteJWKSet> | undefined;
let remoteIssuer = "";

export function getAuthConfig(): AuthConfig | null {
  const clientId = process.env.COGNITO_CLIENT_ID;
  const domain = process.env.COGNITO_DOMAIN?.replace(/\/$/, "");
  const region = process.env.COGNITO_REGION;
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!clientId || !domain || !region || !userPoolId) return null;
  return {
    baseUrl: process.env.AUTH_BASE_URL?.replace(/\/$/, ""),
    clientId,
    domain,
    region,
    userPoolId,
    issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
  };
}

export function getBackendApiUrl(): string | null {
  return (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "") ?? null;
}

export function authBaseUrl(requestOrigin: string): string {
  return getAuthConfig()?.baseUrl ?? requestOrigin;
}

export function authCookieOptions(baseUrl: string, maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: baseUrl.startsWith("https://"),
    path: "/",
    maxAge,
  };
}

export async function verifyIdToken(token: string, config: AuthConfig): Promise<JWTPayload> {
  if (!remoteKeys || remoteIssuer !== config.issuer) {
    remoteIssuer = config.issuer;
    remoteKeys = createRemoteJWKSet(new URL(`${config.issuer}/.well-known/jwks.json`));
  }
  const { payload } = await jwtVerify(token, remoteKeys, {
    issuer: config.issuer,
    audience: config.clientId,
  });
  if (payload.token_use !== "id") throw new Error("Unexpected Cognito token use");
  return payload;
}

function groupsFrom(payload: JWTPayload): string[] {
  const value = payload["cognito:groups"];
  if (Array.isArray(value)) return value.filter((group): group is string => typeof group === "string");
  if (typeof value === "string") return value.split(",").filter(Boolean);
  return [];
}

function roleFrom(groups: string[]): Session["role"] {
  if (groups.includes("Admin")) return "admin";
  if (groups.includes("Agent")) return "agent";
  if (groups.includes("Landlord")) return "landlord";
  return "seeker";
}

export async function getSession(): Promise<Session | null> {
  const config = getAuthConfig();
  if (!config) return null;
  const token = (await cookies()).get(AUTH_COOKIES.id)?.value;
  if (!token) return null;
  try {
    const payload = await verifyIdToken(token, config);
    if (!payload.sub) return null;
    const groups = groupsFrom(payload);
    const role = roleFrom(groups);
    return {
      sub: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      name: typeof payload.name === "string" ? payload.name : undefined,
      groups,
      role,
      canPost: role === "landlord" || role === "agent",
    };
  } catch {
    return null;
  }
}
