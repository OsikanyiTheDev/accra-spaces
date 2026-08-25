import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from shared.validation import validate_listing_payload  # noqa: E402


ROOT = Path(__file__).resolve().parents[2]
SAMPLE_FILE = ROOT / "sample_data" / "listings.json"


class SampleDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = json.loads(SAMPLE_FILE.read_text())
        cls.listings = cls.manifest["listings"]

    def test_sample_data_has_expected_shape(self):
        self.assertEqual(self.manifest["schema_version"], "accra-spaces-sample-v1")
        self.assertGreaterEqual(len(self.listings), 6)
        self.assertEqual(len({item["id"] for item in self.listings}), len(self.listings))

    def test_each_sample_listing_validates_against_api_contract(self):
        for item in self.listings:
            with self.subTest(item=item["id"]):
                self.assertTrue(item["id"].startswith("sample-"))
                self.assertTrue(item["title"].startswith("Sample:"))
                self.assertIn("fictional sample", item["description"].lower())
                photos = item["photos"]
                day_keys = [f"listings/{item['id']}/day/{index + 1:02d}-{Path(path).name}" for index, path in enumerate(photos["day"])]
                night_keys = [f"listings/{item['id']}/night/{index + 1:02d}-{Path(path).name}" for index, path in enumerate(photos["night"])]
                payload = {key: value for key, value in item.items() if key not in {"id", "photos"}}
                payload["day_photos"] = day_keys
                payload["night_photos"] = night_keys
                _, errors = validate_listing_payload(payload)
                self.assertEqual(errors, [])

    def test_sample_images_exist(self):
        for item in self.listings:
            for kind in ("day", "night"):
                for relative in item["photos"][kind]:
                    with self.subTest(item=item["id"], image=relative):
                        path = SAMPLE_FILE.parent / relative
                        self.assertTrue(path.exists(), f"Missing sample image: {path}")
                        self.assertGreater(path.stat().st_size, 1000)


if __name__ == "__main__":
    unittest.main()
