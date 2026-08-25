#!/usr/bin/env python3
"""Load or delete fictional Accra Spaces sample listings.

This script is intended to be run from a developer machine that already has
AWS credentials for the dev account. It writes only the deterministic listing
IDs present in ``sample_data/listings.json`` and uploads their local images to
S3 under ``listings/<sample-id>/...``.
"""

from __future__ import annotations

import argparse
import datetime as dt
import json
import mimetypes
import os
import re
import sys
from decimal import Decimal
from pathlib import Path
from typing import Any

REPO_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_DATA_FILE = REPO_ROOT / "sample_data" / "listings.json"
SAMPLE_ID_RE = re.compile(r"^sample-[a-z0-9-]+$")

# Reuse the Lambda validator so the seed data stays aligned with the API
# contract without needing to call the deployed API.
sys.path.insert(0, str(REPO_ROOT / "lambda" / "src"))
try:
    from shared.validation import validate_listing_payload  # type: ignore  # noqa: E402
except Exception as exc:  # pragma: no cover - defensive import message
    raise SystemExit(f"Could not import Lambda validators: {exc}") from exc


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Load fictional Accra Spaces sample listings into dev AWS.")
    parser.add_argument("--data", default=str(DEFAULT_DATA_FILE), help="Path to sample listings JSON.")
    parser.add_argument("--table", default=os.getenv("LISTINGS_TABLE"), help="DynamoDB listings table name. Can also use LISTINGS_TABLE env var.")
    parser.add_argument("--bucket", default=os.getenv("MEDIA_BUCKET"), help="S3 media bucket name. Can also use MEDIA_BUCKET env var.")
    parser.add_argument("--region", default=os.getenv("AWS_REGION") or os.getenv("AWS_DEFAULT_REGION") or "us-east-1", help="AWS region.")
    parser.add_argument("--profile", default=os.getenv("AWS_PROFILE"), help="Optional AWS profile name.")
    parser.add_argument("--status", choices=["published", "draft"], default="published", help="Status to write for seeded listings.")
    parser.add_argument("--owner-sub", default="sample-seed", help="Synthetic owner_sub used on sample records.")
    parser.add_argument("--dry-run", action="store_true", help="Validate and print planned actions without writing AWS resources.")
    parser.add_argument("--delete", action="store_true", help="Delete the sample listings and their S3 objects instead of loading them.")
    parser.add_argument("--yes", action="store_true", help="Skip the confirmation prompt for --delete.")
    args = parser.parse_args()

    if not args.table:
        parser.error("--table or LISTINGS_TABLE is required")
    if not args.bucket:
        parser.error("--bucket or MEDIA_BUCKET is required")
    return args


def load_manifest(path: Path) -> dict[str, Any]:
    try:
        manifest = json.loads(path.read_text())
    except FileNotFoundError as exc:
        raise SystemExit(f"Sample data file not found: {path}") from exc
    except json.JSONDecodeError as exc:
        raise SystemExit(f"Invalid JSON in {path}: {exc}") from exc

    listings = manifest.get("listings")
    if not isinstance(listings, list) or not listings:
        raise SystemExit("Sample data must contain a non-empty listings array")
    return manifest


def safe_image_key(listing_id: str, kind: str, index: int, image_path: Path) -> str:
    suffix = image_path.suffix.lower()
    if suffix not in {".png", ".jpg", ".jpeg", ".webp"}:
        raise ValueError(f"Unsupported image extension for {image_path}")
    safe_name = re.sub(r"[^A-Za-z0-9.-]+", "-", image_path.name).strip("-").lower()
    return f"listings/{listing_id}/{kind}/{index + 1:02d}-{safe_name}"


def image_content_type(path: Path) -> str:
    guessed, _ = mimetypes.guess_type(path.name)
    if guessed in {"image/png", "image/jpeg", "image/webp"}:
        return guessed
    raise ValueError(f"Unsupported image MIME type for {path}")


def listing_photo_keys(listing: dict[str, Any], data_dir: Path) -> dict[str, list[tuple[str, Path, str]]]:
    listing_id = listing.get("id")
    photos = listing.get("photos") or {}
    result: dict[str, list[tuple[str, Path, str]]] = {"day": [], "night": []}
    for kind in ("day", "night"):
        values = photos.get(kind)
        if not isinstance(values, list) or not values:
            raise ValueError(f"{listing_id}: photos.{kind} must contain at least one image")
        for index, relative in enumerate(values):
            if not isinstance(relative, str):
                raise ValueError(f"{listing_id}: photo path must be text")
            path = data_dir / relative
            if not path.exists():
                raise ValueError(f"{listing_id}: image not found: {path}")
            key = safe_image_key(listing_id, kind, index, path)
            result[kind].append((key, path, image_content_type(path)))
    return result


