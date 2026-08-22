import { Icon } from "@/components/icons";
import { PropertyVisual } from "@/components/property-visual";
import type { ListingDetail } from "@/lib/types";

export function DetailGallery({ listing }: { listing: ListingDetail }) {
  return (
    <div className="detail-gallery">
      <div className="gallery-panel gallery-day">
        <PropertyVisual listing={listing} imageUrl={listing.day_photo_urls?.[0] ?? listing.cover_url} label={`Day view of ${listing.title}`} priority />
        <span className="gallery-label"><Icon name="sun" size={16} /> Day view</span>
      </div>
      <div className="gallery-panel gallery-night">
        <PropertyVisual listing={listing} imageUrl={listing.night_photo_urls?.[0]} night label={`Night view of ${listing.title}`} />
        <span className="gallery-label"><Icon name="moon" size={15} /> Night view</span>
      </div>
    </div>
  );
}
