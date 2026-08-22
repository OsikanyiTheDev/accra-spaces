"""Listing completeness scoring.

The badge shown on the platform is a FACTUAL completeness cue, never a
verification claim. It reflects what is present on the listing:
day + night photos, a GhanaPost Digital Address and a maintenance policy.
"""

from typing import Any

CHECKS = [
    ("day_night_photos", "Day & night photos"),
    ("digital_address", "Digital Address"),
    ("maintenance_policy", "Maintenance policy"),
]

LEVELS = [
    ("complete", 3),
    ("good", 2),
    ("basic", 1),
]


def compute_completeness(item: dict[str, Any]) -> dict[str, Any]:
    day_night = bool(item.get("day_photos")) and bool(item.get("night_photos"))
    address = bool(item.get("digital_address"))
    maintenance = bool(item.get("maintenance_policy"))

    present = {
        "day_night_photos": day_night,
        "digital_address": address,
        "maintenance_policy": maintenance,
    }
    score = sum(1 for v in present.values() if v)

    level = "basic"
    for name, threshold in LEVELS:
        if score >= threshold:
            level = name
            break

    return {
        "score": score,
        "level": level,
        "checks": [{key: key, "label": label, "complete": present[key]} for key, label in CHECKS],
    }


def has_day_night_photos(item: dict[str, Any]) -> bool:
    return bool(item.get("day_photos")) and bool(item.get("night_photos"))
