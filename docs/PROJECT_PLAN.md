# Accra Spaces Delivery Plan

## Stage 0 — Foundation (in progress)

- [x] Product identity, repository, README and product boundary
- [x] Architecture, safety and media decisions documented
- [x] Terraform module scaffold: listings store, private photo storage, Cognito auth, budget guardrail
- [ ] Next.js frontend scaffold
- [ ] Lambda API handlers and validation tests
- [ ] CI quality gate for frontend + Lambda

## Stage 1 — AWS Dev Environment

- Bootstrap / confirm Terraform remote state (reuse `osikanyithedev-terraform-state-2026` with a unique key)
- Configure a unique photo bucket name and Cognito domain prefix
- Deploy DynamoDB listings store, private S3 photo bucket, Cognito user pool, Lambda + HTTP API
- Confirm operational email subscription and the $10/month budget guardrail
- Configure the Vercel frontend origin in API/S3 CORS

**No apply until the plan has been reviewed together. See docs/LOCAL_AWS_DEPLOYMENT.md.**

## Stage 2 — Public Search & Listing API

- `GET /listings` search with area / type / rent-vs-sale / price range / beds filters
- `GET /listings/{id}` with masked contact details
- Listing detail page with day/night gallery and full terms
- WhatsApp `wa.me` deep links and click-to-call
- Completeness badge (day+night photos, Digital Address, maintenance policy)

## Stage 3 — Posting, Auth & Media

- Cognito email-verified sign-in for Landlord/Agent/Seeker roles
- `POST /listings` (JWT), draft and publish
- Day/night photo upload via constrained presigned S3 POST (private bucket)
- Viewing requests and offers (JWT), saved searches and favorites
- Basic report + disable moderation path (admin via AWS IAM)

## v2+ (deliberately deferred)

- Real verification/KYC (identity documents) for agents and landlords
- Ratings and reviews
- Featured/boosted listings for monetisation
- In-app chat, email/SMS/WhatsApp alert digests
- Agency/team dashboards and analytics
- Payments for reservation fees — only after trust measures are in place
- Image scanning and watermarking (Lambda + sharp)
- PWA offline support

## Honesty rules

- The visible badge in v1 means **listing completeness**, never verified identity.
- No invented metrics, users, partners or authority integrations — anywhere.
- CivicSignal remains the lead case study in the portfolio until Accra Spaces is genuinely strong.
