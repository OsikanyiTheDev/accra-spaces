import Link from "next/link";
import { FavoriteButton } from "@/components/favorite-button";
import { Icon } from "@/components/icons";
import { PropertyVisual } from "@/components/property-visual";
import { formatGhs, maintenanceLabel, priceSuffix, typeLabel } from "@/lib/format";
import type { ListingSummary } from "@/lib/types";

export function ListingCard({ listing }: { listing: ListingSummary }) {
  const hasDayNight = listing.completeness.checks.find((check) => check.key === "day_night_photos")?.complete;
  return (
    <article className="listing-card">
      <div className="listing-media">
        <Link href={`/listings/${listing.id}`} aria-label={`View ${listing.title}`}>
          <PropertyVisual listing={listing} imageUrl={listing.cover_url} />
        </Link>
        <div className="listing-badges">
          <span className="status-badge">For {listing.sale_mode === "rent" ? "rent" : "sale"}</span>
          {listing.completeness.level === "complete" && (
            <span className="completeness-badge"><Icon name="shield" size={14} /> Complete details</span>
          )}
        </div>
        <FavoriteButton listingId={listing.id} compact />
      </div>
      <div className="listing-card-body">
        <div className="listing-location"><Icon name="map-pin" size={14} /> {listing.area} · {typeLabel(listing.type)}</div>
        <Link className="listing-title" href={`/listings/${listing.id}`}>{listing.title}</Link>
        <div className="listing-price">
          <strong>{formatGhs(listing.price_ghs)}</strong>
          <span>{priceSuffix(listing.sale_mode)}</span>
          {listing.negotiable && <small>Negotiable</small>}
        </div>
        <div className="listing-meta" aria-label="Property facts">
          {listing.beds > 0 && <span><Icon name="bed" size={16} /> {listing.beds} bed{listing.beds === 1 ? "" : "s"}</span>}
          <span><Icon name="bath" size={16} /> {listing.baths} bath{listing.baths === 1 ? "" : "s"}</span>
          {listing.size_m2 && <span><Icon name="ruler" size={16} /> {listing.size_m2} m²</span>}
        </div>
        <div className="listing-terms">
          <span>{listing.deposit_months === 0 ? "No rent deposit" : `${listing.deposit_months} month${listing.deposit_months === 1 ? "" : "s"} deposit`}</span>
          <span>{maintenanceLabel(listing.maintenance_policy)}</span>
        </div>
        <div className="listing-card-footer">
          {hasDayNight ? <span className="day-night-chip"><Icon name="sun" size={14} /><Icon name="moon" size={13} /> Day + night</span> : <span />}
          <Link href={`/listings/${listing.id}`}>View details <Icon name="arrow-right" size={15} /></Link>
        </div>
      </div>
    </article>
  );
}
