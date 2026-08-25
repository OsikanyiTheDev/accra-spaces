import type { ListingSummary } from "@/lib/types";

export function isSampleListing(listing: Pick<ListingSummary, "id" | "title" | "is_demo">): boolean {
  return Boolean(
    listing.is_demo ||
    listing.id.startsWith("sample-") ||
    listing.title.trim().toLowerCase().startsWith("sample:")
  );
}
