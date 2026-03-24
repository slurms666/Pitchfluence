import Link from "next/link";

import { Badge } from "@/components/badge";
import { PageHeader } from "@/components/page-header";
import { reseedDemoDataAction } from "@/app/(app)/settings/actions";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const reseeded = getStringValue(params.reseed) === "1";
  const reseedEnabled = process.env.ALLOW_DEMO_RESEED === "true";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Configuration notes for the passcode gate, demo data, and deployment setup."
        actions={reseeded ? <Badge tone="success">Demo data reset</Badge> : null}
      />

      <section className="card-surface space-y-4 p-6">
        <h2 className="text-lg font-semibold text-ink-900">App access gate</h2>
        <p className="text-sm leading-6 text-ink-600">
          Pitchfluence v1 uses a shared passcode instead of full authentication. Set `APP_ACCESS_PASSCODE`
          and `APP_ACCESS_COOKIE_SECRET` in your environment, then share the passcode only with test users.
          The validation happens server-side and the workspace keeps access via an HTTP-only cookie.
        </p>
        <div className="rounded-3xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
          Recommended: set a unique passcode per deployment and rotate it if you share a public preview link.
        </div>
      </section>

      <section className="card-surface space-y-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Demo data reset</h2>
            <p className="text-sm leading-6 text-ink-600">
              Reset and reseed the workspace with the built-in businesses, demo creators, pipeline items, reminders, and drafts.
            </p>
          </div>
          <Badge tone={reseedEnabled ? "success" : "warn"}>
            {reseedEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="rounded-3xl border border-ink-100 bg-ink-50 p-4 text-sm text-ink-700">
          Set `ALLOW_DEMO_RESEED=true` if you want the in-app reseed button. Keep it `false` for normal production demos.
        </div>
        <form action={reseedDemoDataAction}>
          <button className="button-primary" disabled={!reseedEnabled} type="submit">
            Reset demo data
          </button>
        </form>
      </section>

      <section className="card-surface space-y-4 p-6">
        <h2 className="text-lg font-semibold text-ink-900">V1 product scope</h2>
        <ul className="space-y-2 text-sm leading-6 text-ink-600">
          <li>No live creator scraping or platform integrations.</li>
          <li>No email or DM sending automation.</li>
          <li>No subscriptions, billing, or Stripe.</li>
          <li>No paid AI required for scoring or outreach generation.</li>
        </ul>
      </section>

      <section className="card-surface space-y-4 p-6">
        <h2 className="text-lg font-semibold text-ink-900">Deployment notes</h2>
        <p className="text-sm leading-6 text-ink-600">
          Use a Supabase Postgres connection string for `DATABASE_URL` and `DIRECT_URL`, run Prisma migrations,
          seed the demo data, then deploy to Vercel with the same environment variables configured in the project.
        </p>
        <Link className="button-secondary" href="/outreach">
          Return to outreach
        </Link>
      </section>
    </div>
  );
}
