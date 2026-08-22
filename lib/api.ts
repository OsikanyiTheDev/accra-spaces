import { DEMO_LISTINGS } from "@/lib/demo-data";
import type { ListingDetail, ListingResult, ListingSummary, SearchParams } from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function queryString(params: SearchParams): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  if (!query.has("limit")) query.set("limit", "24");
  return query.toString();
}

function filterDemoListings(params: SearchParams): ListingSummary[] {
  const min = params.min_price ? Number(params.min_price) : undefined;
  const max = params.max_price ? Number(params.max_price) : undefined;
  const beds = params.beds ? Number(params.beds) : undefined;

  const results = DEMO_LISTINGS.filter((listing) => {
    if (params.area && listing.area !== params.area) return false;
    if (params.type && listing.type !== params.type) return false;
    if (params.mode && listing.sale_mode !== params.mode) return false;
    if (min !== undefined && listing.price_ghs < min) return false;
    if (max !== undefined && listing.price_ghs > max) return false;
    if (beds !== undefined && listing.beds < beds) return false;
    return true;
  });

  if (params.sort === "price_asc") results.sort((a, b) => a.price_ghs - b.price_ghs);
  else if (params.sort === "price_desc") results.sort((a, b) => b.price_ghs - a.price_ghs);
  else results.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  return results;
}

async function mediaUrls(keys: string[]): Promise<Record<string, string>> {
  if (!API_BASE || keys.length === 0) return {};
  try {
    const response = await fetch(`${API_BASE}/media/urls`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ keys }),
      cache: "no-store",
    });
    if (!response.ok) return {};
    const payload = (await response.json()) as { urls?: Record<string, string> };
    return payload.urls ?? {};
  } catch {
    return {};
  }
}

export async function getListings(params: SearchParams = {}): Promise<ListingResult> {
  if (!API_BASE) {
    const listings = filterDemoListings(params);
    return { listings, count: listings.length, next_cursor: null, source: "demo" };
  }

  try {
    const response = await fetch(`${API_BASE}/listings?${queryString(params)}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error(`Listings API returned ${response.status}`);
    const payload = (await response.json()) as {
      listings: ListingSummary[];
      count: number;
      next_cursor: string | null;
    };
    const keys = payload.listings.map((item) => item.cover_key).filter((key): key is string => Boolean(key));
    const urls = await mediaUrls(keys);
    return {
      ...payload,
      listings: payload.listings.map((listing) => ({
        ...listing,
        cover_url: listing.cover_key ? urls[listing.cover_key] : undefined,
      })),
      source: "api",
    };
  } catch {
    return {
      listings: [],
      count: 0,
      next_cursor: null,
      source: "unavailable",
      message: "The listings service is temporarily unavailable. No demo inventory has been substituted.",
    };
  }
}

export async function getListing(id: string): Promise<{ listing: ListingDetail | null; source: ListingResult["source"] }> {
  if (!API_BASE) {
    return { listing: DEMO_LISTINGS.find((item) => item.id === id) ?? null, source: "demo" };
  }

  try {
    const response = await fetch(`${API_BASE}/listings/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
    });
    if (response.status === 404) return { listing: null, source: "api" };
    if (!response.ok) throw new Error(`Listing API returned ${response.status}`);
    const payload = (await response.json()) as { listing: ListingDetail };
    const keys = [...payload.listing.day_photos, ...payload.listing.night_photos];
    const urls = await mediaUrls(keys);
    return {
      listing: {
        ...payload.listing,
        cover_url: payload.listing.cover_key ? urls[payload.listing.cover_key] : undefined,
        day_photo_urls: payload.listing.day_photos.map((key) => urls[key]).filter(Boolean),
        night_photo_urls: payload.listing.night_photos.map((key) => urls[key]).filter(Boolean),
      },
      source: "api",
    };
  } catch {
    return { listing: null, source: "unavailable" };
  }
}
