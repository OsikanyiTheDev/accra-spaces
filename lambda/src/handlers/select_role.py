"""POST /me/role — one-time self-selection of a posting role (JWT).

Landlord and Agent are account capabilities, not identity-verification claims.
A conditional DynamoDB profile write makes the selection one-time before the
matching Cognito group is assigned. The user signs in again to receive a token
with the new group claim.
"""

import os

from shared import authz, http
from shared.repository import ListingsRepository
from shared.validation import validate_role_selection


def _identity_client():
    import boto3

    return boto3.client("cognito-idp")


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    username = authz.caller_username(event)
    if not sub or not username:
        return http.unauthorized()

    existing = set(authz.caller_groups(event))
    if existing.intersection({"Landlord", "Agent", "Admin"}):
        return http.conflict("posting_role_already_selected")

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_role_selection(payload)
    if errors:
        return http.bad_request(errors)

    table_name = os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings")
    pool_id = os.environ.get("COGNITO_USER_POOL_ID")
    if not pool_id:
        return http.server_error()

    repo = ListingsRepository(table_name)
    if not repo.claim_user_role(sub, clean["role"]):
        return http.conflict("posting_role_already_selected")

    try:
        _identity_client().admin_add_user_to_group(
            UserPoolId=pool_id,
            Username=username,
            GroupName=clean["role"],
        )
    except Exception:
        # Keep the one-time choice recoverable if Cognito rejects the update.
        repo.rollback_user_role(sub)
        return http.server_error()

    return http.created(
        {
            "role": clean["role"].lower(),
            "self_declared": True,
            "reauthentication_required": True,
            "message": "Role selected. Sign in again to refresh account permissions.",
        }
    )
