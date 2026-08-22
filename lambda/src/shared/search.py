"""DynamoDB query construction for listing search (v1).

The serverless search path deliberately uses inexpensive DynamoDB indexes:
- newest: ``status-index`` (PUBLISHED, ordered by updated_at)
- price with type + mode: ``browse-index`` (e.g. APARTMENT#RENT, by price)
- broad price sorting: ``price-index`` (PUBLISHED, by price)

Area, beds and any remaining criteria are filter expressions. Attribute name
placeholders are used because words such as ``type`` and ``status`` can be
reserved by DynamoDB. This is suitable for MVP density; the public API
contract can stay stable if a dedicated search service is justified later.
"""

import base64
import json
from typing import Any


FILTER_NAMES = {
    "area": "#area",
    "beds": "#beds",
    "price_ghs": "#price",
    "type": "#type",
    "sale_mode": "#mode",
}


def encode_cursor(last_key: dict[str, Any] | None) -> str | None:
    if not last_key:
        return None
    return base64.urlsafe_b64encode(json.dumps(last_key, sort_keys=True).encode()).decode()


def decode_cursor(cursor: str | None) -> dict[str, Any] | None:
    if not cursor:
        return None
    try:
        decoded = json.loads(base64.urlsafe_b64decode(cursor.encode()).decode())
        return decoded if isinstance(decoded, dict) else None
    except Exception:
        return None


def build_browse_query(clean: dict[str, Any]) -> dict[str, Any]:
    """Return DynamoDB query kwargs for validated search parameters."""
    sort = clean.get("sort", "newest")
    limit = clean.get("limit", 24)

    filters: list[str] = []
    values: dict[str, Any] = {}
    names: dict[str, str] = {}

    def add_filter(field: str, op: str, value: Any):
        placeholder = FILTER_NAMES[field]
        filters.append(f"{placeholder} {op} :{field}")
        names[placeholder] = field
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
        "ExpressionAttributeValues": values,
    }

    price_sort = sort in ("price_asc", "price_desc")
    if price_sort and clean.get("type") and clean.get("mode"):
        query["IndexName"] = "browse-index"
        query["KeyConditionExpression"] = "GSI1PK = :gpk"
        values[":gpk"] = f"{clean['type'].upper()}#{clean['mode'].upper()}"
        # The key condition already enforces these, so do not filter twice.
        filters = [f for f in filters if not f.startswith(("#type ", "#mode "))]
        names.pop("#type", None)
        names.pop("#mode", None)
    elif price_sort:
        query["IndexName"] = "price-index"
        query["KeyConditionExpression"] = "GSI3PK = :gpk"
        values[":gpk"] = "PUBLISHED"
    else:
        query["IndexName"] = "status-index"
        query["KeyConditionExpression"] = "GSI2PK = :gpk"
        values[":gpk"] = "PUBLISHED"

    query["ScanIndexForward"] = sort == "price_asc" if price_sort else False

    if filters:
        query["FilterExpression"] = " AND ".join(filters)
    if names:
        query["ExpressionAttributeNames"] = names

    exclusive = decode_cursor(clean.get("cursor"))
    if exclusive:
        query["ExclusiveStartKey"] = exclusive

    return query
