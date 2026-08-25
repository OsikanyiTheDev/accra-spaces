# Accra Spaces Authentication

## V1 decision

Accra Spaces uses **Amazon Cognito verified email + password**. Passwordless email OTP is not part of the v1 plan.

Passwords, confirmation codes and recovery stay inside Cognito Hosted UI. The application receives OAuth tokens only after Cognito completes authentication.

## Branded sign-in experience

The Cognito classic Hosted UI remains the security boundary, but Terraform applies the Accra Spaces wordmark and a constrained CSS theme from `terraform/modules/auth/assets/`. The palette uses cream, walnut, earth and gold to match the product frontend instead of Cognito's default blue styling. This is presentation-only: callback validation, PKCE and token handling remain unchanged.

Current dev Hosted UI domain:

```text
https://accraspaces-dev-360831508664.auth.us-east-1.amazoncognito.com
```

## Browser flow

```text
Browser
  → GET /api/auth/login
  → state + PKCE verifier stored in short-lived HTTP-only cookies
  → Cognito Hosted UI /oauth2/authorize
  → GET /api/auth/callback?code=…&state=…
  → state checked
  → code exchanged server-side with PKCE verifier
  → ID token verified against Cognito JWKS (signature, issuer, audience, token_use)
  → short-lived ID/access tokens stored in HttpOnly + SameSite=Lax cookies
  → /account
```

The access token is not returned to client JavaScript. Mutating browser requests use `/api/backend/[...path]`, which allows only the specific route/method combinations required by the product. API Gateway performs independent JWT validation.

No refresh token is retained by the current web session. When the short-lived Cognito session expires, the user signs in again. Refresh handling can be added later only with an explicit storage and rotation review.

## Roles

All authenticated users can act as seekers. A user who wants to post makes a **one-time choice**:

- `Landlord`
- `Agent`

`POST /me/role` records the choice with a conditional DynamoDB write, then adds the corresponding Cognito group. If the write already exists, the API returns a conflict and will not change the role. The user signs in again to receive a token containing the new group claim.

These are self-declared capability labels. They are never described as identity, agency, ownership or KYC verification. `Admin` is never self-selectable and remains manually assigned.

## Required server environment

Generic shape:

```text
AUTH_BASE_URL=https://your-final-app-origin
API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com
COGNITO_DOMAIN=https://your-prefix.auth.us-east-1.amazoncognito.com
COGNITO_CLIENT_ID=…
COGNITO_USER_POOL_ID=…
COGNITO_REGION=us-east-1
```

Current deployed dev/Vercel values:

```env
AUTH_BASE_URL=https://accraspaces.vercel.app
API_URL=https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com
NEXT_PUBLIC_API_URL=https://ibq4ytc18j.execute-api.us-east-1.amazonaws.com
COGNITO_DOMAIN=https://accraspaces-dev-360831508664.auth.us-east-1.amazoncognito.com
COGNITO_CLIENT_ID=4h6fs4ckbqqn6q0rg008ts520a
COGNITO_USER_POOL_ID=us-east-1_0P8yJBqrS
COGNITO_REGION=us-east-1
```

These identifiers and URLs are not AWS credentials. Never place AWS access keys, secret keys or a Cognito app-client secret in the web environment. The Terraform web client is intentionally created without a client secret because it uses PKCE.

## Callback and logout URLs

Local development:

```text
Callback: http://localhost:3000/api/auth/callback
Logout:   http://localhost:3000/
```

Current Vercel development preview:

```text
Callback: https://accraspaces.vercel.app/api/auth/callback
Logout:   https://accraspaces.vercel.app/
```

The callback/logout URLs must match exactly in Cognito. The API/S3 CORS allowed origin uses the origin only, without a trailing slash:

```text
https://accraspaces.vercel.app
```

## Deployment test checklist

Before broad public promotion:

1. New account confirms email before sign-in.
2. Invalid/missing OAuth state is rejected.
3. Callback and logout URLs match exactly.
4. Seeker can favorite, save, request a viewing and make an offer on a non-sample published listing.
5. Sample listings remain visibly labelled and cannot be contacted/requested.
6. Role can be selected once and cannot be changed through the public endpoint.
7. Agent cannot create a listing without commission terms.
8. New login after role selection contains the correct Cognito group.
9. Expired tokens fail cleanly and require sign-in again.
10. Admin cannot be self-selected.
11. Browser JavaScript cannot read Cognito tokens.
