"""POST /me/favorites/{id} — save a listing (JWT)."""

import os

from shared import authz, http
from shared.repository import ListingsRepository, FAV_SK, now_iso


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    listing_id = http.path_parameter(event, "id")
    if not sub or not listing_id:
        return http.unauthorized()

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item or item.get("status") != "published":
        return http.not_found()

    repo.put_user_item(sub, FAV_SK.format(listing_id=listing_id), {
        "kind": "favorite",
        "listing_id": listing_id,
        "created_at": now_iso(),
    })
    return http.created({"listing_id": listing_id, "saved": True})
