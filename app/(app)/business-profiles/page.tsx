import Link from "next/link";

import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { DeleteButton } from "@/components/delete-button";
import { getBusinessProfiles, getSelectedBusinessProfile, getMissingBusinessFieldsForScoring } from "@/lib/business";
import { formatCampaignGoal, formatCurrencyRange, formatSocialProof } from "@/lib/format";
import { deleteBusinessProfileAction } from "@/app/(app)/business-profiles/actions";

export default async function BusinessProfilesPage() {
  const [businessProfiles, selectedBusiness] = await Promise.all([
    getBusinessProfiles(),
    getSelectedBusinessProfile(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Business Profiles"
        description="Create and manage multiple business profiles in one workspace. The selected profile drives scoring, outreach suggestions, and pipeline context."
        actions={
          <Link className="button-primary" href="/business-profiles/new">
            Create business profile
          </Link>
        }
      />

      {!businessProfiles.length ? (
        <EmptyState
          title="No business profiles yet"
          body="Create your first business profile to unlock creator scoring, pipeline shortlists, and outreach generation."
          action={
            <Link className="button-primary" href="/business-profiles/new">
              Create your first profile
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {businessProfiles.map((business) => {
            const missingFields = getMissingBusinessFieldsForScoring(business);
            const isSelected = business.id === selectedBusiness?.id;

            return (
              <article key={business.id} className="card-surface flex flex-col gap-5 p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold tracking-tight text-ink-900">{business.name}</h2>
                      {isSelected ? <Badge tone="brand">Selected</Badge> : null}
                      {missingFields.length ? <Badge tone="warn">Needs {missingFields.length} scoring fields</Badge> : <Badge tone="success">Scoring ready</Badge>}
                    </div>
                    <p className="text-sm text-ink-600">{business.productOrServiceSummary ?? "Add a summary to make this profile easier to score."}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link className="button-secondary" href={`/business-profiles/${business.id}`}>
                      View
                    </Link>
                    <Link className="button-secondary" href={`/business-profiles/${business.id}/edit`}>
                      Edit
                    </Link>
                  </div>
                </div>

                <dl className="grid gap-4 text-sm text-ink-600 sm:grid-cols-2">
                  <div>
                    <dt className="font-semibold text-ink-900">Campaign goal</dt>
                    <dd>{formatCampaignGoal(business.campaignGoal)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-900">Budget range</dt>
                    <dd>{formatCurrencyRange(business.budgetMin, business.budgetMax)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-900">Target audience</dt>
                    <dd>{business.targetAudience ?? "Not set"}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-ink-900">Social proof</dt>
                    <dd>{formatSocialProof(business.socialProofLevel)}</dd>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between border-t border-ink-100 pt-4">
                  <p className="text-xs text-ink-500">
                    {missingFields.length
                      ? `Complete ${missingFields.join(", ")} before scoring creators.`
                      : "Ready to score creators and generate outreach."}
                  </p>
                  <form action={deleteBusinessProfileAction.bind(null, business.id)}>
                    <DeleteButton
                      className="button-ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                      confirmText={`Delete ${business.name}? This will remove linked matches, pipeline items, notes, and reminders.`}
                      label="Delete"
                    />
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
