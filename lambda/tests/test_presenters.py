import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.presenters import detail, summary  # noqa: E402


def full_item():
    return {
        "listing_id": "lst_1",
        "title": "Warehouse shop front",
        "type": "shop",
        "sale_mode": "rent",
        "price_ghs": 6000,
        "negotiable": True,
        "area": "Spintex",
        "digital_address": "GA-100-0020",
        "deposit_months": 3,
        "maintenance_policy": "tenant_deduct",
        "beds": 0,
        "baths": 1,
        "size_m2": 120,
        "description": "Busy road frontage.",
        "amenities": ["parking", "security"],
        "day_photos": ["listings/lst_1/day/a.jpg", "listings/lst_1/day/b.jpg"],
        "night_photos": ["listings/lst_1/night/c.jpg"],
        "poster": {
            "name": "Ama",
            "role": "agent",
            "whatsapp": "+233241234567",
            "phone": "+233241234567",
            "commission": {"type": "one_month_rent", "value": 1, "note": "One month on signing"},
            "sub": "sub-123",
        },
        "owner_sub": "sub-123",
        "status": "published",
        "created_at": "2026-08-22T10:00:00+00:00",
        "updated_at": "2026-08-22T10:00:00+00:00",
    }


class PresenterTests(unittest.TestCase):
    def test_summary_never_exposes_contact(self):
        s = summary(full_item())
        self.assertNotIn("whatsapp", json_repr(s))
        self.assertNotIn("phone", json_repr(s))
        self.assertNotIn("commission", json_repr(s))
        self.assertNotIn("sub", json_repr(s))
        self.assertEqual(s["poster"]["role"], "agent")
        self.assertEqual(s["cover_key"], "listings/lst_1/day/a.jpg")

    def test_detail_exposes_poster_contact_but_not_internal_owner_id(self):
        d = detail(full_item())
        self.assertEqual(d["poster"]["whatsapp"], "+233241234567")
        self.assertEqual(d["poster"]["agent_commission"]["type"], "one_month_rent")
        self.assertEqual(len(d["day_photos"]), 2)
        self.assertEqual(d["digital_address"], "GA-100-0020")
        self.assertNotIn("owner_sub", d)
        self.assertNotIn("sub-123", json_repr(d))

    def test_completeness_present_in_both(self):
        for presenter in (summary, detail):
            out = presenter(full_item())
            self.assertEqual(out["completeness"]["level"], "complete")
            self.assertEqual(out["completeness"]["score"], 3)


def json_repr(obj):
    import json

    return json.dumps(obj)


if __name__ == "__main__":
    unittest.main()
