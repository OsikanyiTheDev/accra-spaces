"""POST /listings/{id}/viewing-requests — structured viewing request (JWT).

Requires sign-in so queue spam and ghosting are reduced, while keeping the
flow to a single form. The poster sees the request with contact details.
"""

import os

from shared import authz, http
from shared.repository import ListingsRepository, new_id, now_iso
from shared.validation import validate_viewing_request


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    listing_id = http.path_parameter(event, "id")
    if not sub or not listing_id:
        return http.unauthorized()

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_viewing_request(payload)
    if errors:
        return http.bad_request(errors)

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item or item.get("status") != "published":
        return http.not_found()

    request_id = new_id("vrq_")
    repo.put_child(
        listing_id,
        f"REQ#{request_id}",
        {
            "kind": "viewing_request",
            "request_id": request_id,
            "listing_id": listing_id,
            "seeker_sub": sub,
            "contact_name": clean["contact_name"],
            "whatsapp": clean.get("whatsapp"),
            "date_time": clean["date_time"],
            "note": clean.get("note", ""),
            "status": "new",
            "created_at": now_iso(),
        },
    )
    return http.created({"request_id": request_id, "status": "new"})
