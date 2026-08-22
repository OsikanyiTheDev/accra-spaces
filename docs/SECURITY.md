# Accra Spaces Security & Safety Decisions

## Product boundary

Accra Spaces is a private, community-driven property discovery platform. It is not a government product, an estate agency, or a rental authority. The UI must never imply that a listing or a badge is an official endorsement.

## Data minimisation (MVP)

The poster provides: name, email, WhatsApp number, role (landlord/agent), property details (title, type, mode, price, deposit months, maintenance policy, area, digital address, size, beds, baths, amenities, description), and photos.

The seeker provides: email (via Cognito), and contact details only when making a viewing request or offer.

**Sensitive data:** no financial account data, no national ID, no home address of the user, no payment details in v1. KYC documents are explicitly deferred to v2 and will live in their own isolated, high-restriction path.

## Public API controls

- API Gateway throttling (burst/rate limits) protects public routes.
- Lambda validation constrains all fields: type, sale mode, price range, beds, text lengths, digital-address pattern, GHS formatting.
- Posting, media presign, viewing requests and offers require a Cognito JWT.
- Moderation (`PATCH /admin/listings/{id}/status`) is AWS IAM authorized only.
- Public list responses never include full phone numbers — contact is masked; the full number is returned only on the detail route for the seeker who opens that listing.

## Contact privacy

- Phone/WhatsApp: masked on cards (e.g. `+233 ** *** 1234`); full number available on the detail page as a deliberate action (WhatsApp CTA or call).
- No listing phone number is returned by `GET /listings` (list endpoint) at all.

## Media controls

- Private bucket: public access block, bucket-owner enforced, SSE, versioning.
- Presigned POST: JPEG/PNG/WebP only, ≤ 5 MB, 5-minute expiry, key bound to listing.
- EXIF stripped; watermarking and image scanning are v2 items (no claims before they exist).

## Trust labelling

- The badge displayed in v1 is a **completeness badge** — factual (day+night photos, Digital Address, maintenance policy). It is never called "Verified" and never implies identity verification, government approval, or a background check.
- Safety guidance is shown in-product: "Never pay viewing fees. Verify identity and ownership before paying deposits."

## Before broad public promotion

1. Decide and implement the passwordless email-OTP sign-in path (custom challenge + SES).
2. Define agent/landlord verification (KYC) scope and storage isolation.
3. Image scanning and harmful-content moderation controls.
4. Retention, deletion and abuse-report policies (incl. Ghana Data Protection Act, Act 843 alignment).
5. Rate-limit monitoring and bot-protection strategy.
6. Threat modelling and accessibility review.
7. Clear privacy notice and terms for posters and seekers.
