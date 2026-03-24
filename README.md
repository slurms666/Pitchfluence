# Pitchfluence

Pitchfluence is a small-business influencer outreach copilot for solo operators and small teams.

V1 is intentionally narrow and honest:

- Multiple business profiles inside one single-user workspace
- Demo creator library plus manual creator entry
- Deterministic creator scoring with transparent breakdowns
- Favourite-to-shortlist pipeline behaviour
- Outreach generation for email, Instagram DM, and TikTok DM without paid AI
- Notes, activity history, and in-app reminders/tasks

V1 does **not** include live discovery, scraping, platform integrations, message sending, billing, subscriptions, or team auth.

## Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- Supabase Postgres
- Server Actions
- Vitest for unit tests
- Playwright for end-to-end tests

## Core Product Areas

- `Dashboard`
- `Business Profiles`
- `Creators`
- `Match Scoring`
- `Pipeline`
- `Outreach`
- `Notes / Activity / Reminders`
- `Settings`

## Passcode Gate

There is no full user auth provider in v1.

Instead, the app is protected with a shared passcode gate:

- users enter a passcode on `/access`
- the passcode is validated server-side against `APP_ACCESS_PASSCODE`
- access is stored in an HTTP-only cookie
- this is designed for lightweight protection of a public test deployment, not enterprise security

## Scoring Logic

Scoring is deterministic, rules-based, and transparent.

Every business/creator pairing produces:

- `Audience Fit Score`
- `Pitch Viability Score`
- `Campaign Fit Score`
- `Overall Score`
- `fit_level`
- `recommended_collaboration_type`
- `main_reason`
- `soft_warning_message`
- `risk_flags`
- `next_step_guidance`

Weighting:

- Audience Fit: `35%`
- Pitch Viability: `40%`
- Campaign Fit: `25%`

Important v1 behaviour:

- low pitch viability caps the overall score, even if audience overlap is strong
- budget realism and social proof matter heavily
- the engine avoids fake precision and unavailable analytics
- favourites automatically create a pipeline item in `Shortlisted`

The main logic lives in [lib/scoring.ts](/C:/Users/work/Desktop/Projects/Influencer%20Promo%20App/lib/scoring.ts).

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

Copy `.env.example` to `.env.local` and fill in real values:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
APP_ACCESS_PASSCODE="your-shared-passcode"
APP_ACCESS_COOKIE_SECRET="a-long-random-secret"
ALLOW_DEMO_RESEED="false"
NEXT_PUBLIC_APP_NAME="Pitchfluence"
```

### 3. Provision Supabase Postgres

Create a Supabase project and use its Postgres connection strings for:

- `DATABASE_URL`
- `DIRECT_URL`

Recommended:

- use the pooled connection string for `DATABASE_URL`
- use the direct connection string for `DIRECT_URL`

### 4. Run Prisma migration

```bash
npm run prisma:migrate -- --name init
```

### 5. Seed demo data

```bash
npm run db:seed
```

This seeds:

- 3 business profiles
- 13 creators total, including a broad demo library
- stored creator matches
- sample pipeline items
- notes
- reminders
- sample outreach drafts

### 6. Start the app

```bash
npm run dev
```

Open `http://localhost:3000/access` and enter your shared passcode.

## Useful Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run prisma:migrate -- --name init
npm run db:seed
npm run db:reset
```

## Testing

### Unit tests

Runs deterministic business logic tests for:

- scoring
- collaboration type recommendations
- outreach template generation

```bash
npm run test:unit
```

### End-to-end tests

Playwright covers the critical flow:

1. enter the app via passcode
2. view the dashboard
3. create a business profile
4. browse creators
5. add a manual creator
6. score a creator
7. favourite and confirm a pipeline item in `Shortlisted`
8. generate outreach
9. add a note
10. create a reminder
11. move the creator through the pipeline
12. verify kanban and table views load

Before running Playwright:

- make sure the database is migrated and seeded
- make sure `APP_ACCESS_PASSCODE` is set in the environment used for the test run

Then run:

```bash
npm run test:e2e
```

If you already have the app running elsewhere, set `PLAYWRIGHT_BASE_URL` first and Playwright will use that instead of starting a local dev server.

## Deployment to Vercel

1. Push this repo to GitHub.
2. Create a Vercel project from the repo.
3. Add these environment variables in Vercel:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `APP_ACCESS_PASSCODE`
   - `APP_ACCESS_COOKIE_SECRET`
   - `ALLOW_DEMO_RESEED` if needed
   - `NEXT_PUBLIC_APP_NAME`
4. Run Prisma migration against the production database.
5. Seed demo data if you want the deployment to be immediately testable.
6. Deploy.

Builds are Vercel-ready and pass with `npm run build`.

## Demo Reset

The Settings page includes an in-app demo reset button only when:

```env
ALLOW_DEMO_RESEED=true
```

Keep this off for normal demos unless you explicitly want a reset control in the UI.

## Notes on Architecture

- Prisma models are separated cleanly by concern:
  - `BusinessProfile`
  - `Creator`
  - `CreatorMatch`
  - `PipelineItem`
  - `OutreachDraft`
  - `Note`
  - `Activity`
  - `Reminder`
- creators are reusable across multiple business profiles
- matches are stored separately from creators
- pipeline items are separate from both creators and matches
- outreach stays fully functional without AI

## Out of Scope in V1

- creator sign-up
- live discovery
- scraping
- email sending
- DM automation
- notifications
- cron jobs
- subscriptions
- Stripe
- public marketplace
- advanced auth and permissions

## Repo Notes

- `.env.example` is included
- seed script lives in [prisma/seed.ts](/C:/Users/work/Desktop/Projects/Influencer%20Promo%20App/prisma/seed.ts)
- demo data logic lives in [lib/demo-seed.ts](/C:/Users/work/Desktop/Projects/Influencer%20Promo%20App/lib/demo-seed.ts)
- outreach templates live in [lib/outreach.ts](/C:/Users/work/Desktop/Projects/Influencer%20Promo%20App/lib/outreach.ts)
