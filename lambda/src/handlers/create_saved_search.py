"""POST /me/saved-searches — save search criteria for future alerts (JWT).

Alerts/notifications are v2; the criteria are stored now so the feature can
be added without changing how searches are represented.
"""

import os

from shared import authz, http
from shared.repository import ListingsRepository, SEARCH_SK, new_id, now_iso
from shared.validation import validate_saved_search


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    if not sub:
        return http.unauthorized()

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_saved_search(payload)
    if errors:
        return http.bad_request(errors)
    if not any(k in clean for k in ("area", "type", "mode", "min_price", "max_price", "beds")):
        return http.bad_request(["provide at least one search criterion"])

    search_id = new_id("sea_")
    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    repo.put_user_item(sub, SEARCH_SK.format(search_id=search_id), {
        "kind": "saved_search",
        "search_id": search_id,
        "criteria": {k: v for k, v in clean.items() if k != "sort"},
        "created_at": now_iso(),
    })
    return http.created({"search_id": search_id})
