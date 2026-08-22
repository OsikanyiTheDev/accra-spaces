"""Public presentation of listing items.

Privacy rule: list responses NEVER include contact fields. Only the detail
response exposes the poster's WhatsApp/phone, and only for a published
listing that a user has chosen to open.
"""

from typing import Any

from .completeness import compute_completeness


def _base(item: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": item.get("listing_id"),
        "title": item.get("title"),
        "type": item.get("type"),
        "sale_mode": item.get("sale_mode"),
        "price_ghs": item.get("price_ghs"),
        "negotiable": item.get("negotiable", False),
        "area": item.get("area"),
        "beds": item.get("beds"),
        "baths": item.get("baths"),
        "size_m2": item.get("size_m2"),
        "deposit_months": item.get("deposit_months"),
        "maintenance_policy": item.get("maintenance_policy"),
        "status": item.get("status"),
        "updated_at": item.get("updated_at"),
        "created_at": item.get("created_at"),
        "completeness": compute_completeness(item),
        "cover_key": (item.get("day_photos") or [None])[0],
    }


def summary(item: dict[str, Any]) -> dict[str, Any]:
    """Card payload for list/search responses — no contact information."""
    base = _base(item)
    base["poster"] = {
        "name": (item.get("poster") or {}).get("name"),
        "role": (item.get("poster") or {}).get("role"),
    }
    return base


def detail(item: dict[str, Any]) -> dict[str, Any]:
    """Full public detail — includes poster contact and all photo keys."""
    base = _base(item)
    poster = item.get("poster") or {}
    base["poster"] = {
        "name": poster.get("name"),
        "role": poster.get("role"),
        "agent_commission": poster.get("commission"),
        "whatsapp": poster.get("whatsapp"),
        "phone": poster.get("phone"),
    }
    base["digital_address"] = item.get("digital_address")
    base["description"] = item.get("description")
    base["color"] = item.get("color")
    base["amenities"] = item.get("amenities", [])
    base["day_photos"] = item.get("day_photos", [])
    base["night_photos"] = item.get("night_photos", [])
    base["owner_sub"] = item.get("owner_sub")
    return base
