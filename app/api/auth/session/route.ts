import { NextResponse } from "next/server";
import { getAuthConfig, getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  return NextResponse.json(
    { configured: Boolean(getAuthConfig()), authenticated: Boolean(session), session },
    { headers: { "cache-control": "no-store" } },
  );
}
