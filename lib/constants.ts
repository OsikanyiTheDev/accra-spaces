export const AREAS = [
  "Osu",
  "East Legon",
  "East Legon Hills",
  "North Legon",
  "Labone",
  "Cantonments",
  "Airport Residential",
  "Spintex",
  "Tema",
  "Community 25",
  "Ashaiman",
  "Madina",
  "Adenta",
  "Kwabenya",
  "Dome",
  "Achimota",
  "Legon",
  "Dansoman",
  "Kaneshie",
  "Sakumono",
  "Teshie",
  "Nungua",
  "Lashibi",
  "Mataheko",
] as const;

export const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment" },
  { value: "house", label: "House" },
  { value: "shop", label: "Store / Shop" },
  { value: "office", label: "Office" },
] as const;

export const AMENITIES = [
  ["parking", "Parking"],
  ["air_conditioning", "Air conditioning"],
  ["generator", "Generator"],
  ["security", "Security"],
  ["water_heater", "Water heater"],
  ["water_tank", "Water tank"],
  ["fenced", "Fenced compound"],
  ["built_in_wardrobe", "Built-in wardrobe"],
  ["gym", "Gym"],
  ["swimming_pool", "Swimming pool"],
  ["elevator", "Elevator"],
  ["backup_power", "Backup power"],
] as const;

export const MAINTENANCE_LABELS: Record<string, string> = {
  landlord_annual: "Landlord handles annual maintenance",
  tenant_deduct: "Tenant handles and deducts later",
  included: "Maintenance included",
};

export const COMMISSION_LABELS: Record<string, string> = {
  one_month_rent: "One month’s rent",
  percentage: "Percentage",
  flat_fee: "Flat fee",
  none: "No commission",
};
