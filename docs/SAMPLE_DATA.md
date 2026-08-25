# Sample data seeding

Accra Spaces includes a local-only seed workflow for fictional sample listings. The seed files are committed under [`sample_data/`](../sample_data/) and the loader is [`scripts/load_sample_data.py`](../scripts/load_sample_data.py).

Use this only from a trusted local machine with AWS credentials for the development account. The script uploads generated images to the private media bucket and writes deterministic `sample-*` listing records into DynamoDB.

Quick flow:

```bash
cd terraform/environments/dev
export LISTINGS_TABLE="$(terraform output -raw listings_table_name)"
export MEDIA_BUCKET="$(terraform output -raw media_bucket_name)"
cd ../../..

python3 -m pip install boto3
python3 scripts/load_sample_data.py --dry-run
python3 scripts/load_sample_data.py
```

Remove seeded records:

```bash
python3 scripts/load_sample_data.py --delete --yes
```

The sample records are deliberately labelled in titles/descriptions and use `sample-` IDs so the frontend can show them as sample data and they can be cleaned up safely.
