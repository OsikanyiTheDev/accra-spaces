# Accra Spaces Architecture

## Design goal

Make finding, comparing, and visiting a property in Greater Accra transparent and low-friction: clear GHS prices, deposit months, maintenance policy and agent terms presented upfront, day/night photos that tell the truth about lighting and street presence, and contact that matches how people already decide — WhatsApp and calls.

## Request paths

```text
Browser (Next.js on Vercel)
  ↓
API Gateway HTTP API (throttled)
  ↓
Lambda handlers
  ↓
DynamoDB listings store
  ↓
(media) private S3 photo bucket — presigned uploads, signed reads
(auth) Cognito user pool — email-verified roles
(ops)  CloudWatch logs/alarms + $10 monthly budget
```

**Public browse:** `GET /listings` (search) → cards → `GET /listings/{id}` (detail, masked contact).

**Authenticated posting:** Cognito sign-in (Seeker / Landlord / Agent) → `POST /listings` → constrained presigned S3 POST for day/night photos → `draft` → `pending` → `published`.

**Requests:** viewing requests and offers are stored per listing and surfaced to the poster.

## Data model

DynamoDB table `listings` — composite primary key:

```text
PK = LISTING#{listing_id}
SK = METADATA
```

Two global secondary indexes:

```text
GSI browse-index:       GSI1PK = {TYPE}#{SALE_MODE}   (e.g. APARTMENT#RENT)
                        GSI1SK = price_ghs (N)
GSI moderation-index:   GSI2PK = STATUS
                        GSI2SK = updated_at (S)
```

Listing status: `draft → pending → published → disabled | sold` (v1 keeps moderation minimal: report + disable).

Key listing fields: title, type (apartment/house/shop/office), sale_mode (rent/sale), price_ghs, negotiable, area (Greater Accra list), digital_address (validated `AA-000-0000` pattern), beds, baths, size_m2, deposit_months, maintenance_policy, amenities[], description, color/exterior note, day_photos[], night_photos[], poster {role, name, whatsapp, commission {type, value, note}}, completeness flags, status, timestamps, cognito_sub.

Search in v1 uses the browse index plus server-side filtering; the API contract is designed so the index can be swapped (e.g. OpenSearch) without changing the frontend.

## Proposed API surface (v1)

| Route | Access | Purpose |
| --- | --- | --- |
| `GET /health` | Public | Service health |
| `GET /listings` | Public | Filtered search (area, type, mode, price range, beds, sort, pagination) |
| `GET /listings/{id}` | Public | Public detail (contact masked) |
| `POST /listings` | JWT | Create listing (Landlord/Agent) |
| `PATCH /listings/{id}` | JWT | Update own listing |
| `POST /media/presign` | JWT | Constrained presigned photo upload (day/night) |
| `POST /listings/{id}/viewing-requests` | JWT | Structured viewing request (date/time + note) |
| `POST /listings/{id}/offers` | JWT | Offer (GHS amount + note) |
| `POST /listings/{id}/report` | Public (throttled) | Report a listing |
| `GET/DELETE /me/favorites/{id}` | JWT | Favorites |
| `GET/POST /me/saved-searches` | JWT | Saved searches (alerts land in v2) |
| `PATCH /admin/listings/{id}/status` | AWS IAM | Moderate (disable/restore) |

## Key decisions (v1)

| Decision | Choice |
| --- | --- |
| Hosting | Vercel (Next.js) frontend; AWS serverless backend |
| Auth | Cognito, email-verified; passwordless email OTP planned (custom challenge + SES code delivery) before launch; no password-only accounts |
| Roles | Seeker / Landlord / Agent / Admin (Cognito groups) |
| Trust badge | **Completeness badge** (day+night photos, Digital Address, maintenance policy). No "verified" claims without verification. |
| Contact | `wa.me` deep links + click-to-call; full number only on detail page |
| GhanaPost address | Validated text field in v1; GPS lookup only after GhanaPost API access is registered |
| Media | Private S3; presigned POST (JPEG/PNG/WebP ≤ 5 MB, 5-min expiry); day/night pair validation; EXIF stripping; watermarking via Lambda + sharp in v2 |
| Search | DynamoDB GSI + server-side filtering (OpenSearch only if data demands) |
| Alerts | Saved searches stored now; SES digest later |
| Monetisation | None in v1 (no featured/boosted/paid placements) |

## Deferred items

Geocoded maps and distance search, district-level analytics, in-app chat, payments, KYC, reviews, PWA offline. Each is noted in the plan and only built when justified.
