"""Small number/text helpers for the API."""


def mask_phone(phone: str | None) -> str | None:
    """Mask a phone number for safe display, keeping the country code.

    Examples: +233 ** *** 4567 (Ghana) or 233 ** *** 4567.
    """
    if not phone:
        return None
    digits = "".join(ch for ch in phone if ch.isdigit())
    if len(digits) < 7:
        return phone
    local = digits[-4:]
    if digits.startswith("233"):
        return f"+233 ** *** {local}"
    return f"{digits[:3]} ** *** {local}"


def format_ghs(amount: int | float | None) -> str | None:
    """Format an integer GHS amount for display (no currency conversion)."""
    if amount is None:
        return None
    return f"GH₵ {amount:,.0f}"
