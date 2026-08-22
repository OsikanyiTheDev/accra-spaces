"""GET /me/favorites — saved listings with public summaries (JWT)."""

import os

from shared import authz, http
from shared.presenters import summary
from shared.repository import ListingsRepository, FAV_SK


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    if not sub:
        return http.unauthorized()

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    favorites = repo.query_user_items(sub, FAV_SK.split("#")[0] + "#")
    favorites.sort(key=lambda i: i.get("created_at", ""), reverse=True)

    listings = []
    for fav in favorites:
        item = repo.get_listing(fav["listing_id"])
        if item and item.get("status") == "published":
            listings.append(summary(item))

    return http.ok({"favorites": listings, "count": len(listings)})
