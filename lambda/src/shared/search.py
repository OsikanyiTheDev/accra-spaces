"""DynamoDB query construction for listing search (v1).

v1 search strategy (deliberately simple, cheap and serverless):
- "newest" (default): status-index on PUBLISHED, ordered by updated_at desc.
- "price_asc" / "price_desc": browse-index on {TYPE}#{MODE} ordered by price.
Remaining criteria (area, beds, price range) are applied with an
ExpressionAttributeValues filter on the query result. This is fine for MVP
density; swap in a dedicated search engine without changing the API contract.

None of the filter attributes are DynamoDB reserved words, so plain
attribute names are used without ExpressionAttributeNames.
"""

import base64
import json
from typing import Any


def encode_cursor(last_key: dict[str, Any] | None) -> str | None:
    if not last_key:
        return None
    return base64.urlsafe_b64encode(json.dumps(last_key, sort_keys=True).encode()).decode()


def decode_cursor(cursor: str | None) -> dict[str, Any] | None:
    if not cursor:
        return None
    try:
        return json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())
    except Exception:
        return None


def build_browse_query(clean: dict[str, Any]) -> dict[str, Any]:
    """Return DynamoDB query kwargs for the given validated search params."""
    sort = clean.get("sort", "newest")
    limit = clean.get("limit", 24)

    filters: list[str] = []
    values: dict[str, Any] = {}

    def add_filter(field: str, op: str, value: Any):
        filters.append(f"{field} {op} :{field}")
        values[f":{field}"] = value

    if clean.get("area"):
        add_filter("area", "=", clean["area"])
    if clean.get("beds") is not None:
        add_filter("beds", ">=", clean["beds"])
    if clean.get("min_price") is not None:
        add_filter("price_ghs", ">=", clean["min_price"])
    if clean.get("max_price") is not None:
        add_filter("price_ghs", "<=", clean["max_price"])
    if clean.get("type"):
        add_filter("type", "=", clean["type"])
    if clean.get("mode"):
        add_filter("sale_mode", "=", clean["mode"])

    query: dict[str, Any] = {
        "Limit": limit,
        "ScanIndexForward": sort == "price_asc",
        "ExpressionAttributeValues": values,
        "ExpressionAttributeNames": {},
    }

    if sort in ("price_asc", "price_desc") and clean.get("type") and clean.get("mode"):
        query["IndexName"] = "browse-index"
        query["KeyConditionExpression"] = "GSI1PK = :gpk"
        values[":gpk"] = f"{clean['type'].upper()}#{clean['mode'].upper()}"
    else:
        query["IndexName"] = "status-index"
        query["KeyConditionExpression"] = "GSI2PK = :gpk"
        values[":gpk"] = "PUBLISHED"
        query["ScanIndexForward"] = False

    if filters:
        query["FilterExpression"] = " AND ".join(filters)

    exclusive = decode_cursor(clean.get("cursor"))
    if exclusive:
        query["ExclusiveStartKey"] = exclusive

    return query
