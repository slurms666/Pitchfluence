import Link from "next/link";
import { notFound } from "next/navigation";

import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/badge";
import { getMissingBusinessFieldsForScoring, getSelectedBusinessProfile } from "@/lib/business";
import { db } from "@/lib/db";
import { formatCampaignGoal, formatCurrencyRange, formatSocialProof, formatTone } from "@/lib/format";
import { deleteBusinessProfileAction } from "@/app/(app)/business-profiles/actions";

export default async function BusinessProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [business, selectedBusiness, pipelineCount] = await Promise.all([
    db.businessProfile.findUnique({
      where: {
        id,
      },
    }),
    getSelectedBusinessProfile(),
    db.pipelineItem.count({
      where: {
        businessProfileId: id,
      },
    }),
  ]);

  if (!business) {
    notFound();
  }

  const missingFields = getMissingBusinessFieldsForScoring(business);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title={business.name}
        description="This profile drives creator ranking, shortlist decisions, and outreach templates."
        actions={
          <>
            <Link className="button-secondary" href="/business-profiles">
              Back to profiles
            </Link>
            <Link className="button-primary" href={`/business-profiles/${business.id}/edit`}>
              Edit profile
            </Link>
          </>
        }
      />

      <section className="card-surface space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          {business.id === selectedBusiness?.id ? <Badge tone="brand">Selected profile</Badge> : null}
          {missingFields.length ? <Badge tone="warn">Needs {missingFields.length} scoring fields</Badge> : <Badge tone="success">Scoring ready</Badge>}
          <Badge>{pipelineCount} linked pipeline item{pipelineCount === 1 ? "" : "s"}</Badge>
        </div>

        <dl className="grid gap-5 text-sm text-ink-600 lg:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink-900">Website</dt>
            <dd>{business.website ?? "Not set"}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Budget range</dt>
            <dd>{formatCurrencyRange(business.budgetMin, business.budgetMax)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Campaign goal</dt>
            <dd>{formatCampaignGoal(business.campaignGoal)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Social proof</dt>
            <dd>{formatSocialProof(business.socialProofLevel)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Default tone</dt>
            <dd>{formatTone(business.brandToneDefault)}</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink-900">Target region</dt>
            <dd>{business.targetRegion ?? "Not set"}</dd>
          </div>
        </dl>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Summary</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              {business.productOrServiceSummary ?? "No summary yet."}
            </p>
          </div>
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Target audience</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{business.targetAudience ?? "No target audience yet."}</p>
          </div>
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Social proof notes</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{business.socialProofNotes ?? "No social proof notes yet."}</p>
          </div>
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Offer notes</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{business.offerNotes ?? "No offer notes yet."}</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-5">
          <p className="text-sm text-ink-500">
            {missingFields.length
              ? `Complete ${missingFields.join(", ")} before scoring creators.`
              : "This profile is ready for scoring and outreach generation."}
          </p>
          <form action={deleteBusinessProfileAction.bind(null, business.id)}>
            <DeleteButton
              className="button-secondary text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              confirmText={`Delete ${business.name}? This will remove linked matches, pipeline items, notes, reminders, and drafts.`}
              label="Delete profile"
            />
          </form>
        </div>
      </section>
    </div>
  );
}
