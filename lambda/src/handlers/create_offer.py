"""POST /listings/{id}/offers — make a GHS offer (JWT)."""

import os

from shared import authz, http
from shared.repository import ListingsRepository, new_id, now_iso
from shared.validation import validate_offer


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    listing_id = http.path_parameter(event, "id")
    if not sub or not listing_id:
        return http.unauthorized()

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_offer(payload)
    if errors:
        return http.bad_request(errors)

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item or item.get("status") != "published":
        return http.not_found()

    offer_id = new_id("ofr_")
    repo.put_child(
        listing_id,
        f"REQ#{offer_id}",
        {
            "kind": "offer",
            "request_id": offer_id,
            "listing_id": listing_id,
            "seeker_sub": sub,
            "contact_name": clean["contact_name"],
            "whatsapp": clean.get("whatsapp"),
            "amount_ghs": clean["amount_ghs"],
            "note": clean.get("note", ""),
            "status": "new",
            "created_at": now_iso(),
        },
    )
    return http.created({"offer_id": offer_id, "status": "new"})
