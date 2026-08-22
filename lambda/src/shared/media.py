"""Private media helpers: constrained presigned uploads and signed reads."""

import uuid
from typing import Any

from . import constants as c


def _client():
    import boto3  # local import for testability

    return boto3.client("s3")


def photo_key(listing_id: str, kind: str, ext: str) -> str:
    return f"listings/{listing_id}/{kind}/{uuid.uuid4().hex}.{ext}"


def presign_upload(bucket: str, listing_id: str, kind: str, content_type: str, size_bytes: int) -> dict[str, Any]:
    """Generate a constrained presigned POST for one listing photo.

    The caller fetches this from the API after the listing exists. Uploads
    are limited to supported MIME types and 5 MB, and expire after 5 minutes.
    """
    ext = content_type.split("/")[1]  # jpeg | png | webp
    key = photo_key(listing_id, kind, ext)

    post = _client().generate_presigned_post(
        Bucket=bucket,
        Key=key,
        Fields={},
        Conditions=[
            ["content-length-range", 1, c.MAX_PHOTO_BYTES],
            ["content-type", content_type],
        ],
        ExpiresIn=300,
    )

    return {
        "key": key,
        "kind": kind,
        "content_type": content_type,
        "url": post["url"],
        "fields": post["fields"],
        "expires_in_seconds": 300,
    }


def presign_read(bucket: str, key: str, expires: int = 300) -> str:
    """Short-lived signed GET URL for a private photo."""
    return _client().generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires,
    )
