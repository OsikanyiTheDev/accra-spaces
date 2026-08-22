"""Canonical constants for the Accra Spaces API.

The Greater Accra area list is provisional: it is a curated starting set so
filters stay meaningful. It is intentionally centralised so it can be
reviewed and extended in one place.
"""

import re

# --- Greater Accra areas (provisional canonical list) ---
AREAS = [
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
]

PROPERTY_TYPES = ["apartment", "house", "shop", "office"]
SALE_MODES = ["rent", "sale"]
MAINTENANCE_POLICIES = ["landlord_annual", "tenant_deduct", "included"]
COMMISSION_TYPES = ["one_month_rent", "percentage", "flat_fee", "none"]

AMENITIES = [
    "parking",
    "air_conditioning",
    "generator",
    "security",
    "water_heater",
    "water_tank",
    "fenced",
    "built_in_wardrobe",
    "gym",
    "swimming_pool",
    "elevator",
    "backup_power",
]

STATUSES = ["draft", "pending", "published", "disabled", "sold"]
PUBLIC_STATUSES = ["published"]
OWNER_SETTABLE_STATUSES = ["draft", "published"]
ADMIN_SETTABLE_STATUSES = ["published", "disabled", "sold"]

REPORT_REASONS = ["inaccurate", "misleading_photos", "duplicate", "scam_suspicion", "other"]

MIN_PRICE_GHS = 1
MAX_PRICE_GHS = 100_000_000
MAX_PHOTO_BYTES = 5 * 1024 * 1024
PHOTO_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"]
PHOTO_KINDS = ["day", "night"]

DIGITAL_ADDRESS_RE = re.compile(r"^[A-Za-z]{2}-\d{3}-\d{4,5}$")
WHATSAPP_RE = re.compile(r"^\+?[0-9]{9,15}$")

AREA_LOOKUP = {a.lower(): a for a in AREAS}


def canonical_area(value: str) -> str | None:
    """Return the canonical casing for an area, or None if unknown."""
    return AREA_LOOKUP.get(value.strip().lower())
