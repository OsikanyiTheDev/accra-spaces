"""POST /media/urls — short-lived signed URLs for private photo keys.

Public but throttled. Keys must belong to a published listing so the media
bucket stays private while the gallery stays usable.
"""

import os
import re

from shared import http
from shared.media import presign_read
from shared.repository import ListingsRepository

KEY_RE = re.compile(r"^listings/[A-Za-z0-9_-]+/(day|night)/[A-Za-z0-9.-]+$")


def lambda_handler(event, context):
    try:
        payload = http.parse_json_body(event)
    except ValueError as exc:
        return http.bad_request([str(exc)])

    keys = payload.get("keys")
    if not isinstance(keys, list) or not keys or len(keys) > 24:
        return http.bad_request(["keys must be a list of 1 to 24 photo keys"])
    if not all(isinstance(k, str) and KEY_RE.match(k) for k in keys):
        return http.bad_request(["one or more keys are not valid listing photo keys"])

    repo = ListingsRepository(os.environ.get("LISTINGS_TABLE", "accraspaces-dev-listings"))
    bucket = os.environ.get("MEDIA_BUCKET", "")

    urls: dict[str, str] = {}
    for key in keys:
        listing_id = key.split("/")[1]
        item = repo.get_listing(listing_id)
        if not item or item.get("status") != "published":
            continue
        urls[key] = presign_read(bucket, key)

    if not urls:
        return http.not_found()

    return http.ok({"urls": urls, "expires_in_seconds": 300})
