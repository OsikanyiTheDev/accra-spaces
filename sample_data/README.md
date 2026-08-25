# Accra Spaces sample data

This folder contains **fictional sample listings** and generated illustrative images for development/testing. They are not real properties, not real availability and should not be represented as verified inventory.

The records are designed to fit the current DynamoDB + private S3 media model:

- 8 published/draft-capable sample listings
- apartments, houses, shops and offices
- rent and sale scenarios
- day and night images for every listing
- sample poster/contact terms that pass validation
- deterministic IDs prefixed with `sample-` so they can be safely reloaded or deleted

## Files

```text
sample_data/
├── listings.json          # Fictional listing manifest
└── images/<listing-id>/   # Generated day/night PNGs

scripts/load_sample_data.py # Local AWS loader/deleter
```

## Prerequisites

Run this from your local clone, using the AWS profile/credentials you already use for Terraform.

```bash
python3 --version
python3 -m pip install boto3
aws sts get-caller-identity
```

From the Terraform environment folder, capture the deployed table and bucket names:

```bash
cd terraform/environments/dev
export LISTINGS_TABLE="$(terraform output -raw listings_table_name)"
export MEDIA_BUCKET="$(terraform output -raw media_bucket_name)"
cd ../../..
```

If you use a named AWS profile:

```bash
export AWS_PROFILE=your-profile-name
export AWS_REGION=us-east-1
```

## Dry run first

```bash
python3 scripts/load_sample_data.py --dry-run
```

This validates the JSON against the same payload rules used by the Lambda API and prints the S3/DynamoDB actions without writing anything.

## Load sample listings

By default, the script writes the listings as `published`, so they appear on the live site after API/Vercel caches refresh.

```bash
python3 scripts/load_sample_data.py
```

Or pass values explicitly:

```bash
python3 scripts/load_sample_data.py \
  --region us-east-1 \
  --table "$LISTINGS_TABLE" \
  --bucket "$MEDIA_BUCKET"
```

To seed them as drafts instead:

```bash
python3 scripts/load_sample_data.py --status draft
```

## Verify

```bash
curl "https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com/listings" | python3 -m json.tool
```

Then open:

```text
https://accraspaces.vercel.app
```

## Remove only the sample data

The delete mode removes only the deterministic `sample-*` listing records from `listings.json` and S3 objects under `listings/<sample-id>/`.

Dry run:

```bash
python3 scripts/load_sample_data.py --delete --dry-run
```

Delete:

```bash
python3 scripts/load_sample_data.py --delete --yes
```

## Safety notes

- Do not use real customer/agent phone numbers in sample data.
- Do not remove the `Sample:` title prefix or the fictional-sample wording from descriptions.
- The loader writes directly to DynamoDB/S3, so review `--dry-run` output before loading.
- The script does not run Terraform and does not need AWS secret values in the repository.
