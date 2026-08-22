"""POST /media/presign — constrained presigned upload for one listing photo.

JWT-protected. The listing must exist and belong to the caller.
"""

import os

from shared import authz, http
from shared.media import presign_upload
from shared.repository import ListingsRepository
from shared.validation import validate_media_request


def lambda_handler(event, context):
    sub = authz.caller_sub(event)
    listing_id = http.path_parameter(event, "id")
    if not sub or not listing_id:
        return http.unauthorized()

    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    clean, errors = validate_media_request(payload)
    if errors:
        return http.bad_request(errors)

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    item = repo.get_listing(listing_id)
    if not item:
        return http.not_found()
    if item.get("owner_sub") != sub and not authz.is_admin(event):
        return http.forbidden()

    bucket = os.environ.get("MEDIA_BUCKET")
    if not bucket:
        return http.server_error()

    presigned = presign_upload(
        bucket=bucket,
        listing_id=listing_id,
        kind=clean["kind"],
        content_type=clean["content_type"],
        size_bytes=clean["size_bytes"],
    )
    return http.ok({"upload": presigned})
