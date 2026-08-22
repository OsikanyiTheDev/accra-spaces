"""GET /listings/{id} — public detail for a published listing."""

import os

from shared import http
from shared.presenters import detail
from shared.repository import ListingsRepository


def lambda_handler(event, context):
    listing_id = http.path_parameter(event, "id")
    if not listing_id:
        return http.bad_request(["missing listing id"])

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item or item.get("status") != "published":
        return http.not_found()

    return http.ok({"listing": detail(item)})
