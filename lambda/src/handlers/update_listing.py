"""PATCH /listings/{id} — update own listing (owner or Admin, JWT)."""

import os

from shared import authz, http
from shared.constants import ADMIN_SETTABLE_STATUSES, OWNER_SETTABLE_STATUSES, STATUSES
from shared.repository import ListingsRepository, now_iso
from shared.validation import validate_listing_payload


def lambda_handler(event, context):
    listing_id = http.path_parameter(event, "id")
    sub = authz.caller_sub(event)
    is_admin = authz.is_admin(event)
    if not listing_id or not sub:
        return http.unauthorized()

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item:
        return http.not_found()
    if item.get("owner_sub") != sub and not is_admin:
        return http.forbidden()

    requested_status = payload.get("status")
    if requested_status is not None:
        allowed = ADMIN_SETTABLE_STATUSES if is_admin else OWNER_SETTABLE_STATUSES
        if requested_status not in allowed or requested_status not in STATUSES:
            return http.bad_request([f"status must be one of: {', '.join(allowed)}"])
        if item.get("status") in ("disabled", "sold") and requested_status != "published" and not is_admin:
            return http.forbidden()

    payload["partial"] = True
    clean, errors = validate_listing_payload(payload)
    if errors:
        return http.bad_request(errors)

    timestamp = now_iso()
    updates: dict = {}
    for field in ("title", "type", "sale_mode", "price_ghs", "negotiable", "area",
                  "digital_address", "deposit_months", "maintenance_policy", "beds",
                  "baths", "size_m2", "description", "color", "amenities",
                  "day_photos", "night_photos", "poster"):
        if field in clean:
            updates[field] = clean[field]
    if requested_status is not None:
        updates["status"] = requested_status
    updates["updated_at"] = timestamp

    if "type" in updates or "sale_mode" in updates or "price_ghs" in updates:
        prop_type = updates.get("type", item.get("type"))
        mode = updates.get("sale_mode", item.get("sale_mode"))
        price = updates.get("price_ghs", item.get("price_ghs"))
        updates["GSI1PK"] = f"{prop_type.upper()}#{mode.upper()}"
        updates["GSI1SK"] = price
    if "status" in updates:
        updates["GSI2PK"] = updates["status"].upper()
        updates["GSI2SK"] = timestamp

    updated = repo.update_listing(listing_id, updates)
    return http.ok({"id": listing_id, "status": updated.get("status") if updated else None})
