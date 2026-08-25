# Accra Spaces Security & Safety Decisions

## Product boundary

Accra Spaces is an independent, community-driven property discovery platform. It is not a government product, an estate agency, or a rental authority. The UI must never imply that a listing or a badge is an official endorsement.

## Data minimisation (MVP)

The poster provides: name, email, WhatsApp number, role (landlord/agent), property details (title, type, mode, price, deposit months, maintenance policy, area, digital address, size, beds, baths, amenities, description), and photos.

The seeker provides: email (via Cognito), and contact details only when making a viewing request or offer.

**Sensitive data:** no financial account data, no national ID, no home address of the user, no payment details in v1. KYC documents are explicitly deferred to v2 and will live in their own isolated, high-restriction path.

## Authentication and session controls

- Cognito Hosted UI owns password entry, email verification and recovery; Accra Spaces does not receive or store user passwords. The public client uses SRP and does not enable direct `USER_PASSWORD_AUTH`.
- OAuth uses the authorization-code flow with PKCE plus a short-lived, HTTP-only state cookie.
- MFA is optional but explicitly supports software-token TOTP; SMS MFA is not configured.
- The callback verifies the ID token signature, issuer, audience and token use against Cognito JWKS before creating a session.
- ID and access tokens use short-lived `HttpOnly`, `SameSite=Lax`, path-scoped cookies; no token is exposed to browser JavaScript and no unused refresh token is retained.
- Authenticated browser requests pass through an explicit route/method allowlist, not an open proxy. API Gateway independently verifies the access token.
- Landlord/Agent is a one-time self-declared capability. A conditional DynamoDB write prevents role changes or duplicate selection before the matching Cognito group is added. Admin remains manually assigned.
- Only the dedicated `select_role` Lambda execution role can call `AdminAddUserToGroup`; public browsing and listing handlers have no Cognito administration permission.

## Public API controls

- API Gateway throttling (burst/rate limits) protects public routes.
- Lambda validation constrains all fields: type, sale mode, price range, beds, text lengths, digital-address pattern, GHS formatting.
- Posting, media presign, viewing requests and offers require a Cognito JWT.
- Moderation (`PATCH /admin/listings/{id}/status`) is AWS IAM authorized only.
- Public list responses include no phone or WhatsApp fields; full poster contact is returned only on the detail route for a published listing that a seeker deliberately opens.

## Contact privacy

- Phone/WhatsApp is absent from cards and `GET /listings`; the full number is available only on the published detail page as a deliberate action (WhatsApp CTA or call).
- Internal owner identifiers are never exposed by either public presenter.

## Media controls

- Private bucket: public access block, bucket-owner enforced, SSE, versioning.
- Presigned POST: JPEG/PNG/WebP only, ≤ 5 MB, 5-minute expiry, key bound to listing.
- EXIF stripping, image scanning and watermarking are not implemented; they remain launch/v2 work and are not claimed by the product.

## Trust labelling

- The badge displayed in v1 is a **completeness badge** — factual (day+night photos, Digital Address, maintenance policy). It is never called "Verified" and never implies identity verification, government approval, or a background check.
- Fictional sample records use deterministic `sample-*` IDs, `Sample:` titles and development-only descriptions. The frontend labels them as sample data and disables WhatsApp, call, viewing-request and offer actions for them.
- Safety guidance is shown in-product: "Never pay viewing fees. Verify identity and ownership before paying deposits."

## Before broad public promotion

1. Exercise verified-email signup, callback state validation, role selection, token expiry and logout against the deployed dev user pool.
2. Define agent/landlord verification (KYC) scope and storage isolation before any verified-identity feature is claimed.
3. Image scanning and harmful-content moderation controls.
4. Retention, deletion and abuse-report policies (including Ghana Data Protection Act, Act 843 alignment).
5. Rate-limit monitoring and bot-protection strategy.
6. Threat modelling, dependency review and accessibility review.
7. Clear privacy notice and terms for posters and seekers.
