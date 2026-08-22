"""GET /me/saved-searches — saved search criteria (JWT)."""

import os

from shared import authz, http
from shared.repository import ListingsRepository, SEARCH_SK


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    if not sub:
        return http.unauthorized()

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    searches = repo.query_user_items(sub, SEARCH_SK.split("#")[0] + "#")
    searches.sort(key=lambda i: i.get("created_at", ""), reverse=True)
    return http.ok({"saved_searches": searches, "count": len(searches)})
