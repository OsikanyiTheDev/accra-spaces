# Sample data seeding

Accra Spaces includes a local-only seed workflow for fictional sample listings. The seed files are committed under [`sample_data/`](../sample_data/) and the loader is [`scripts/load_sample_data.py`](../scripts/load_sample_data.py).

Use this only from a trusted local machine with AWS credentials for the development account. The script uploads generated realistic day/night JPEG images to the private media bucket and writes deterministic `sample-*` listing records into DynamoDB.

As of 25 August 2026, the dev environment has been seeded with 8 fictional sample records for frontend review. These are not real properties and must stay labelled as sample data.

## What is included

- 8 fictional listings covering apartments, houses, shops and offices
- Rent and sale examples
- Day and night images for every listing
- Generated realistic property-style JPEGs, not photos of real listed properties
- Deterministic `sample-*` IDs for safe reload/delete
- Placeholder poster/contact values that pass validation but are blocked from live contact actions in the frontend

## Quick flow

```bash
# From the repo root. Use a venv; Ubuntu/Debian blocks system-wide pip installs.
sudo apt update
sudo apt install -y python3-venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r scripts/requirements.txt

cd terraform/environments/dev
export LISTINGS_TABLE="$(terraform output -raw listings_table_name)"
export MEDIA_BUCKET="$(terraform output -raw media_bucket_name)"
cd ../../..

python scripts/load_sample_data.py --dry-run
python scripts/load_sample_data.py
```

If the samples already exist and the images or manifest changed, refresh them cleanly:

```bash
python scripts/load_sample_data.py --delete --dry-run
python scripts/load_sample_data.py --delete --yes
python scripts/load_sample_data.py --dry-run
python scripts/load_sample_data.py
```

## Verify

```bash
curl "https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com/listings" | python -m json.tool
```

Expected seeded dev result: 8 listings with IDs beginning with `sample-`.

Then open:

```text
https://accraspaces.vercel.app
```

If Vercel or signed media URLs appear stale, wait about 60 seconds and hard refresh.

## Remove seeded records

Dry run:

```bash
python scripts/load_sample_data.py --delete --dry-run
```

Delete:

```bash
python scripts/load_sample_data.py --delete --yes
```

The delete path removes only the deterministic records from `sample_data/listings.json` and S3 objects under `listings/<sample-id>/`.

## Safety rules

- Do not use real customer/agent phone numbers in sample data.
- Do not remove the `Sample:` title prefix or fictional-sample wording from descriptions.
- Do not claim sample records are live availability.
- Keep sample IDs prefixed with `sample-` so the frontend can label and block contact actions.
- The loader writes directly to DynamoDB/S3, so review `--dry-run` output before loading.
- The script does not run Terraform and does not need AWS secret values in the repository.
