# Accra Spaces — Local AWS Deployment Guide

Use this guide on your own computer, where AWS credentials are already configured. **Never paste AWS access keys into GitHub, `.tfvars`, the frontend, or chat.**

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

Edit `terraform.tfvars`:

- `media_bucket_name` — unique, e.g. `accraspaces-media-ACCOUNT_ID-2026`
- `allowed_origins` — `["http://localhost:3000"]` initially; the Vercel origin is added later as a second item in a reviewed change
- `alert_email` — your operational email
- `cognito_domain_prefix` — globally unique across Cognito, e.g. `accraspaces-dev-<suffix>`
- `monthly_budget_usd = 10`

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

Review it. Expected: DynamoDB table, private S3 bucket, Cognito user pool/domain/groups, Lambda functions, HTTP API, log groups, alarms, $10 budget. **Not expected:** EC2, NAT Gateway, RDS, ALB, VPC, or anything else.

## 6. Before apply

Send the readable `terraform show tfplan` output for review. Confirm: correct account ID, unique bucket + Cognito domain, `accra-spaces/dev/terraform.tfstate`, correct alert email, intentional budget guardrail, no unexpected billable resources. Only then:

```bash
terraform apply tfplan
```

## 7. After apply

```bash
terraform output -raw api_url
terraform output -raw cognito_user_pool_client_id
```

Keep the API URL private until the frontend `NEXT_PUBLIC_API_URL` is configured and the Vercel domain is added to CORS in a second reviewed change.
