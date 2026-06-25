# Pa Ndambi Paul Angemba Memorial

Next.js 16 App Router memorial website for **Celebrating the Life and Legacy of Pa Ndambi Paul Angemba**.

## Current status

Implemented in the repository today:

- Multi-page public memorial experience
- Role-aware admin dashboard and Supabase auth middleware
- Public tribute, team-registration, and donation submission routes
- Pending/approved/rejected/archive moderation flows
- Supabase SQL migrations for runtime content, roles, invitations, and archive integrity
- Stripe Checkout creation plus webhook reconciliation foundation
- Private upload handling and signed admin preview support
- Supabase verification, storage verification, and first-owner bootstrap commands

Still simulated or not fully production-complete:

- Demo fallback content still exists when `ALLOW_DEMO_MODE=true`
- No idempotent live seed script exists yet
- CAPTCHA verification is presence-checked locally, but no live provider verification flow is implemented
- Notification delivery is not wired to a real provider
- Public media publication still depends on moderation data and storage setup; there is no automated derivative pipeline yet
- No Playwright/browser E2E suite is installed yet

Requires live credentials or external services:

- Supabase project URL, anon key, service-role key
- Supabase Auth email delivery if using invitation/bootstrap by email
- Stripe test or live credentials
- CAPTCHA site key and secret if CAPTCHA should be enforced
- Any future email/notification provider credentials

Current production blockers:

- `ALLOW_DEMO_MODE` must be set to `false`
- A real Supabase project must be configured and verified
- The first owner must be bootstrapped and included in `ADMIN_EMAIL_ALLOWLIST`
- Storage bucket privacy must match the expected live configuration
- Seed data process is still missing
- Live CAPTCHA and notification behavior are not yet complete

## Migration order

Apply migrations in filename order:

1. `supabase/migrations/0001_memorial_foundation.sql`
2. `supabase/migrations/0002_runtime_content_and_security.sql`
3. `supabase/migrations/0003_admin_workflows_and_editor_support.sql`
4. `supabase/migrations/0004_admin_ux_archive_and_integrity.sql`
5. `supabase/migrations/0005_admin_users_magic_link_foundation.sql`

The current migrations are additive and later migrations extend earlier schema instead of rewriting it. The one caveat is operational rather than structural: `0005` creates storage buckets with conservative privacy defaults, and `npm run setup:supabase` now reconciles the intended bucket privacy for live usage.

## Environment

Copy `.env.example` to `.env.local` and fill in the values that apply to your environment.

### Application

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NODE_ENV=development
ALLOW_DEMO_MODE=true
```

Production requirements:

- `ALLOW_DEMO_MODE=false`
- `NEXT_PUBLIC_SITE_URL` must be a valid URL
- missing required infrastructure now fails clearly in production

### Supabase

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL_ALLOWLIST=
```

### Stripe

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_DONATION_CURRENCY=usd
```

Stripe is optional for local development, but card donations are not ready unless all three values are set.

### CAPTCHA

```env
NEXT_PUBLIC_CAPTCHA_SITE_KEY=
CAPTCHA_SECRET_KEY=
ALLOW_CAPTCHA_BYPASS=false
```

Production requirement:

- `ALLOW_CAPTCHA_BYPASS=false`

### Upload limits

```env
MAX_IMAGE_UPLOAD_MB=10
MAX_VIDEO_UPLOAD_MB=250
MAX_DOCUMENT_UPLOAD_MB=25
MAX_FILES_PER_SUBMISSION=8
```

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Supabase bootstrap

Safe bootstrap for a fresh project:

```bash
npm run setup:supabase
```

Dry run:

```bash
npm run setup:supabase -- --dry-run
```

What the setup command does:

- validates Supabase environment variables
- checks connectivity
- verifies required storage buckets
- creates missing buckets where safe
- reconciles bucket privacy
- points to next verification and owner-bootstrap steps

What it does not do yet:

- apply SQL migrations for you
- create production admins automatically
- seed the live project with idempotent content

Expected bucket configuration:

- `memorial-private-submissions`: private
- `memorial-public-media`: public
- `memorial-documents`: private

## First owner

Preferred workflow:

1. Create the person in Supabase Auth first, or allow the script to send an invite.
2. Run:

```bash
npm run create:owner -- --email owner@example.com --name "Family Owner"
```

If the Auth user does not already exist:

```bash
npm run create:owner -- --email owner@example.com --name "Family Owner" --invite-if-missing
```

Safety rules enforced by the command:

- refuses to replace an existing active owner
- refuses to proceed when multiple matching Auth users exist
- never accepts a password on the command line
- writes a bootstrap audit entry
- warns if the owner email is missing from `ADMIN_EMAIL_ALLOWLIST`

## Verification commands

Supabase schema and access checks:

```bash
npm run verify:supabase
```

Storage upload/access/publication checks:

```bash
npm run verify:storage
```

Stripe credential sanity check:

```bash
npm run verify:stripe
```

## Deployment notes

No platform-specific deployment manifest is committed yet. The application can be deployed to Vercel or another Node-capable environment, but production deployment should wait until all of these are true:

- all SQL migrations are applied
- `npm run setup:supabase` completes cleanly
- `npm run create:owner` has established the first owner
- `npm run verify:supabase` passes
- `npm run verify:storage` passes
- `ALLOW_DEMO_MODE=false`
- real content or intentional empty states have replaced demo-only assumptions

## Honest gaps

Not completed in this repository yet:

- live public submission test against a configured Supabase project
- live moderation/publication verification against real data
- Stripe end-to-end test payment and webhook replay verification
- live CAPTCHA provider validation
- notification-provider delivery checks
- browser-based end-to-end automation

Those steps need real credentials and/or deployment targets before they can be truthfully marked complete.
