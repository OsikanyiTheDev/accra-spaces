# Accra Spaces Deployment Guide

## Environments

| Env | Frontend | Backend | Purpose |
| --- | --- | --- | --- |
| dev | Vercel preview/production (Hobby) | AWS `us-east-1`, serverless | Live development deployment |

## Frontend (Vercel)

1. Import `OsikanyiTheDev/accra-spaces` into Vercel.
2. Set `NEXT_PUBLIC_API_URL` from the API Gateway output (after the AWS deployment is reviewed).
3. Add the production Vercel domain to `allowed_origins` in `terraform.tfvars` (a second, reviewed change — not the initial apply).

## Backend (AWS)

Serverless only by design: DynamoDB (PAY_PER_REQUEST), private S3, Lambda (Python 3.12), API Gateway HTTP API, Cognito, CloudWatch, optional SNS/SES later.

There is **no EC2, NAT Gateway, RDS or ALB** anywhere in this project. Remote state is shared deliberately: the existing `osikanyithedev-terraform-state-2026` bucket, with the unique key `accra-spaces/dev/terraform.tfstate`.

## Timeline gates

- **Before any apply:** review the readable `terraform show tfplan` together (see LOCAL_AWS_DEPLOYMENT.md). Confirm account ID, bucket name uniqueness, Cognito domain prefix uniqueness, allowed origins, alert email, and that no unexpected billable resources appear.
- **After apply:** set frontend env vars, then add the Vercel origin to CORS in a second reviewed change.
- **Never** run `terraform destroy` or rotate the shared state bucket casually — discuss first.
