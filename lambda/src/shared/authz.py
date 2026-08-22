"""Cognito JWT claim helpers for API Gateway JWT authorizers."""

from typing import Any


def _claims(event: dict[str, Any]) -> dict[str, Any]:
    return (
        (event.get("requestContext") or {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
        or {}
    )


def caller_sub(event: dict[str, Any]) -> str | None:
    return _claims(event).get("sub")


def caller_groups(event: dict[str, Any]) -> list[str]:
    groups = _claims(event).get("cognito:groups", "")
    if not groups:
        return []
    return [g for g in str(groups).split(",") if g]


def is_admin(event: dict[str, Any]) -> bool:
    return "Admin" in caller_groups(event)


def role_from_groups(groups: list[str]) -> str:
    for role in ("Landlord", "Agent", "Seeker"):
        if role in groups:
            return role.lower()
    return "seeker"
