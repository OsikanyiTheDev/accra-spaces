import Link from "next/link";
import { Icon } from "@/components/icons";
import { ListingCard } from "@/components/listing-card";
import { SourceNotice } from "@/components/source-notice";
import type { ListingResult, SearchParams } from "@/lib/types";

function activeLabel(params: SearchParams): string {
  const parts = [params.type, params.mode === "sale" ? "for sale" : params.mode === "rent" ? "for rent" : undefined, params.area].filter(Boolean);
  return parts.length ? parts.join(" · ") : "Across Greater Accra";
}

export function ListingSection({ result, params }: { result: ListingResult; params: SearchParams }) {
  const hidden = Object.entries(params).filter(([key, value]) => key !== "sort" && key !== "cursor" && Boolean(value));
  const nextParams = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])));
  if (result.next_cursor) nextParams.set("cursor", result.next_cursor);

  return (
    <section className="spaces-section" id="spaces">
      <div className="shell">
        <SourceNotice source={result.source} message={result.message} />
        <div className="section-heading-row">
          <div>
            <span className="section-kicker">Explore spaces</span>
            <h2>Places worth a closer look</h2>
            <p>{activeLabel(params)}</p>
          </div>
          <form className="sort-form" action="/">
            {hidden.map(([key, value]) => <input key={key} type="hidden" name={key} value={value} />)}
            <label>
              <span>Sort by</span>
              <select name="sort" defaultValue={params.sort ?? "newest"}>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: low to high</option>
                <option value="price_desc">Price: high to low</option>
              </select>
            </label>
            <button className="button button-quiet button-small" type="submit">Apply</button>
          </form>
        </div>

        {result.listings.length > 0 ? (
          <div className="listing-grid">
            {result.listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
          </div>
        ) : (
          <div className="empty-state">
            <span className="empty-icon"><Icon name="search" size={28} /></span>
            <h3>No spaces match those filters</h3>
            <p>Try widening the price range or exploring another Greater Accra area.</p>
            <Link className="button button-dark" href="/#spaces">Clear filters</Link>
          </div>
        )}

        {result.next_cursor && (
          <div className="pagination-row">
            <Link className="button button-quiet" href={`/?${nextParams.toString()}#spaces`}>Next page <Icon name="arrow-right" size={16} /></Link>
          </div>
        )}
      </div>
    </section>
  );
}