def sample_payload(listing: dict[str, Any], day_keys: list[str], night_keys: list[str]) -> dict[str, Any]:
    payload_keys = [
        "title",
        "type",
        "sale_mode",
        "price_ghs",
        "negotiable",
        "area",
        "digital_address",
        "deposit_months",
        "maintenance_policy",
        "beds",
        "baths",
        "size_m2",
        "description",
        "color",
        "amenities",
        "poster",
    ]
    payload = {key: listing[key] for key in payload_keys if key in listing}
    payload["day_photos"] = day_keys
    payload["night_photos"] = night_keys
    return payload


def validate_samples(manifest: dict[str, Any], data_file: Path) -> list[dict[str, Any]]:
    data_dir = data_file.parent
    seen: set[str] = set()
    prepared: list[dict[str, Any]] = []
    for index, listing in enumerate(manifest["listings"]):
        listing_id = listing.get("id")
        if not isinstance(listing_id, str) or not SAMPLE_ID_RE.fullmatch(listing_id):
            raise SystemExit(f"Listing {index + 1} id must match {SAMPLE_ID_RE.pattern}")
        if listing_id in seen:
            raise SystemExit(f"Duplicate sample listing id: {listing_id}")
        seen.add(listing_id)

        try:
            photo_info = listing_photo_keys(listing, data_dir)
            day_keys = [item[0] for item in photo_info["day"]]
            night_keys = [item[0] for item in photo_info["night"]]
            payload = sample_payload(listing, day_keys, night_keys)
            clean, errors = validate_listing_payload(payload)
        except ValueError as exc:
            raise SystemExit(str(exc)) from exc
        if errors:
            raise SystemExit(f"{listing_id} failed API validation: {errors}")
        if not listing["title"].startswith("Sample:"):
            raise SystemExit(f"{listing_id} title must start with 'Sample:'")
        if "fictional sample" not in listing.get("description", "").lower():
            raise SystemExit(f"{listing_id} description must clearly say it is fictional sample data")

        prepared.append({"id": listing_id, "index": index, "clean": clean, "photos": photo_info})
    return prepared


def decimal_safe(value: Any) -> Any:
    """Convert Python floats to Decimal before sending to DynamoDB."""
    if isinstance(value, float):
        return Decimal(str(value))
    if isinstance(value, list):
        return [decimal_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: decimal_safe(item) for key, item in value.items()}
    return value


def build_item(prepared: dict[str, Any], *, status: str, owner_sub: str, schema_version: str) -> dict[str, Any]:
    clean = prepared["clean"]
    listing_id = prepared["id"]
    base_time = dt.datetime(2026, 8, 25, 12, 0, tzinfo=dt.timezone.utc)
    created_at = (base_time + dt.timedelta(minutes=prepared["index"] * 11)).isoformat()
    updated_at = (base_time + dt.timedelta(minutes=prepared["index"] * 11 + 5)).isoformat()

    poster = dict(clean["poster"])
    poster["sub"] = owner_sub

    item = {
        "PK": f"LISTING#{listing_id}",
        "SK": "METADATA",
        "listing_id": listing_id,
        "title": clean["title"],
        "type": clean["type"],
        "sale_mode": clean["sale_mode"],
        "price_ghs": clean["price_ghs"],
        "negotiable": clean.get("negotiable", False),
        "area": clean["area"],
        "digital_address": clean.get("digital_address"),
        "deposit_months": clean["deposit_months"],
        "maintenance_policy": clean["maintenance_policy"],
        "beds": clean.get("beds", 0),
        "baths": clean.get("baths", 0),
        "size_m2": clean.get("size_m2"),
        "description": clean.get("description", ""),
        "color": clean.get("color"),
        "amenities": clean.get("amenities", []),
        "day_photos": clean.get("day_photos", []),
        "night_photos": clean.get("night_photos", []),
        "poster": poster,
        "owner_sub": owner_sub,
        "status": status,
        "is_demo": True,
        "sample_data": True,
        "sample_schema_version": schema_version,
        "created_at": created_at,
        "updated_at": updated_at,
        "GSI1PK": f"{clean['type'].upper()}#{clean['sale_mode'].upper()}",
        "GSI1SK": clean["price_ghs"],
        "GSI2PK": status.upper(),
        "GSI2SK": updated_at,
        "GSI3PK": status.upper(),
        "GSI3SK": clean["price_ghs"],
    }
    # Remove optional empty/None attributes; DynamoDB can store nulls, but the
    # API presenters expect absent optional fields to behave naturally.
    return decimal_safe({key: value for key, value in item.items() if value is not None})


