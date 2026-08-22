"""HTTP response helpers for API Gateway HTTP API (v2 payload)."""

import json
from decimal import Decimal
from typing import Any

ALLOWED_ORIGIN = "*"  # API Gateway CORS is the primary origin control.


def json_default(value: Any) -> Any:
    if isinstance(value, Decimal):
        return int(value) if value % 1 == 0 else float(value)
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


def response(status_code: int, body: dict[str, Any]) -> dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": {
            "content-type": "application/json",
            "access-control-allow-origin": ALLOWED_ORIGIN,
            "access-control-allow-headers": "content-type,authorization",
            "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
        },
        "body": json.dumps(body, default=json_default),
    }


def parse_json_body(event: dict[str, Any]) -> dict[str, Any]:
    body = event.get("body") or "{}"
    if event.get("isBase64Encoded"):
        raise ValueError("Base64-encoded bodies are not supported for this route")
    parsed = json.loads(body)
    if not isinstance(parsed, dict):
        raise ValueError("Request body must be a JSON object")
    return parsed


def path_parameter(event: dict[str, Any], name: str) -> str | None:
    return (event.get("pathParameters") or {}).get(name)


def query_parameters(event: dict[str, Any]) -> dict[str, Any]:
    return event.get("queryStringParameters") or {}


def created(body: dict[str, Any]) -> dict[str, Any]:
    return response(201, body)


def ok(body: dict[str, Any]) -> dict[str, Any]:
    return response(200, body)


def bad_request(errors: list[str]) -> dict[str, Any]:
    return response(400, {"error": "invalid_request", "details": errors})


def unauthorized() -> dict[str, Any]:
    return response(401, {"error": "unauthorized"})


def forbidden() -> dict[str, Any]:
    return response(403, {"error": "forbidden"})


def not_found() -> dict[str, Any]:
    return response(404, {"error": "not_found"})


def conflict(message: str = "conflict") -> dict[str, Any]:
    return response(409, {"error": message})


def server_error() -> dict[str, Any]:
    return response(500, {"error": "internal_error"})
