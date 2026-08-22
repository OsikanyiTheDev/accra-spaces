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

## Next review gate

After pulling the hardening commit, create a new saved plan. Expected differences from the first plan:

- Cognito user pool includes software-token MFA configuration.
- Cognito client has SRP + refresh flows, without `ALLOW_USER_PASSWORD_AUTH`.
- `select_role` uses a dedicated IAM role with only CloudWatch logging, DynamoDB `PutItem/DeleteItem` on the listings table, and `AdminAddUserToGroup` on the Accra Spaces user pool.
- Shared API role has no Cognito administration permission.
- API stage shows `throttling_rate_limit = 2` and `throttling_burst_limit = 5`.
- No per-Lambda CloudWatch error alarms in dev.
- Media lifecycle includes 30-day noncurrent-version expiration.
- Still zero changes and zero destroys for the first deployment.

The AWS budget is an alert, not a hard spending cap, and currently observes account-level AWS cost rather than only Accra Spaces resources.
