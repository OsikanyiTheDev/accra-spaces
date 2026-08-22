"""Request payload and query validation (standard library only)."""

from typing import Any

from . import constants as c


def _text(value: Any, field: str, min_len: int, max_len: int, required: bool = True, errors: list[str] | None = None):
    if value is None or value == "":
        if required:
            (errors if errors is not None else []).append(f"{field} is required")
        return None
    if not isinstance(value, str):
        (errors if errors is not None else []).append(f"{field} must be text")
        return None
    value = value.strip()
    if not (min_len <= len(value) <= max_len):
        (errors if errors is not None else []).append(
            f"{field} must be between {min_len} and {max_len} characters"
        )
        return None
    return value


def _choice(value: Any, field: str, allowed: list[str], errors: list[str]):
    if value not in allowed:
        errors.append(f"{field} must be one of: {', '.join(allowed)}")
        return None
    return value


def _int(value: Any, field: str, low: int, high: int, errors: list[str], required=False):
    if value is None:
        if required:
            errors.append(f"{field} is required")
        return None
    if isinstance(value, bool):
        errors.append(f"{field} must be a whole number")
        return None
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        errors.append(f"{field} must be a whole number")
        return None
    if not (low <= parsed <= high):
        errors.append(f"{field} must be between {low} and {high}")
        return None
    return parsed


def _bool(value: Any, field: str, errors: list[str]):
    if value is None:
        return None
    if not isinstance(value, bool):
        errors.append(f"{field} must be true or false")
        return None
    return value


