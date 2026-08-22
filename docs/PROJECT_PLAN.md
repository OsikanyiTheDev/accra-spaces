# Accra Spaces Delivery Plan

## Stage 0 — Foundation (complete in code)

- [x] Product identity, repository, README and product boundary
- [x] Architecture, safety and media decisions documented
- [x] Terraform modules: listings store, private photo storage, Cognito auth, Lambda/API, observability and budget guardrail
- [x] Responsive Next.js frontend with search, cards, detail, posting, account and saved-item flows
- [x] Lambda API handlers and validation tests
- [x] CI quality gate for frontend, Lambda and Terraform

The frontend uses clearly labelled illustrative examples until a real API is configured. Completion here means implemented and validated in code—not deployed infrastructure, users or live inventory.

## Stage 1 — AWS Dev Environment (not started)

- [ ] Bootstrap / confirm Terraform remote state (reuse `osikanyithedev-terraform-state-2026` with a unique key)
- [ ] Configure a unique photo bucket name and Cognito domain prefix
- [ ] Generate and review a saved Terraform plan together
- [ ] Deploy DynamoDB, private S3, Cognito, Lambda and HTTP API only after plan approval
- [ ] Confirm operational email subscription and the $10/month budget guardrail
- [ ] Configure the final Vercel origin in API/S3 CORS

**No apply until the plan has been reviewed together. See docs/LOCAL_AWS_DEPLOYMENT.md.**

## Stage 2 — Public Search & Listing Experience (implemented; awaiting deployment/data)

- [x] `GET /listings` search with area / type / rent-vs-sale / price range / beds filters
- [x] Correct newest and broad/narrow price sorting with DynamoDB indexes
- [x] `GET /listings/{id}` public detail with contact absent from list responses
- [x] Listing detail page with day/night gallery, full terms and safety guidance
- [x] WhatsApp `wa.me` and click-to-call logic for real API contact data
- [x] Factual completeness badge (day+night photos, Digital Address, maintenance policy)
- [ ] Replace illustrative examples with moderated real inventory

## Stage 3 — Posting, Auth & Media (implemented in code; deployment testing remains)

- [x] Cognito verified email + password decision documented and configured
- [x] Authorization-code + PKCE flow with verified ID token and HTTP-only cookies
- [x] One-time, atomic self-selection of Landlord or Agent; role explicitly labelled self-declared
- [x] `POST/PATCH /listings` handlers for owner-controlled drafts and publishing
- [x] Day/night photo upload via constrained presigned S3 POST (private bucket)
- [x] Authenticated viewing requests, offers, saved searches and favorites
- [x] Basic public report + AWS IAM moderation path
- [x] Frontend posting, viewing and offer actions connected through an allowlisted server proxy
- [ ] Exercise signup, role selection, posting and request flows against the deployed dev environment
- [ ] Add owner-facing request management UI

## v2+ (deliberately deferred)

- Real verification/KYC (identity documents) for agents and landlords
- Ratings and reviews
- Featured/boosted listings for monetisation
- In-app chat, email/SMS/WhatsApp alert digests
- Agency/team dashboards and analytics
- Payments for reservation fees — only after trust measures are in place
- Image scanning, EXIF stripping and watermarking processing
- PWA offline support

## Honesty rules

- The visible badge in v1 means **listing completeness**, never verified identity.
- No invented metrics, users, partners, authority integrations, clients, certifications or deployments.
- Illustrative interface records must stay labelled and cannot be mistaken for live inventory.
- CivicSignal remains the lead case study in the portfolio until Accra Spaces is genuinely strong.
