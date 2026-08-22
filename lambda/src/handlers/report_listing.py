"""POST /listings/{id}/report — report a listing (public, throttled)."""

import os

from shared import http
from shared.repository import ListingsRepository, new_id, now_iso
from shared.validation import validate_report


def lambda_handler(event, context):
    listing_id = http.path_parameter(event, "id")
    if not listing_id:
        return http.bad_request(["missing listing id"])

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_report(payload)
    if clean.get("honeypot"):
        return http.ok({"received": True})  # silently drop bot submissions
    if errors:
        return http.bad_request(errors)

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item:
        return http.not_found()

    report_id = new_id("rep_")
    repo.put_report({
        "PK": f"REPORT#{report_id}",
        "SK": "META",
        "report_id": report_id,
        "listing_id": listing_id,
        "reason": clean["reason"],
        "detail": clean.get("detail", ""),
        "status": "open",
        "created_at": now_iso(),
    })
    return http.created({"report_id": report_id, "status": "open"})
