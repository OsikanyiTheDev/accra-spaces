"""GET /listings — public filtered search over published listings."""

import os

from shared import http
from shared.presenters import summary
from shared.repository import ListingsRepository
from shared.search import build_browse_query, encode_cursor
from shared.validation import validate_search_params


def lambda_handler(event, context):
    clean, errors = validate_search_params(http.query_parameters(event))
    if errors:
        return http.bad_request(errors)

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    result = repo.query_items(**build_browse_query(clean))

    items = [
        item
        for item in result.get("Items", [])
        if item.get("SK") == "METADATA" and item.get("status") == "published"
    ]
    return http.ok(
        {
            "listings": [summary(item) for item in items],
            "count": len(items),
            "next_cursor": encode_cursor(result.get("LastEvaluatedKey")),
        }
    )
