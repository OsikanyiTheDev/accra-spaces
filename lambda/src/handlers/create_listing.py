"""POST /listings — create a listing (Landlord or Agent, JWT)."""

import os

from shared import authz, http
from shared.repository import ListingsRepository, new_id, now_iso
from shared.validation import validate_listing_payload


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    groups = authz.caller_groups(event)
    if not sub or not any(g in groups for g in ("Landlord", "Agent")):
        return http.forbidden()

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_listing_payload(payload)
    if errors:
        return http.bad_request(errors)

    listing_id = new_id("lst_")
    timestamp = now_iso()
    poster = clean["poster"]
    poster["sub"] = sub

    item = {
        "PK": f"LISTING#{listing_id}",
        "SK": "METADATA",
        "listing_id": listing_id,
        "title": clean["title"],
        "type": clean["type"],
        "sale_mode": clean["sale_mode"],
        "price_ghs": clean["price_ghs"],
        "negotiable": clean.get("negotiable", False),
        "area": clean["area"],
        "digital_address": clean.get("digital_address"),
        "deposit_months": clean["deposit_months"],
        "maintenance_policy": clean["maintenance_policy"],
        "beds": clean.get("beds", 0),
        "baths": clean.get("baths", 0),
        "size_m2": clean.get("size_m2"),
        "description": clean.get("description", ""),
        "color": clean.get("color"),
        "amenities": clean.get("amenities", []),
        "day_photos": clean.get("day_photos", []),
        "night_photos": clean.get("night_photos", []),
        "poster": poster,
        "owner_sub": sub,
        "status": "draft",
        "created_at": timestamp,
        "updated_at": timestamp,
        "GSI1PK": f"{clean['type'].upper()}#{clean['sale_mode'].upper()}",
        "GSI1SK": clean["price_ghs"],
        "GSI2PK": "DRAFT",
        "GSI2SK": timestamp,
    }

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    repo.put_listing(item)

    return http.created({"id": listing_id, "status": "draft", "message": "Draft created. Publish when ready."})
