"""DynamoDB repository for listings, interactions and user data.

boto3 is imported lazily so this module (and its pure helpers) can be unit
tested without the SDK or an AWS connection.
"""

import datetime
import uuid
from typing import Any

LISTING_PK = "LISTING#{id}"
USER_PK = "USER#{sub}"
FAV_SK = "FAV#{listing_id}"
SEARCH_SK = "SEARCH#{search_id}"
REQUEST_SK = "REQ#{request_id}"
PROFILE_SK = "PROFILE"


def now_iso() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def new_id(prefix: str) -> str:
    return f"{prefix}{uuid.uuid4().hex}"


class ListingsRepository:
    """Thin wrapper around a DynamoDB table (real or injected fake)."""

    def __init__(self, table_name: str, table: Any = None):
        self.table_name = table_name
        if table is None:
            import boto3  # local import: Lambda runtime provides boto3

            self._table = boto3.resource("dynamodb").Table(table_name)
        else:
            self._table = table

    # --- listings ---

    def get_listing(self, listing_id: str) -> dict[str, Any] | None:
        result = self._table.get_item(Key={"PK": LISTING_PK.format(id=listing_id), "SK": "METADATA"})
        return result.get("Item")

    def put_listing(self, item: dict[str, Any]) -> dict[str, Any]:
        """Persist a listing item. Caller must provide the full item."""
        self._table.put_item(Item=item)
        return item

    def query_items(self, **kwargs) -> dict[str, Any]:
        return self._table.query(**kwargs)

    def update_listing(self, listing_id: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        """Apply attribute updates to a listing's metadata. Returns the item."""
        if not updates:
            return self.get_listing(listing_id)
        expression = ", ".join(f"#{key} = :{key}" for key in updates)
        names = {f"#{key}": key for key in updates}
        values = {f":{key}": value for key, value in updates.items()}
        self._table.update_item(
            Key={"PK": LISTING_PK.format(id=listing_id), "SK": "METADATA"},
            UpdateExpression=f"SET {expression}",
            ExpressionAttributeNames=names,
            ExpressionAttributeValues=values,
            ReturnValues="ALL_NEW",
        )
        return self.get_listing(listing_id)

    # --- children (viewing requests, offers) ---

    def put_child(self, listing_id: str, sk: str, item: dict[str, Any]) -> None:
        item["PK"] = LISTING_PK.format(id=listing_id)
        item["SK"] = sk
        self._table.put_item(Item=item)

    # --- user items (favorites, saved searches) ---

    def put_user_item(self, sub: str, sk: str, item: dict[str, Any]) -> None:
        item["PK"] = USER_PK.format(sub=sub)
        item["SK"] = sk
        self._table.put_item(Item=item)

    def get_user_item(self, sub: str, sk: str) -> dict[str, Any] | None:
        result = self._table.get_item(Key={"PK": USER_PK.format(sub=sub), "SK": sk})
        return result.get("Item")

    def delete_user_item(self, sub: str, sk: str) -> None:
        self._table.delete_item(Key={"PK": USER_PK.format(sub=sub), "SK": sk})

    def query_user_items(self, sub: str, sk_prefix: str) -> list[dict[str, Any]]:
        result = self._table.query(
            KeyConditionExpression="PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues={":pk": USER_PK.format(sub=sub), ":sk": sk_prefix},
        )
        return result.get("Items", [])

    def claim_user_role(self, sub: str, role: str) -> bool:
        """Atomically persist a user's one-time self-declared posting role."""
        try:
            self._table.put_item(
                Item={
                    "PK": USER_PK.format(sub=sub),
                    "SK": PROFILE_SK,
                    "kind": "user_profile",
                    "role": role,
                    "role_selected_at": now_iso(),
                },
                ConditionExpression="attribute_not_exists(PK)",
            )
            return True
        except Exception as exc:
            code = getattr(exc, "response", {}).get("Error", {}).get("Code")
            if code == "ConditionalCheckFailedException":
                return False
            raise

    def rollback_user_role(self, sub: str) -> None:
        self.delete_user_item(sub, PROFILE_SK)

    # --- reports ---

    def put_report(self, item: dict[str, Any]) -> None:
        self._table.put_item(Item=item)
