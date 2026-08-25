# Accra Spaces — Local AWS Deployment Guide

Use this guide on your own computer, where AWS credentials are already configured. **Never paste AWS access keys into GitHub, `.tfvars`, the frontend, Vercel, or chat.**

## 0. Confirm the AWS identity

```bash
aws sts get-caller-identity
```

If you use more than one AWS profile, set the intended development profile first and confirm the account before continuing.

## 1. Clone the repository

```bash
git clone https://github.com/OsikanyiTheDev/accra-spaces.git
cd accra-spaces
```

## 2. State

The dev environment uses the existing bucket with a unique key:

```hcl
terraform {
  backend "s3" {
    bucket       = "osikanyithedev-terraform-state-2026"
    key          = "accra-spaces/dev/terraform.tfstate"
    region       = "us-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
```

Confirm with `aws s3 ls s3://osikanyithedev-terraform-state-2026` that the bucket is accessible. Never reuse another project's state file.

## 3. Configure the environment

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
```

Current dev values use the Vercel origin `https://accraspaces.vercel.app`:

```hcl
media_bucket_name = "accraspaces-media-360831508664-2026"

allowed_origins = [
  "http://localhost:3000",
  "https://accraspaces.vercel.app"
]

alert_email        = "you@example.com"
monthly_budget_usd = 10

cognito_domain_prefix = "accraspaces-dev-360831508664"

auth_callback_urls = [
  "http://localhost:3000/api/auth/callback",
  "https://accraspaces.vercel.app/api/auth/callback"
]

auth_logout_urls = [
  "http://localhost:3000/",
  "https://accraspaces.vercel.app/"
]

api_throttling_rate_limit  = 2
api_throttling_burst_limit = 5
```

Notes:

- `allowed_origins` values are origins only; no trailing slash for the Vercel origin.
- `auth_logout_urls` should include the trailing slash because the app sends `https://accraspaces.vercel.app/`.
- Keep `monthly_budget_usd = 10` unless a larger dev budget is explicitly reviewed.

## 4. Init, format, validate (no AWS writes)

```bash
terraform init
terraform fmt -recursive
terraform validate
```

## 5. Plan — stop here first

```bash
terraform plan -out=tfplan
terraform show tfplan
```

Review it. Expected for the already-deployed dev environment: no destroy, no replacements, and only the exact changes you intended. For a fresh dev deployment, expected resources include DynamoDB table, private S3 bucket, Cognito user pool/domain/groups with optional TOTP, Lambda functions, HTTP API, log groups, one API 5xx alarm/SNS path, and the $10 budget alert. The `select_role` Lambda must have its own restricted IAM role; the shared API role must have no Cognito administration action.

**Not expected:** per-Lambda alarms in dev, EC2, NAT Gateway, RDS, ALB, VPC, OpenSearch, or anything else.

## 6. Before apply

Send or review the readable `terraform show tfplan` output. Confirm: correct account ID, unique bucket + Cognito domain, `accra-spaces/dev/terraform.tfstate`, correct alert email, intentional account-level budget alert (not a hard cap), no unexpected billable resources. Only then:

```bash
terraform apply tfplan
```

## 7. After apply

```bash
terraform output -raw api_url
terraform output -raw cognito_user_pool_id
terraform output -raw cognito_user_pool_client_id
terraform output -raw cognito_user_pool_domain_url
terraform output -raw listings_table_name
terraform output -raw media_bucket_name
```

Use these non-secret identifiers only after the reviewed deployment to populate `.env.local` or Vercel environment variables as described in `docs/AUTHENTICATION.md`. Do not place AWS access keys or secret keys in the web environment.

## 8. Optional: seed fictional sample data

After the backend exists, seed the fictional sample listings from a local virtual environment:

```bash
cd ../../..
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r scripts/requirements.txt

cd terraform/environments/dev
export LISTINGS_TABLE="$(terraform output -raw listings_table_name)"
export MEDIA_BUCKET="$(terraform output -raw media_bucket_name)"
cd ../../..

python scripts/load_sample_data.py --dry-run
python scripts/load_sample_data.py
```

See [SAMPLE_DATA.md](SAMPLE_DATA.md) for refresh/delete commands.
