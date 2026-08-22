"""DELETE /me/favorites/{id} — remove a saved listing (JWT)."""

import os

from shared import authz, http
from shared.repository import ListingsRepository, FAV_SK


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    listing_id = http.path_parameter(event, "id")
    if not sub or not listing_id:
        return http.unauthorized()

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    repo.delete_user_item(sub, FAV_SK.format(listing_id=listing_id))
    return http.ok({"listing_id": listing_id, "saved": False})
