# Accra Spaces 🏠

> A local-first property discovery platform for Greater Accra — apartments, houses, shops and offices, with clear GHS prices, transparent terms, day & night photos, and WhatsApp-first contact.

[![Next.js](https://img.shields.io/badge/Frontend-Next.js-10242F?style=flat-square)](https://nextjs.org/)
[![Terraform](https://img.shields.io/badge/Infrastructure-Terraform-7043AC?style=flat-square)](https://www.terraform.io/)
[![AWS](https://img.shields.io/badge/Backend-AWS%20Serverless-FF9900?style=flat-square)](https://aws.amazon.com/)
[![Status](https://img.shields.io/badge/status-foundation-087B78?style=flat-square)](./docs/PROJECT_PLAN.md)

## Why Accra Spaces

Discovery is messy: listings are scattered across social media, WhatsApp groups and generic classifieds, with poor filters, outdated posts and hidden terms. Low trust and friction-to-view keep seekers cautious. Most platforms are housing-only, yet people also want shops, offices and mixed-use spaces.

Accra Spaces organises Greater Accra's rentals and sales into one simple, local-first web app:

```text
Search & compare → full transparent detail → book a viewing / make an offer → WhatsApp when it's easier
```

It is intentionally a **private, community-driven platform**, not a government or agency product.

## Current implementation (foundation stage)

- Repository scaffold with product delivery plan, architecture and safety decisions
- Terraform modules for the DynamoDB listings store, private photo storage, Cognito auth and a $10/month AWS budget guardrail
- CI quality gate for Terraform format + validation
- Next.js frontend and Lambda API handlers land in the next milestones (see [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md))

> No AWS infrastructure is deployed yet. The Terraform is defined as code and will be reviewed before any plan is applied.

## Repository layout

```text
accra-spaces/
├── terraform/
│   ├── bootstrap/              # remote state bucket + lock table
│   ├── environments/dev/       # environment composition layer
│   └── modules/                # reusable AWS modules
├── docs/                       # product plan, architecture, safety, deployment
└── .github/workflows/          # CI quality gate
```

## Local development

```bash
npm install     # when the frontend lands
npm run dev
```

### Terraform workflow

```bash
cd terraform/environments/dev
cp terraform.tfvars.example terraform.tfvars
terraform init
terraform fmt -recursive
terraform validate
terraform plan
```

Do not apply until the plan has been reviewed — see [docs/LOCAL_AWS_DEPLOYMENT.md](docs/LOCAL_AWS_DEPLOYMENT.md).

## Trust commitments

- Prices, deposit months, maintenance policy and agent commission shown upfront and honestly
- No invented verification: the badge reflects **listing completeness** (day+night photos, Digital Address, maintenance policy), with a real KYC path planned later
- Exact contact numbers are masked on listing cards and never exposed in list responses
- "Never pay viewing fees; verify before deposits" guidance in the product
- Photo uploads are private, type-limited, size-limited and stored in a private bucket

## Built by

[Osikanyi Nana Yaw Essandoh](https://osikanyi-cloud-portfolio.vercel.app/) — Cloud Engineer · AWS · Terraform · Docker · CI/CD
