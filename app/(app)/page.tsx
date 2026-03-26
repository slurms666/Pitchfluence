import Link from "next/link";

import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getSelectedBusinessProfile, getMissingBusinessFieldsForScoring } from "@/lib/business";
import { formatCollaborationType, formatDate, formatDueLabel, formatRelativeDate } from "@/lib/format";
import { getDashboardSnapshot } from "@/lib/workspace";

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint: string;
}) {
  return (
    <article className="card-surface p-5">
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-500">{label}</p>
      <p className="mt-3 font-display text-[2rem] font-semibold leading-none text-ink-900">{value}</p>
      <p className="mt-3 text-sm leading-6 text-ink-600">{hint}</p>
    </article>
  );
}

export default async function DashboardPage() {
  const selectedBusiness = await getSelectedBusinessProfile();
  const dashboard = await getDashboardSnapshot(selectedBusiness?.id);

  if (!dashboard.totalBusinessProfiles) {
    return (
      <div className="space-y-8">
        <PageHeader
          eyebrow="Workspace"
          title="Dashboard"
          description="Pitchfluence becomes useful as soon as you add a business profile and start comparing creators against it."
        />
        <EmptyState
          title="Create your first business profile"
          body="Once you have a profile in place, the dashboard will show creator scores, shortlisted opportunities, reminders, and recent activity."
          action={
            <Link className="button-primary" href="/business-profiles/new">
              Create business profile
            </Link>
          }
        />
      </div>
    );
  }

  const missingFields = selectedBusiness ? getMissingBusinessFieldsForScoring(selectedBusiness) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="A quick overview of the active workspace, including the selected business profile, shortlist pipeline, and the best next creator opportunities."
        actions={
          <>
            <Link className="button-secondary" href="/creators/new">
              Add creator
            </Link>
            <Link className="button-primary" href="/business-profiles/new">
              Create business profile
            </Link>
          </>
        }
      />

      <section className="card-surface space-y-4 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-ink-900">Current selected business profile</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink-900">
              {selectedBusiness?.name ?? "No business selected"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-ink-600">
              {selectedBusiness?.productOrServiceSummary ??
                "Pick or create a business profile to score creators and generate better outreach."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedBusiness ? (
              missingFields.length ? (
                <Badge tone="warn">Needs {missingFields.length} scoring fields</Badge>
              ) : (
                <Badge tone="success">Scoring ready</Badge>
              )
            ) : (
              <Badge tone="warn">No active business profile</Badge>
            )}
            {selectedBusiness?.campaignGoal ? <Badge tone="brand">{selectedBusiness.campaignGoal.replaceAll("_", " ").toLowerCase()}</Badge> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard hint="Profiles you can switch between in this workspace." label="Business profiles" value={dashboard.totalBusinessProfiles} />
        <MetricCard hint="Total creators across demo and manual sources." label="Creators" value={dashboard.totalCreators} />
        <MetricCard hint={`${dashboard.totalDemoCreators} demo, ${dashboard.totalManualCreators} manual`} label="Library mix" value={dashboard.totalDemoCreators} />
        <MetricCard hint="Creators currently sitting in the Shortlisted stage." label="Shortlisted" value={dashboard.shortlistedCount} />
        <MetricCard hint="Pipeline items that still need attention." label="Active pipeline" value={dashboard.activePipelineCount} />
        <MetricCard hint="Open reminders due in the next 7 days." label="Due soon" value={dashboard.remindersDueSoonCount} />
        <MetricCard hint="Jump into creator scoring and outreach quickly." label="Quick link" value="Score creators" />
        <MetricCard hint="Use the outreach page to save channel-specific drafts." label="Next step" value="Draft outreach" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-ink-900">Top matched creators</h2>
              <p className="text-sm text-ink-600">
                Ranked for {selectedBusiness?.name ?? "the selected business"} using deterministic scoring.
              </p>
            </div>
            <Link className="button-secondary" href="/creators">
              Browse creators
            </Link>
          </div>

          {!dashboard.topMatches.length ? (
            <p className="text-sm text-ink-600">Choose a scoring-ready business profile to see ranked matches here.</p>
          ) : (
            <div className="space-y-3">
              {dashboard.topMatches.map(({ creator, match, pipelineItem }) => (
                <article key={creator.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <Link className="text-base font-semibold text-ink-900 hover:text-brand-700" href={`/creators/${creator.id}`}>
                        {creator.displayName}
                      </Link>
                      <p className="text-sm text-ink-600">{match.mainReason}</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={match.fitLevel === "STRONG" ? "success" : match.fitLevel === "POSSIBLE" ? "brand" : "warn"}>
                          {match.fitLevel === "STRONG"
                            ? "Strong fit"
                            : match.fitLevel === "POSSIBLE"
                              ? "Possible fit"
                              : "Low fit"}
                        </Badge>
                        <Badge>{formatCollaborationType(match.recommendedCollaborationType)}</Badge>
                        {pipelineItem ? <Badge tone="brand">In pipeline</Badge> : null}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-ink-900 px-4 py-3 text-white">
                      <p className="text-xs uppercase tracking-[0.12em] text-white/70">Overall</p>
                      <p className="text-2xl font-semibold">{match.overallScore}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <section className="card-surface space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">Recent activity</h2>
                <p className="text-sm text-ink-600">What has changed in the workspace most recently.</p>
              </div>
              <Link className="button-secondary" href="/pipeline">
                View pipeline
              </Link>
            </div>

            <div className="space-y-3">
              {dashboard.recentActivities.length ? (
                dashboard.recentActivities.map((activity) => (
                  <article key={activity.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                    <p className="text-sm font-semibold text-ink-900">{activity.message}</p>
                    <p className="mt-1 text-sm text-ink-600">
                      {activity.pipelineItem.creator.displayName} for {activity.pipelineItem.businessProfile.name}
                    </p>
                    <p className="mt-2 text-xs text-ink-500">{formatRelativeDate(activity.createdAt)}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink-600">No activity logged yet.</p>
              )}
            </div>
          </section>

          <section className="card-surface space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">Reminders due soon</h2>
                <p className="text-sm text-ink-600">Simple in-app reminders to keep outreach moving.</p>
              </div>
              <Link className="button-secondary" href="/pipeline">
                View all reminders
              </Link>
            </div>

            <div className="space-y-3">
              {dashboard.remindersDueSoon.length ? (
                dashboard.remindersDueSoon.map((reminder) => (
                  <article key={reminder.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{reminder.title}</p>
                        <p className="mt-1 text-sm text-ink-600">
                          {reminder.pipelineItem.creator.displayName} for {reminder.pipelineItem.businessProfile.name}
                        </p>
                      </div>
                      <Badge tone="warn">{formatDueLabel(new Date(reminder.dueDate))}</Badge>
                    </div>
                    <p className="mt-3 text-xs text-ink-500">Due {formatDate(reminder.dueDate)}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink-600">No reminders due in the next week.</p>
              )}
            </div>
          </section>
        </div>
      </section>

      <section className="card-surface p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Quick links</h2>
            <p className="text-sm text-ink-600">Common next steps for a first-time workspace walkthrough.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link className="button-secondary" href="/business-profiles/new">
              Create Business Profile
            </Link>
            <Link className="button-secondary" href="/creators/new">
              Add Creator
            </Link>
            <Link className="button-secondary" href="/creators">
              Browse Demo Creators
            </Link>
            <Link className="button-primary" href="/pipeline">
              View Pipeline
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