def validate_search_params(params: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Validate GET /listings query parameters. Returns (clean, errors)."""
    errors: list[str] = []
    clean: dict[str, Any] = {}

    area = params.get("area")
    if area:
        canonical = c.canonical_area(str(area))
        if not canonical:
            errors.append(f"unknown area: {area}")
        else:
            clean["area"] = canonical

    prop_type = params.get("type")
    if prop_type:
        if prop_type not in c.PROPERTY_TYPES:
            errors.append(f"type must be one of: {', '.join(c.PROPERTY_TYPES)}")
        else:
            clean["type"] = prop_type

    mode = params.get("mode")
    if mode:
        if mode not in c.SALE_MODES:
            errors.append(f"mode must be one of: {', '.join(c.SALE_MODES)}")
        else:
            clean["mode"] = mode

    for key, low, high in (("min_price", c.MIN_PRICE_GHS, c.MAX_PRICE_GHS), ("max_price", c.MIN_PRICE_GHS, c.MAX_PRICE_GHS)):
        raw = params.get(key)
        if raw not in (None, ""):
            parsed = _int(raw, key, low, high, errors)
            if parsed is not None:
                clean[key] = parsed

    if "min_price" in clean and "max_price" in clean and clean["min_price"] > clean["max_price"]:
        errors.append("min_price must not exceed max_price")

    beds = params.get("beds")
    if beds not in (None, ""):
        parsed = _int(beds, "beds", 1, 20, errors)
        if parsed is not None:
            clean["beds"] = parsed

    sort = params.get("sort", "newest")
    if sort not in ("newest", "price_asc", "price_desc"):
        errors.append("sort must be one of: newest, price_asc, price_desc")
    else:
        clean["sort"] = sort

    limit = params.get("limit", "24")
    parsed_limit = _int(limit, "limit", 1, 50, errors)
    if parsed_limit is not None:
        clean["limit"] = parsed_limit

    cursor = params.get("cursor")
    if cursor:
        clean["cursor"] = str(cursor)

    return clean, errors


def validate_listing_payload(payload: dict[str, Any], *, require_poster: bool = True) -> tuple[dict[str, Any], list[str]]:
    """Validate a listing create/update payload. Returns (clean, errors)."""
    errors: list[str] = []
    clean: dict[str, Any] = {}
    updates_only = bool(payload.get("partial", False))

    def field(required: bool) -> bool:
        return required and not updates_only

    title = _text(payload.get("title"), "title", 4, 120, required=field(True), errors=errors)
    if title is not None:
        clean["title"] = title

    for field_name, allowed in (
        ("type", c.PROPERTY_TYPES),
        ("sale_mode", c.SALE_MODES),
        ("maintenance_policy", c.MAINTENANCE_POLICIES),
    ):
        value = payload.get(field_name)
        if value is not None:
            choice = _choice(value, field_name, allowed, errors)
            if choice is not None:
                clean[field_name] = choice
        elif not updates_only:
            errors.append(f"{field_name} is required")

    price = _int(payload.get("price_ghs"), "price_ghs", c.MIN_PRICE_GHS, c.MAX_PRICE_GHS, errors, required=field(True))
    if price is not None:
        clean["price_ghs"] = price

    negotiable = _bool(payload.get("negotiable"), "negotiable", errors)
    if negotiable is not None:
        clean["negotiable"] = negotiable

    area_value = payload.get("area")
    if area_value is not None:
        canonical = c.canonical_area(str(area_value))
        if not canonical:
            errors.append("area must be one of the supported Greater Accra areas")
        else:
            clean["area"] = canonical
    elif not updates_only:
        errors.append("area is required")

    address = payload.get("digital_address")
    if address not in (None, ""):
        address = str(address).strip().upper()
        if not c.DIGITAL_ADDRESS_RE.match(address):
            errors.append("digital_address must look like GA-123-4567")
        else:
            clean["digital_address"] = address

    deposit = _int(payload.get("deposit_months"), "deposit_months", 0, 24, errors, required=field(True))
    if deposit is not None:
        clean["deposit_months"] = deposit

    for field_name, low, high in (("beds", 0, 20), ("baths", 0, 20)):
        parsed = _int(payload.get(field_name), field_name, low, high, errors)
        if parsed is not None:
            clean[field_name] = parsed

    size_m2 = payload.get("size_m2")
    if size_m2 not in (None, ""):
        try:
            parsed = float(size_m2)
        except (TypeError, ValueError):
            errors.append("size_m2 must be a number")
        else:
            if not (1 <= parsed <= 100_000):
                errors.append("size_m2 must be between 1 and 100000")
            else:
                clean["size_m2"] = parsed

    description = _text(payload.get("description"), "description", 0, 2000, required=False, errors=errors)
    if description is not None:
        clean["description"] = description

    color = _text(payload.get("color"), "color", 0, 60, required=False, errors=errors)
    if color is not None:
        clean["color"] = color

    amenities = payload.get("amenities")
    if amenities is not None:
        if not isinstance(amenities, list) or not all(a in c.AMENITIES for a in amenities):
            errors.append(f"amenities must be a list from: {', '.join(c.AMENITIES)}")
        else:
            clean["amenities"] = sorted(set(amenities))

    day_photos = _validate_photo_keys(payload.get("day_photos"), "day_photos", errors)
    night_photos = _validate_photo_keys(payload.get("night_photos"), "night_photos", errors)
    if day_photos is not None:
        clean["day_photos"] = day_photos
    if night_photos is not None:
        clean["night_photos"] = night_photos

    poster = payload.get("poster")
    if poster is not None:
        if not isinstance(poster, dict):
            errors.append("poster must be an object")
        else:
            clean["poster"] = _validate_poster(poster, errors)

    if require_poster and not updates_only and "poster" not in clean:
        errors.append("poster details are required for new listings")

    return clean, errors


def _validate_photo_keys(value: Any, field: str, errors: list[str]):
    if value is None:
        return None
    if not isinstance(value, list) or not all(isinstance(k, str) and len(k) < 512 for k in value):
        errors.append(f"{field} must be a list of photo keys")
        return None
    if len(value) > 12:
        errors.append(f"{field} has too many photos (max 12)")
        return None
    return list(dict.fromkeys(value))


def _validate_poster(poster: dict[str, Any], errors: list[str]) -> dict[str, Any]:
    clean: dict[str, Any] = {}
    role = _choice(poster.get("role"), "poster.role", ["landlord", "agent"], errors)
    if role is not None:
        clean["role"] = role

    name = _text(poster.get("name"), "poster.name", 2, 80, errors=errors)
    if name is not None:
        clean["name"] = name

    whatsapp = poster.get("whatsapp")
    if whatsapp not in (None, ""):
        whatsapp = str(whatsapp).strip()
        if not c.WHATSAPP_RE.match(whatsapp):
            errors.append("poster.whatsapp must be a phone number")
        else:
            clean["whatsapp"] = whatsapp

    phone = poster.get("phone")
    if phone not in (None, ""):
        phone = str(phone).strip()
        if not c.WHATSAPP_RE.match(phone):
            errors.append("poster.phone must be a phone number")
        else:
            clean["phone"] = phone

    if "whatsapp" not in clean and "phone" not in clean:
        errors.append("poster must include a WhatsApp or phone number")

    commission = poster.get("commission")
    if commission is not None:
        if not isinstance(commission, dict):
            errors.append("poster.commission must be an object")
        else:
            clean["commission"] = _validate_commission(commission, errors, required=(role == "agent"))
    elif role == "agent":
        errors.append("poster.commission is required for agent listings")

    return clean


def _validate_commission(commission: dict[str, Any], errors: list[str], *, required: bool) -> dict[str, Any] | None:
    if commission is None:
        return None
    kind = _choice(commission.get("type"), "commission.type", c.COMMISSION_TYPES, errors)
    if kind is None:
        return None
    clean: dict[str, Any] = {"type": kind}
    value = _int(commission.get("value"), "commission.value", 0, 1000, errors)
    if value is not None:
        clean["value"] = value
    note = _text(commission.get("note"), "commission.note", 0, 200, required=False, errors=errors)
    if note is not None:
        clean["note"] = note
    return clean


def validate_viewing_request(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}

    date_time = _text(payload.get("date_time"), "date_time", 5, 32, errors=errors)
    if date_time is not None:
        clean["date_time"] = date_time

    note = _text(payload.get("note"), "note", 0, 500, required=False, errors=errors)
    if note is not None:
        clean["note"] = note

    contact_name = _text(payload.get("contact_name"), "contact_name", 2, 80, errors=errors)
    if contact_name is not None:
        clean["contact_name"] = contact_name

    whatsapp = payload.get("whatsapp")
    if whatsapp not in (None, ""):
        whatsapp = str(whatsapp).strip()
        if not c.WHATSAPP_RE.match(whatsapp):
            errors.append("whatsapp must be a phone number")
        else:
            clean["whatsapp"] = whatsapp

    return clean, errors


def validate_offer(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}

    amount = _int(payload.get("amount_ghs"), "amount_ghs", 1, c.MAX_PRICE_GHS, errors, required=True)
    if amount is not None:
        clean["amount_ghs"] = amount

    note = _text(payload.get("note"), "note", 0, 500, required=False, errors=errors)
    if note is not None:
        clean["note"] = note

    contact_name = _text(payload.get("contact_name"), "contact_name", 2, 80, errors=errors)
    if contact_name is not None:
        clean["contact_name"] = contact_name

    whatsapp = payload.get("whatsapp")
    if whatsapp not in (None, ""):
        whatsapp = str(whatsapp).strip()
        if not c.WHATSAPP_RE.match(whatsapp):
            errors.append("whatsapp must be a phone number")
        else:
            clean["whatsapp"] = whatsapp

    return clean, errors


def validate_report(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}

    # Basic bot check: hidden field that real reporters never fill.
    if payload.get("website"):
        return {"honeypot": True}, []

    reason = _choice(payload.get("reason"), "reason", c.REPORT_REASONS, errors)
    if reason is not None:
        clean["reason"] = reason

    detail = _text(payload.get("detail"), "detail", 0, 1000, required=False, errors=errors)
    if detail is not None:
        clean["detail"] = detail

    return clean, errors


def validate_saved_search(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Saved searches reuse the search parameter vocabulary."""
    return validate_search_params(payload)


def validate_role_selection(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Validate the one-time, self-declared posting role selection."""
    errors: list[str] = []
    role = payload.get("role")
    role_map = {"landlord": "Landlord", "agent": "Agent"}
    if role not in role_map:
        errors.append("role must be one of: landlord, agent")
        return {}, errors
    return {"role": role_map[role]}, errors


def validate_media_request(payload: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    errors: list[str] = []
    clean: dict[str, Any] = {}

    kind = _choice(payload.get("kind"), "kind", c.PHOTO_KINDS, errors)
    if kind is not None:
        clean["kind"] = kind

    content_type = _choice(payload.get("content_type"), "content_type", c.PHOTO_CONTENT_TYPES, errors)
    if content_type is not None:
        clean["content_type"] = content_type

    size = _int(payload.get("size_bytes"), "size_bytes", 1, c.MAX_PHOTO_BYTES, errors, required=True)
    if size is not None:
        clean["size_bytes"] = size

    return clean, errors
