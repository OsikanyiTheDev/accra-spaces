# Accra Spaces 🏠

> A local-first property discovery platform for Greater Accra — apartments, houses, shops and offices, with clear GHS prices, transparent terms, day & night photos, and WhatsApp-first contact.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js-10242F?style=flat-square)](https://nextjs.org/)
[![Terraform](https://img.shields.io/badge/Infrastructure-Terraform-7043AC?style=flat-square)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/Backend-AWS%20Serverless-FF9900?style=flat-square)](https://aws.amazon.com/)
[![Status](https://img.shields.io/badge/status-in%20development-A4702D?style=flat-square)](./docs/PROJECT_PLAN.md)

## Why Accra Spaces

Discovery is messy: listings are scattered across social media, WhatsApp groups and generic classifieds, with poor filters, outdated posts and hidden terms. Low trust and friction-to-view keep seekers cautious. Most platforms are housing-only, yet people also want shops, offices and mixed-use spaces.

Accra Spaces organises Greater Accra's rentals and sales into one simple, local-first web app:

```text
Search & compare → full transparent detail → book a viewing / make an offer → WhatsApp when it is easier
```

It is intentionally an **independent, community-driven product**, not a government, authority, emergency or agency platform.

## Implemented in code

- Responsive Next.js 16 search experience, listing cards and detailed day/night property view
- Structured filters for area, property type, rent/sale, price, bedrooms and sorting
- Clearly labelled illustrative inventory when no API is configured—never presented as real availability
- Local browser favorites, saved searches and listing drafts
- Cognito verified-email/password authorization-code flow with PKCE, verified ID tokens and HTTP-only cookies
- One-time self-selection of Landlord or Agent, always labelled self-declared rather than verified
- Transparent posting form for role, commission, deposit and maintenance terms, wired to authenticated API and media-upload routes
- Python Lambda handlers for public search/detail, listing CRUD, signed media access, viewing requests, offers, favorites, saved searches, role selection, reports and moderation
- Terraform modules for DynamoDB, private S3, Cognito with optional TOTP, Lambda/API Gateway, cost-conscious observability and a $10/month budget alert
- Dedicated least-privilege IAM role for one-time Cognito posting-role selection
- CI gates for frontend lint/types/build, Lambda tests, and Terraform formatting/validation

> **Deployment status:** no AWS infrastructure has been deployed and no real property inventory is claimed. Terraform will be planned on the owner's computer and reviewed before any apply.

## Preview-data behaviour

With no `NEXT_PUBLIC_API_URL`, the web app intentionally renders six illustrative interface examples. Every example and page-level notice identifies them as previews. When an API URL is configured, the app uses only API inventory; if that service is unavailable, it shows an error and does **not** silently substitute demo listings.

## Repository layout

```text
accra-spaces/
├── app/                        # Next.js App Router pages and global design system
├── components/                 # Search, listing, detail and form UI
├── lib/                        # Typed API client, constants and labelled demo data
├── lambda/
│   ├── src/handlers/           # One Lambda handler per API route
│   ├── src/shared/             # Validation, search, media and data helpers
│   └── tests/                  # Standard-library unit tests
├── terraform/
│   ├── bootstrap/              # remote state bucket + lock table
│   ├── environments/dev/       # environment composition layer
│   └── modules/                # reusable AWS modules
├── docs/                       # product plan, architecture, safety and deployment
└── .github/workflows/          # frontend, Lambda and Terraform quality gates
```

## Local development

Requires Node.js 20.9 or newer.

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
python -m unittest discover -s lambda/tests -p 'test_*.py'
```

Copy `.env.example` to `.env.local` only when a reviewed backend deployment provides real values. Do not add AWS credentials to frontend environment files. See [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) for the exact Cognito flow and callback configuration.

### Terraform workflow

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform show tfplan
```

Do not apply until the readable plan has been reviewed — see [docs/LOCAL_AWS_DEPLOYMENT.md](docs/LOCAL_AWS_DEPLOYMENT.md).

## Trust commitments

- Prices, deposit months, maintenance policy and agent commission are structured and shown honestly
- No invented verification: the badge reflects **listing completeness** (day+night photos, Digital Address, maintenance policy), with real KYC deliberately deferred
- Exact contact information is absent from list/search responses and appears only on a selected published listing
- “Never pay viewing fees; verify before deposits” guidance is visible in the product
- Photo storage is private, type-limited and size-limited; browser uploads use constrained presigned requests after deployment
- No invented metrics, users, clients, partners, certifications or authority integrations

## Built by

[Osikanyi Nana Yaw Essandoh](https://osikanyi-cloud-portfolio.vercel.app/) — Cloud Engineer · AWS · Terraform · Docker · Kubernetes · CI/CD
