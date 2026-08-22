"""DELETE /me/saved-searches/{id} — remove a saved search (JWT)."""

import os

from shared import authz, http
from shared.repository import ListingsRepository, SEARCH_SK


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    search_id = http.path_parameter(event, "id")
    if not sub or not search_id:
        return http.unauthorized()

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    repo.delete_user_item(sub, SEARCH_SK.format(search_id=search_id))
    return http.ok({"search_id": search_id, "deleted": True})
