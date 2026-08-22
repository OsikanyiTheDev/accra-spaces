# Terraform Plan Review Log

## Initial development plan — reviewed, not approved for apply

The first AWS development plan reported:

```text
Plan: 135 to add, 0 to change, 0 to destroy.
```

The plan correctly avoided EC2, NAT Gateway, RDS, ALB, VPC and OpenSearch. It used serverless/on-demand services, a private S3 bucket, Cognito, API Gateway, Lambda, DynamoDB, CloudWatch, SNS and an account-level $10 budget alert.

It was **not approved for apply**. Review identified these changes:

1. Configure software-token TOTP explicitly while Cognito MFA is optional.
2. Remove direct `USER_PASSWORD_AUTH` from the public Cognito client; browser password sign-in remains Cognito Hosted UI + SRP/OAuth code with PKCE.
3. Move `cognito-idp:AdminAddUserToGroup` out of the shared API role and into a dedicated `select_role` Lambda role.
4. Disable one-error-alarm-per-Lambda in the cost-conscious dev environment; retain the API 5xx alarm and SNS notification path.
5. Lower dev API throttling to 2 sustained requests/second with a burst of 5.
6. Expire noncurrent S3 media versions after 30 days.

The original saved `tfplan` is invalid after these changes and must never be applied.

## Hardened development plan — approved and applied

The replacement plan reported:

```text
Plan: 120 to add, 0 to change, 0 to destroy.
```

Review confirmed software-token MFA, SRP without direct `USER_PASSWORD_AUTH`, a dedicated restricted role-selection IAM role, API throttling of 2 sustained/5 burst, no per-Lambda alarms, and 30-day noncurrent-media expiration. The exact saved plan was approved and applied successfully on 22 August 2026.

Post-apply verification established these facts:

- Terraform reported `120 added, 0 changed, 0 destroyed`.
- The public health route returned `status: ok` on Python 3.12.
- Public listing search returned an empty list; no inventory was invented or seeded.
- JWT-protected posting returned 401 without a token.
- IAM-only moderation returned 403 without a signed AWS request.
- Localhost CORS was present and an unapproved origin received no allow-origin header.
- Cognito discovery and email/password sign-in were available.
- The media bucket denied anonymous reads.

The AWS budget is an alert, not a hard spending cap, and currently observes account-level AWS cost rather than only Accra Spaces resources.

## Current review gate — authentication branding

Cognito Hosted UI branding is Terraform-managed. Before applying the branding change, review a new plan. Expected scope: an in-place domain setting confirmation if needed and one Cognito UI-customization resource containing only the Accra Spaces logo and CSS. No data, API, Lambda, DynamoDB or S3 replacement is expected.