def boto3_session(profile: str | None, region: str):
    try:
        import boto3
    except ImportError as exc:
        raise SystemExit("boto3 is required. Install it with: python3 -m pip install boto3") from exc
    return boto3.Session(profile_name=profile, region_name=region) if profile else boto3.Session(region_name=region)


def upload_photos(s3_client: Any, bucket: str, prepared: dict[str, Any], *, dry_run: bool) -> int:
    uploaded = 0
    for kind in ("day", "night"):
        for key, path, content_type in prepared["photos"][kind]:
            print(f"  {'would upload' if dry_run else 'uploading'} {path} -> s3://{bucket}/{key}")
            if not dry_run:
                s3_client.upload_file(
                    str(path),
                    bucket,
                    key,
                    ExtraArgs={
                        "ContentType": content_type,
                        "CacheControl": "private, max-age=300",
                        "Metadata": {"accra-spaces-sample": "true"},
                    },
                )
            uploaded += 1
    return uploaded


def put_listing(table: Any, item: dict[str, Any], *, dry_run: bool) -> None:
    print(f"  {'would put' if dry_run else 'putting'} DynamoDB item {item['listing_id']} ({item['status']})")
    if not dry_run:
        table.put_item(Item=item)


def load_samples(args: argparse.Namespace, manifest: dict[str, Any], prepared: list[dict[str, Any]]) -> None:
    schema_version = str(manifest.get("schema_version", "accra-spaces-sample-v1"))
    if args.dry_run:
        session = None
        s3_client = None
        table = None
    else:
        session = boto3_session(args.profile, args.region)
        s3_client = session.client("s3")
        table = session.resource("dynamodb").Table(args.table)

    total_photos = 0
    print(f"Loading {len(prepared)} sample listings into table={args.table} bucket={args.bucket} region={args.region}")
    for record in prepared:
        print(f"- {record['id']}")
        total_photos += upload_photos(s3_client, args.bucket, record, dry_run=args.dry_run)
        item = build_item(record, status=args.status, owner_sub=args.owner_sub, schema_version=schema_version)
        put_listing(table, item, dry_run=args.dry_run)
    print(f"Done. {'Validated' if args.dry_run else 'Loaded'} {len(prepared)} listings and {total_photos} images.")


def delete_prefix(s3_client: Any, bucket: str, prefix: str, *, dry_run: bool) -> int:
    deleted = 0
    paginator = s3_client.get_paginator("list_objects_v2") if not dry_run else None
    if dry_run:
        print(f"  would delete objects under s3://{bucket}/{prefix}")
        return 0
    for page in paginator.paginate(Bucket=bucket, Prefix=prefix):
        objects = [{"Key": obj["Key"]} for obj in page.get("Contents", [])]
        if not objects:
            continue
        s3_client.delete_objects(Bucket=bucket, Delete={"Objects": objects})
        deleted += len(objects)
    return deleted


def delete_samples(args: argparse.Namespace, prepared: list[dict[str, Any]]) -> None:
    print(f"About to delete {len(prepared)} sample listings from {args.table} and their S3 prefixes in {args.bucket}.")
    if not args.yes and not args.dry_run:
        confirm = input("Type DELETE to continue: ")
        if confirm != "DELETE":
            raise SystemExit("Delete cancelled.")

    if args.dry_run:
        s3_client = None
        table = None
    else:
        session = boto3_session(args.profile, args.region)
        s3_client = session.client("s3")
        table = session.resource("dynamodb").Table(args.table)

    deleted_objects = 0
    for record in prepared:
        listing_id = record["id"]
        print(f"- {listing_id}")
        deleted_objects += delete_prefix(s3_client, args.bucket, f"listings/{listing_id}/", dry_run=args.dry_run)
        print(f"  {'would delete' if args.dry_run else 'deleting'} DynamoDB item {listing_id}")
        if not args.dry_run:
            table.delete_item(Key={"PK": f"LISTING#{listing_id}", "SK": "METADATA"})
    print(f"Done. {'Validated deletion for' if args.dry_run else 'Deleted'} {len(prepared)} listings and {deleted_objects} S3 objects.")


def main() -> None:
    args = parse_args()
    data_file = Path(args.data).resolve()
    manifest = load_manifest(data_file)
    prepared = validate_samples(manifest, data_file)

    if args.delete:
        delete_samples(args, prepared)
    else:
        load_samples(args, manifest, prepared)


if __name__ == "__main__":
    main()
