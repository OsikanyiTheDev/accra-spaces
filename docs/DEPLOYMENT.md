# Accra Spaces Deployment Guide

## Environments

| Env | Frontend | Backend | Purpose |
| --- | --- | --- | --- |
| dev | Vercel (planned) | AWS `us-east-1`, serverless (planned) | Development target |

**Current status:** neither the AWS environment nor a Vercel production deployment is claimed by this repository. The app runs locally with labelled illustrative data until deployment decisions are approved.

## Frontend (Vercel)

1. Import `OsikanyiTheDev/accra-spaces` into Vercel.
2. After the reviewed AWS deployment, set `API_URL`, `NEXT_PUBLIC_API_URL`, `COGNITO_DOMAIN`, `COGNITO_CLIENT_ID`, `COGNITO_USER_POOL_ID`, `COGNITO_REGION` and `AUTH_BASE_URL` from Terraform outputs and the final Vercel origin.
3. Add the exact production callback (`https://<vercel-origin>/api/auth/callback`) and logout URL (`https://<vercel-origin>/`) to Cognito variables.
4. Add the production Vercel origin to `allowed_origins` for API/S3 CORS in a reviewed Terraform plan.
5. Redeploy Vercel after environment changes, then exercise the checklist in [AUTHENTICATION.md](AUTHENTICATION.md).

## Backend (AWS)

Serverless only by design: DynamoDB (PAY_PER_REQUEST), private S3, Lambda (Python 3.12), API Gateway HTTP API, Cognito, CloudWatch, optional SNS/SES later.

There is **no EC2, NAT Gateway, RDS or ALB** anywhere in this project. Remote state is shared deliberately: the existing `osikanyithedev-terraform-state-2026` bucket, with the unique key `accra-spaces/dev/terraform.tfstate`.

## Timeline gates

- **Before any apply:** review the readable `terraform show tfplan` together (see LOCAL_AWS_DEPLOYMENT.md). Confirm account ID, bucket name uniqueness, Cognito domain prefix uniqueness, allowed origins, alert email, and that no unexpected billable resources appear.
- **After apply:** set frontend env vars, then add the Vercel origin to CORS in a second reviewed change.
- **Never** run `terraform destroy` or rotate the shared state bucket casually — discuss first.
