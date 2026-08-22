"""PATCH /admin/listings/{id}/status — moderation (AWS IAM authorized).

The API Gateway route is AWS_IAM-only, so the handler simply applies the
status change: publish, disable or mark sold.
"""

import os

from shared import http
from shared.constants import ADMIN_SETTABLE_STATUSES, STATUSES
from shared.repository import ListingsRepository, now_iso


def lambda_handler(event, context):
    listing_id = http.path_parameter(event, "id")
    if not listing_id:
        return http.bad_request(["missing listing id"])

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    status = payload.get("status")
    if status not in STATUSES or status not in ADMIN_SETTABLE_STATUSES:
        return http.bad_request([f"status must be one of: {', '.join(ADMIN_SETTABLE_STATUSES)}"])

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item:
        return http.not_found()

    timestamp = now_iso()
    repo.update_listing(listing_id, {
        "status": status,
        "GSI2PK": status.upper(),
        "GSI2SK": timestamp,
        "updated_at": timestamp,
    })
    return http.ok({"id": listing_id, "status": status})
