# Accra Spaces Deployment Guide

## Environments

| Env | Frontend | Backend | Purpose |
| --- | --- | --- | --- |
| dev | Vercel: <https://accraspaces.vercel.app/> plus local Next.js | AWS `us-east-1`, serverless deployed | Public development preview and integration testing |

**Current status as of 25 August 2026:** the reviewed AWS development environment is deployed, the Vercel frontend is connected, Cognito callback/logout URLs include the Vercel origin, and API Gateway/S3 CORS allow the Vercel origin. The development database has been seeded with 8 clearly labelled fictional sample listings and generated day/night images. This is not a production launch and does not contain real property inventory.

## Frontend (Vercel)

The current Vercel project is connected to the GitHub repository `OsikanyiTheDev/accra-spaces` and deploys from `main`.

Current live dev origin:

```text
https://accraspaces.vercel.app
```

Required Vercel environment variables for the current dev backend:

```env
API_URL=https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_URL=https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com
AUTH_BASE_URL=https://accraspaces.vercel.app
COGNITO_DOMAIN=https://accraspaces-dev-360831508664.auth.us-east-1.amazoncognito.com
COGNITO_CLIENT_ID=4h6fs4ckbqqn6q0rg008ts520a
COGNITO_USER_POOL_ID=us-east-1_0P8yJBqrS
COGNITO_REGION=us-east-1
```

These values are service identifiers/URLs, not AWS credentials. Never add AWS access keys, secret keys or a Cognito app-client secret to Vercel.

If the Vercel domain changes, update all of the following together:

1. `AUTH_BASE_URL` in Vercel.
2. Cognito callback URL: `https://<new-origin>/api/auth/callback`.
3. Cognito logout URL: `https://<new-origin>/`.
4. API/S3 CORS allowed origin: `https://<new-origin>` with no trailing slash.
5. Redeploy Vercel after environment changes.

## Backend (AWS)

Serverless only by design: DynamoDB (PAY_PER_REQUEST), private S3, Lambda (Python 3.12), API Gateway HTTP API, Cognito, CloudWatch and an SNS alarm path are deployed. SES remains deferred.

There is **no EC2, NAT Gateway, RDS or ALB** anywhere in this project. Remote state is shared deliberately: the existing `osikanyithedev-terraform-state-2026` bucket, with the unique key `accra-spaces/dev/terraform.tfstate`.

Current non-secret outputs:

```text
api_url=https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com
listings_table_name=accraspaces-dev-listings
media_bucket_name=accraspaces-media-360831508664-2026
cognito_user_pool_id=us-east-1_0P8yJBqrS
cognito_user_pool_client_id=4h6fs4ckbqqn6q0rg008ts520a
cognito_user_pool_domain_url=https://accraspaces-dev-360831508664.auth.us-east-1.amazoncognito.com
```

## Sample data seeding

Fictional sample listings live in [`sample_data/`](../sample_data/) and are loaded from a local machine using [`scripts/load_sample_data.py`](../scripts/load_sample_data.py). The loader uploads generated realistic day/night JPEGs to the private media bucket and writes deterministic `sample-*` records to DynamoDB.

Quick refresh flow:

```bash
source .venv/bin/activate

cd terraform/environments/dev
export LISTINGS_TABLE="$(terraform output -raw listings_table_name)"
export MEDIA_BUCKET="$(terraform output -raw media_bucket_name)"
cd ../../..

python scripts/load_sample_data.py --delete --yes
python scripts/load_sample_data.py --dry-run
python scripts/load_sample_data.py
```

See [SAMPLE_DATA.md](SAMPLE_DATA.md) for the full safe workflow.

## Verification commands

```bash
curl "https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com/health"
curl "https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com/listings" | python -m json.tool
curl "https://accraspaces.vercel.app/api/auth/session"
```

Expected for the seeded dev environment: health returns `ok`, listings returns 8 `sample-*` records, and the Vercel session route reports `configured: true` for unauthenticated users.

## Timeline gates

- **Before every future Terraform apply:** review the readable `terraform show tfplan` output. Reject any unexpected replacement, destroy or new billable service.
- **Completed:** final Vercel origin was added to API/S3 CORS and Cognito callback/logout URLs through a reviewed in-place Terraform plan.
- **Completed:** fictional sample records and generated images were loaded for frontend review.
- **Before real inventory:** define moderation, retention/deletion, privacy notice and verification language. Do not remove sample labels or claim live availability until real onboarding exists.
- **Never** run `terraform destroy` or rotate the shared state bucket casually — discuss first.
