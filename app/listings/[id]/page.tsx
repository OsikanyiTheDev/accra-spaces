import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DetailGallery } from "@/components/detail-gallery";
import { FavoriteButton } from "@/components/favorite-button";
import { Icon } from "@/components/icons";
import { ListingActions } from "@/components/listing-actions";
import { SourceNotice } from "@/components/source-notice";
import { AMENITIES } from "@/lib/constants";
import { getListing } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { commissionLabel, maintenanceLabel, readableDate, typeLabel } from "@/lib/format";
import { isSampleListing } from "@/lib/sample-listing";

interface PageProps { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const { listing } = await getListing(id);
  return { title: listing?.title ?? "Listing not found", description: listing?.description };
}

export default async function ListingPage({ params }: PageProps) {
  const { id } = await params;
  const [{ listing, source }, session] = await Promise.all([getListing(id), getSession()]);
  if (!listing) notFound();

  const amenityLabels = new Map(AMENITIES);
  const commission = listing.poster.agent_commission;
  const isSample = isSampleListing(listing);

  return (
    <>
      <section className="detail-top">
        <div className="shell">
          <SourceNotice source={source} message={source === "unavailable" ? "The listing service could not be reached." : undefined} />
          <div className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href={`/?area=${encodeURIComponent(listing.area)}#spaces`}>{listing.area}</Link><span>/</span><span>{typeLabel(listing.type)}</span></div>
          <div className="detail-heading">
            <div>
              <div className="detail-badge-row">
                <span className="status-badge">For {listing.sale_mode === "rent" ? "rent" : "sale"}</span>
                {listing.completeness.level === "complete" && <span className="completeness-badge"><Icon name="shield" size={14} /> Complete details</span>}
                {isSample && <span className="demo-chip">Sample data</span>}
              </div>
              <h1>{listing.title}</h1>
              <p><Icon name="map-pin" size={17} /> {listing.area}, Greater Accra · Added {readableDate(listing.created_at)}</p>
            </div>
            <FavoriteButton listingId={listing.id} />
          </div>
          <DetailGallery listing={listing} />
        </div>
      </section>

      <section className="detail-content-section">
        <div className="shell detail-layout">
          <div className="detail-main">
            <div className="facts-grid">
              {listing.beds > 0 && <div><Icon name="bed" size={21} /><span>Bedrooms<strong>{listing.beds}</strong></span></div>}
              <div><Icon name="bath" size={21} /><span>Bathrooms<strong>{listing.baths}</strong></span></div>
              {listing.size_m2 && <div><Icon name="ruler" size={21} /><span>Floor area<strong>{listing.size_m2} m²</strong></span></div>}
              <div><Icon name="tag" size={21} /><span>Deposit<strong>{listing.deposit_months === 0 ? "Not applicable" : `${listing.deposit_months} months`}</strong></span></div>
            </div>

            <article className="detail-block">
              <span className="section-kicker">About this space</span>
              <h2>Useful detail before you visit</h2>
              <p className="detail-description">{listing.description || "The poster has not added a description yet."}</p>
              {listing.color && <p className="exterior-note"><strong>Exterior note:</strong> {listing.color}</p>}
            </article>

            <article className="detail-block terms-block">
              <span className="section-kicker">Terms upfront</span>
              <h2>Cost and responsibility</h2>
              <dl className="terms-list">
                <div><dt>Maintenance</dt><dd>{maintenanceLabel(listing.maintenance_policy)}</dd></div>
                <div><dt>Deposit</dt><dd>{listing.deposit_months === 0 ? "Not applicable to this sale" : `${listing.deposit_months} month${listing.deposit_months === 1 ? "" : "s"}`}</dd></div>
                <div><dt>Poster</dt><dd>{listing.poster.role === "agent" ? "Agent listing" : "Landlord listing"}</dd></div>
                {listing.poster.role === "agent" && <div><dt>Agent commission</dt><dd>{commissionLabel(commission)}{commission?.note ? ` · ${commission.note}` : ""}</dd></div>}
              </dl>
            </article>

            <article className="detail-block">
              <span className="section-kicker">Amenities</span>
              <h2>What the listing includes</h2>
              <ul className="amenities-grid">
                {listing.amenities.map((amenity) => <li key={amenity}><Icon name="check" size={16} /> {amenityLabels.get(amenity as never) ?? amenity.replaceAll("_", " ")}</li>)}
              </ul>
            </article>

            <article className="detail-block address-block">
              <div><span className="section-kicker">Area and addressing</span><h2>{listing.area}, Greater Accra</h2><p>Use the area and Digital Address to confirm the meeting point directly with the poster before travelling.</p></div>
              <div className="address-code"><span>GhanaPost Digital Address</span><strong>{listing.digital_address ?? "Not supplied"}</strong>{isSample && <small>Sample-data address for development only</small>}</div>
            </article>

            <article className="inline-safety">
              <span><Icon name="shield" size={25} /></span>
              <div><h2>Before you pay anything</h2><p>Never pay a viewing fee. Verify the poster’s identity and right to rent or sell the property, inspect in person, and confirm every term in writing before a deposit.</p></div>
            </article>
          </div>
          <div className="detail-sidebar">
            <ListingActions listing={listing} source={source} signedIn={Boolean(session)} />
            <div className="poster-card">
              <span className="poster-avatar">{listing.poster.name?.charAt(0) ?? "A"}</span>
              <div><small>Posted by</small><strong>{listing.poster.name ?? "Property poster"}</strong><span>{listing.poster.role === "agent" ? "Agent account" : "Landlord account"}</span></div>
              <p><Icon name="info" size={14} /> Account type is not identity verification.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
