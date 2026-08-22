import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared import validation as v  # noqa: E402


def base_listing():
    return {
        "title": "Sunny 2-bed near the mall",
        "type": "apartment",
        "sale_mode": "rent",
        "price_ghs": 3500,
        "negotiable": True,
        "area": "osu",
        "digital_address": "GA-123-4567",
        "deposit_months": 2,
        "maintenance_policy": "landlord_annual",
        "beds": 2,
        "baths": 2,
        "size_m2": 95,
        "description": "Quiet compound with parking.",
        "amenities": ["parking", "generator"],
        "poster": {
            "name": "Ama Mensah",
            "role": "landlord",
            "whatsapp": "+233241234567",
            "phone": "+233241234567",
        },
    }


class ListingValidationTests(unittest.TestCase):
    def test_valid_listing_passes(self):
        clean, errors = v.validate_listing_payload(base_listing())
        self.assertEqual(errors, [])
        self.assertEqual(clean["area"], "Osu")  # canonical casing

    def test_unknown_area_rejected(self):
        payload = base_listing()
        payload["area"] = "Timbuktu"
        _, errors = v.validate_listing_payload(payload)
        self.assertTrue(any("area" in e for e in errors))

    def test_bad_digital_address_rejected(self):
        payload = base_listing()
        payload["digital_address"] = "not-an-address"
        _, errors = v.validate_listing_payload(payload)
        self.assertTrue(any("digital_address" in e for e in errors))

    def test_price_range_enforced(self):
        payload = base_listing()
        payload["price_ghs"] = 0
        _, errors = v.validate_listing_payload(payload)
        self.assertTrue(any("price_ghs" in e for e in errors))

    def test_agent_requires_commission(self):
        payload = base_listing()
        payload["poster"] = {"name": "Kofi", "role": "agent", "whatsapp": "+233200000000"}
        _, errors = v.validate_listing_payload(payload)
        self.assertTrue(any("commission" in e for e in errors))

    def test_agent_with_commission_passes(self):
        payload = base_listing()
        payload["poster"] = {
            "name": "Kofi",
            "role": "agent",
            "whatsapp": "+233200000000",
            "commission": {"type": "percentage", "value": 10, "note": "10% on completion"},
        }
        clean, errors = v.validate_listing_payload(payload)
        self.assertEqual(errors, [])
        self.assertEqual(clean["poster"]["commission"]["value"], 10)

    def test_unknown_amenity_rejected(self):
        payload = base_listing()
        payload["amenities"] = ["parking", "jacuzzi"]
        _, errors = v.validate_listing_payload(payload)
        self.assertTrue(any("amenities" in e for e in errors))

    def test_partial_update_allows_missing_required(self):
        clean, errors = v.validate_listing_payload({"partial": True, "price_ghs": 4000})
        self.assertEqual(errors, [])
        self.assertEqual(clean["price_ghs"], 4000)


class SearchValidationTests(unittest.TestCase):
    def test_search_normalises_area_and_mode(self):
        clean, errors = v.validate_search_params({"area": "EAST LEGON", "type": "shop", "mode": "rent", "sort": "price_asc"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["area"], "East Legon")
        self.assertEqual(clean["sort"], "price_asc")

    def test_min_above_max_rejected(self):
        _, errors = v.validate_search_params({"min_price": "5000", "max_price": "1000"})
        self.assertTrue(any("min_price" in e for e in errors))

    def test_bad_sort_rejected(self):
        _, errors = v.validate_search_params({"sort": "cheapest"})
        self.assertTrue(any("sort" in e for e in errors))

    def test_unknown_area_rejected(self):
        _, errors = v.validate_search_params({"area": "Nonexistent"})
        self.assertTrue(any("area" in e for e in errors))


class InteractionValidationTests(unittest.TestCase):
    def test_viewing_request_valid(self):
        clean, errors = v.validate_viewing_request(
            {"date_time": "2026-09-01T17:00", "contact_name": "Efua", "whatsapp": "+233241234567", "note": "Weekday after work"}
        )
        self.assertEqual(errors, [])
        self.assertEqual(clean["contact_name"], "Efua")

    def test_viewing_request_requires_date(self):
        _, errors = v.validate_viewing_request({"contact_name": "Efua"})
        self.assertTrue(any("date_time" in e for e in errors))

    def test_offer_valid(self):
        clean, errors = v.validate_offer({"amount_ghs": 3200, "contact_name": "Kojo"})
        self.assertEqual(errors, [])

    def test_report_honeypot_dropped(self):
        clean, errors = v.validate_report({"reason": "duplicate", "website": "http://spam"})
        self.assertEqual(clean.get("honeypot"), True)

    def test_report_bad_reason_rejected(self):
        _, errors = v.validate_report({"reason": "because"})
        self.assertTrue(any("reason" in e for e in errors))


class SavedSearchTests(unittest.TestCase):
    def test_saved_search_matches_search_vocabulary(self):
        clean, errors = v.validate_saved_search({"area": "Spintex", "type": "apartment", "mode": "rent"})
        self.assertEqual(errors, [])
        self.assertEqual(clean["area"], "Spintex")


if __name__ == "__main__":
    unittest.main()
