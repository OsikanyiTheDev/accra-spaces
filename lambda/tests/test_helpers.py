import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.completeness import compute_completeness  # noqa: E402
from shared.numbers import format_ghs, mask_phone  # noqa: E402
from shared.repository import FAV_SK, SEARCH_SK, ListingsRepository  # noqa: E402
from shared.search import build_browse_query, decode_cursor, encode_cursor  # noqa: E402
from shared.validation import validate_search_params  # noqa: E402


class CompletenessTests(unittest.TestCase):
    def test_none_is_basic(self):
        result = compute_completeness({})
        self.assertEqual(result["level"], "basic")
        self.assertEqual(result["score"], 0)

    def test_day_and_night_only_is_basic(self):
        # One factual check present (day+night photos) → basic, not "good".
        result = compute_completeness({"day_photos": ["a"], "night_photos": ["b"]})
        self.assertEqual(result["level"], "basic")
        self.assertEqual(result["score"], 1)

    def test_all_three_is_complete(self):
        result = compute_completeness(
            {"day_photos": ["a"], "night_photos": ["b"], "digital_address": "GA-1-1", "maintenance_policy": "included"}
        )
        self.assertEqual(result["level"], "complete")
        self.assertEqual(result["score"], 3)


class NumberTests(unittest.TestCase):
    def test_mask_phone_keeps_country_code(self):
        self.assertEqual(mask_phone("+233241234567"), "+233 ** *** 4567")
        self.assertIsNone(mask_phone(None))

    def test_format_ghs(self):
        self.assertEqual(format_ghs(3500), "GH₵ 3,500")
        self.assertIsNone(format_ghs(None))


class SearchQueryTests(unittest.TestCase):
    def test_newest_uses_status_index(self):
        clean, errors = validate_search_params({"sort": "newest", "area": "Osu", "beds": "2"})
        self.assertEqual(errors, [])
        query = build_browse_query(clean)
        self.assertEqual(query["IndexName"], "status-index")
        self.assertFalse(query["ScanIndexForward"])
        self.assertIn("area = :area", query["FilterExpression"])

    def test_price_asc_with_type_uses_browse_index(self):
        clean, _ = validate_search_params({"sort": "price_asc", "type": "apartment", "mode": "rent"})
        query = build_browse_query(clean)
        self.assertEqual(query["IndexName"], "browse-index")
        self.assertEqual(query["KeyConditionExpression"], "GSI1PK = :gpk")
        self.assertEqual(query["ExpressionAttributeValues"][":gpk"], "APARTMENT#RENT")
        self.assertTrue(query["ScanIndexForward"])

    def test_cursor_roundtrip(self):
        cursor = encode_cursor({"PK": "LISTING#x", "SK": "METADATA"})
        decoded = decode_cursor(cursor)
        self.assertEqual(decoded["PK"], "LISTING#x")

    def test_garbage_cursor_is_none(self):
        self.assertIsNone(decode_cursor("!!!not-base64!!!"))


class FakeTable:
    """Minimal in-memory DynamoDB double for repository tests."""

    def __init__(self):
        self.items: dict[tuple[str, str], dict] = {}

    def put_item(self, Item):
        self.items[(Item["PK"], Item["SK"])] = dict(Item)

    def get_item(self, Key):
        return {"Item": self.items.get((Key["PK"], Key["SK"]))}

    def delete_item(self, Key):
        self.items.pop((Key["PK"], Key["SK"]), None)

    def query(self, KeyConditionExpression, ExpressionAttributeValues, **rest):
        pk = ExpressionAttributeValues[":pk"]
        prefix = ExpressionAttributeValues.get(":sk", "")
        items = [
            item for (p, s), item in self.items.items()
            if p == pk and (not prefix or s.startswith(prefix))
        ]
        return {"Items": items}

    def update_item(self, Key, UpdateExpression, ExpressionAttributeNames, ExpressionAttributeValues, ReturnValues=None):
        key = (Key["PK"], Key["SK"])
        if key not in self.items:
            raise KeyError(key)
        item = dict(self.items[key])
        if UpdateExpression.startswith("SET "):
            for clause in UpdateExpression[4:].split(", "):
                name_token, value_token = clause.split(" = ", 1)
                name = ExpressionAttributeNames.get(name_token, name_token)
                item[name] = ExpressionAttributeValues.get(value_token)
        self.items[key] = item
        return {"Attributes": dict(item)}


class RepositoryTests(unittest.TestCase):
    def setUp(self):
        self.fake = FakeTable()
        self.repo = ListingsRepository("test-table", table=self.fake)

    def test_put_and_get_listing(self):
        item = {"PK": "LISTING#lst_1", "SK": "METADATA", "listing_id": "lst_1", "status": "draft"}
        self.repo.put_listing(item)
        self.assertEqual(self.repo.get_listing("lst_1")["status"], "draft")

    def test_update_listing_applies_fields(self):
        item = {"PK": "LISTING#lst_1", "SK": "METADATA", "listing_id": "lst_1", "price_ghs": 3000}
        self.repo.put_listing(item)
        updated = self.repo.update_listing("lst_1", {"price_ghs": 4200, "status": "published"})
        self.assertEqual(updated["price_ghs"], 4200)
        self.assertEqual(updated["status"], "published")

    def test_favorites_prefix_query(self):
        self.repo.put_user_item("sub-1", FAV_SK.format(listing_id="a"), {"kind": "favorite"})
        self.repo.put_user_item("sub-1", FAV_SK.format(listing_id="b"), {"kind": "favorite"})
        self.repo.put_user_item("sub-1", SEARCH_SK.format(search_id="s1"), {"kind": "saved_search"})
        favorites = self.repo.query_user_items("sub-1", "FAV#")
        self.assertEqual(len(favorites), 2)
        searches = self.repo.query_user_items("sub-1", "SEARCH#")
        self.assertEqual(len(searches), 1)


if __name__ == "__main__":
    unittest.main()
