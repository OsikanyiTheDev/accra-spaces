# Accra Spaces Deployment Guide

## Environments

| Env | Frontend | Backend | Purpose |
| --- | --- | --- | --- |
| dev | Local Next.js connected; Vercel planned | AWS `us-east-1`, serverless deployed | Integration testing |

**Current status:** the reviewed AWS development environment is deployed and its public/security boundary checks pass. Authentication has been tested locally through account opening. There is no Vercel production deployment or real property inventory yet.

## Frontend (Vercel)

1. Import `OsikanyiTheDev/accra-spaces` into Vercel.
2. After the reviewed AWS deployment, set `API_URL`, `NEXT_PUBLIC_API_URL`, `COGNITO_DOMAIN`, `COGNITO_CLIENT_ID`, `COGNITO_USER_POOL_ID`, `COGNITO_REGION` and `AUTH_BASE_URL` from Terraform outputs and the final Vercel origin.
3. Add the exact production callback (`https://<vercel-origin>/api/auth/callback`) and logout URL (`https://<vercel-origin>/`) to Cognito variables.
4. Add the production Vercel origin to `allowed_origins` for API/S3 CORS in a reviewed Terraform plan.
5. Redeploy Vercel after environment changes, then exercise the checklist in [AUTHENTICATION.md](AUTHENTICATION.md).

## Backend (AWS)

Serverless only by design: DynamoDB (PAY_PER_REQUEST), private S3, Lambda (Python 3.12), API Gateway HTTP API, Cognito, CloudWatch and an SNS alarm path are deployed. SES remains deferred.

There is **no EC2, NAT Gateway, RDS or ALB** anywhere in this project. Remote state is shared deliberately: the existing `osikanyithedev-terraform-state-2026` bucket, with the unique key `accra-spaces/dev/terraform.tfstate`.

## Timeline gates

- **Before every future apply:** review the readable `terraform show tfplan` together (see LOCAL_AWS_DEPLOYMENT.md). Reject any unexpected replacement, destroy or billable service.
- **Current local integration:** frontend environment values are connected to the deployed API and Cognito identifiers.
- **Next deployment change:** add the final Vercel origin to API/S3 CORS and Cognito callback/logout URLs through a separate reviewed plan.
- **Never** run `terraform destroy` or rotate the shared state bucket casually — discuss first.
