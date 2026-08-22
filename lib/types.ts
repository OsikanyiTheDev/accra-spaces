export type PropertyType = "apartment" | "house" | "shop" | "office";
export type SaleMode = "rent" | "sale";
export type ResultSource = "api" | "demo" | "unavailable";

export interface CompletenessCheck {
  key: string;
  label: string;
  complete: boolean;
}

export interface Completeness {
  score: number;
  level: "basic" | "good" | "complete";
  checks: CompletenessCheck[];
}

export interface Commission {
  type: "one_month_rent" | "percentage" | "flat_fee" | "none";
  value?: number;
  note?: string;
}

export interface Poster {
  name?: string;
  role?: "landlord" | "agent";
  whatsapp?: string;
  phone?: string;
  agent_commission?: Commission;
}

export interface ListingSummary {
  id: string;
  title: string;
  type: PropertyType;
  sale_mode: SaleMode;
  price_ghs: number;
  negotiable: boolean;
  area: string;
  beds: number;
  baths: number;
  size_m2?: number;
  deposit_months: number;
  maintenance_policy: string;
  status: string;
  updated_at: string;
  created_at: string;
  completeness: Completeness;
  cover_key?: string | null;
  cover_url?: string;
  poster: Poster;
  is_demo?: boolean;
  visual?: "courtyard" | "storefront" | "villa" | "office" | "tower" | "townhouse";
}

export interface ListingDetail extends ListingSummary {
  digital_address?: string;
  description?: string;
  color?: string;
  amenities: string[];
  day_photos: string[];
  night_photos: string[];
  day_photo_urls?: string[];
  night_photo_urls?: string[];
}

export interface SearchParams {
  area?: string;
  type?: string;
  mode?: string;
  min_price?: string;
  max_price?: string;
  beds?: string;
  sort?: string;
  cursor?: string;
}

export interface ListingResult {
  listings: ListingSummary[];
  count: number;
  next_cursor: string | null;
  source: ResultSource;
  message?: string;
}
