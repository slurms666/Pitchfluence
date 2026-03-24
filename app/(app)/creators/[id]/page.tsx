import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/badge";
import { DeleteButton } from "@/components/delete-button";
import { PageHeader } from "@/components/page-header";
import { getSelectedBusinessProfile, getMissingBusinessFieldsForScoring } from "@/lib/business";
import { formatCollaborationType, formatFollowerCount, formatPlatform, formatSourceType } from "@/lib/format";
import { getCreatorPageData } from "@/lib/workspace";
import { deleteCreatorAction, shortlistCreatorAction } from "@/app/(app)/creators/actions";

function ScoreCard({ title, score, body }: { title: string; score: number; body: string }) {
  return (
    <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
        <span className="text-2xl font-semibold tracking-tight text-ink-900">{score}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-ink-600">{body}</p>
    </div>
  );
}

export default async function CreatorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const selectedBusiness = await getSelectedBusinessProfile();
  const data = await getCreatorPageData(id, selectedBusiness?.id);

  if (!data) {
    notFound();
  }

  const { creator, match, pipelineItem, savedDrafts } = data;
  const missingFields = selectedBusiness ? getMissingBusinessFieldsForScoring(selectedBusiness) : [];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Creator Library"
        title={creator.displayName}
        description={creator.bio ?? "Review the creator details, score breakdown, and shortlist actions from here."}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link className="button-secondary" href="/creators">
              Back to creators
            </Link>
            {creator.sourceType === "MANUAL" ? (
              <Link className="button-secondary" href={`/creators/${creator.id}/edit`}>
                Edit
              </Link>
            ) : null}
            <Link
              className="button-primary"
              href={`/outreach?creatorId=${creator.id}${selectedBusiness ? `&businessId=${selectedBusiness.id}` : ""}`}
            >
              Generate outreach
            </Link>
          </div>
        }
      />

      <section className="card-surface space-y-6 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="brand">{formatSourceType(creator.sourceType)}</Badge>
          <Badge>{formatPlatform(creator.platform)}</Badge>
          <Badge>{formatFollowerCount(creator.followerCount)}</Badge>
          {pipelineItem ? <Badge tone="success">Already in pipeline</Badge> : null}
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">About this creator</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{creator.bio ?? "No creator bio added yet."}</p>
            <p className="mt-4 text-sm font-medium text-ink-900">Niche tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {creator.nicheTags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Audience + commercial notes</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              {creator.audienceNotes ?? "No audience notes yet."}
            </p>
            <p className="mt-4 text-sm leading-6 text-ink-600">
              {creator.commercialHistoryNotes ?? "No commercial history notes yet."}
            </p>
          </div>
        </div>

        <div className="grid gap-4 text-sm text-ink-600 lg:grid-cols-2">
          <div>
            <span className="font-semibold text-ink-900">Location:</span> {creator.creatorLocation ?? "Not set"}
          </div>
          <div>
            <span className="font-semibold text-ink-900">Audience region:</span> {creator.targetRegion ?? "Not set"}
          </div>
          <div>
            <span className="font-semibold text-ink-900">Content style:</span> {creator.contentStyle ?? "Not set"}
          </div>
          <div>
            <span className="font-semibold text-ink-900">Contact route:</span> {creator.contactEmailOrContactNote ?? "Not set"}
          </div>
        </div>
      </section>

      {selectedBusiness && match ? (
        <section className="space-y-5">
          <div className="card-surface flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-ink-900">Scored against {selectedBusiness.name}</p>
              <p className="text-sm text-ink-600">
                {missingFields.length
                  ? `Complete ${missingFields.join(", ")} to unlock an honest score.`
                  : match.mainReason}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone={match.fitLevel === "STRONG" ? "success" : match.fitLevel === "POSSIBLE" ? "brand" : "warn"}>
                {match.fitLevel === "STRONG"
                  ? "Strong fit"
                  : match.fitLevel === "POSSIBLE"
                    ? "Possible fit"
                    : "Low fit"}
              </Badge>
              <Badge tone="brand">{formatCollaborationType(match.recommendedCollaborationType)}</Badge>
              <div className="rounded-2xl bg-ink-900 px-4 py-3 text-white">
                <p className="text-xs uppercase tracking-[0.12em] text-white/70">Overall</p>
                <p className="text-2xl font-semibold">{match.overallScore}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <ScoreCard body={match.audienceFitSummary} score={match.audienceFitScore} title="Audience Fit" />
            <ScoreCard body={match.pitchViabilitySummary} score={match.pitchViabilityScore} title="Pitch Viability" />
            <ScoreCard body={match.campaignFitSummary} score={match.campaignFitScore} title="Campaign Fit" />
          </div>

          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="card-surface space-y-4 p-6">
              <div>
                <h2 className="text-lg font-semibold text-ink-900">Guidance</h2>
                <p className="mt-2 text-sm leading-6 text-ink-600">{match.nextStepGuidance}</p>
              </div>
              {match.softWarningMessage ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {match.softWarningMessage}
                </div>
              ) : null}
              <div>
                <p className="text-sm font-semibold text-ink-900">Risk flags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {match.riskFlags.length ? (
                    match.riskFlags.map((flag) => (
                      <Badge key={flag} tone="warn">
                        {flag}
                      </Badge>
                    ))
                  ) : (
                    <Badge tone="success">No strong risk flags</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="card-surface space-y-4 p-6">
              <h2 className="text-lg font-semibold text-ink-900">Next actions</h2>
              {pipelineItem ? (
                <Link className="button-primary w-full" href={`/pipeline/${pipelineItem.id}`}>
                  Open pipeline item
                </Link>
              ) : (
                <form action={shortlistCreatorAction} className="space-y-3">
                  <input name="businessProfileId" type="hidden" value={selectedBusiness.id} />
                  <input name="creatorId" type="hidden" value={creator.id} />
                  <input name="redirectTo" type="hidden" value={`/creators/${creator.id}`} />
                  <button className="button-primary w-full" disabled={Boolean(missingFields.length)} type="submit">
                    Favourite + shortlist
                  </button>
                </form>
              )}
              <Link
                className="button-secondary w-full"
                href={`/outreach?creatorId=${creator.id}&businessId=${selectedBusiness.id}`}
              >
                Generate outreach
              </Link>
              <Link className="button-secondary w-full" href={pipelineItem ? `/pipeline/${pipelineItem.id}` : "/pipeline"}>
                Add note
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="card-surface space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">Recent outreach drafts</h2>
          <Link className="button-secondary" href={`/outreach?creatorId=${creator.id}`}>
            Open outreach
          </Link>
        </div>
        {!savedDrafts.length ? (
          <p className="text-sm text-ink-600">No drafts saved for this creator yet.</p>
        ) : (
          <div className="space-y-3">
            {savedDrafts.map((draft) => (
              <article key={draft.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                <p className="text-sm font-semibold text-ink-900">{draft.subjectLine ?? "Direct message draft"}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-ink-600">{draft.body}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {creator.sourceType === "MANUAL" ? (
        <section className="card-surface flex items-center justify-between p-6">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Manual creator controls</h2>
            <p className="mt-2 text-sm text-ink-600">
              Manual creators can be edited or removed. Demo creators stay read-only so seeded testing remains stable.
            </p>
          </div>
          <form action={deleteCreatorAction.bind(null, creator.id)}>
            <DeleteButton
              className="button-secondary text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              confirmText={`Delete ${creator.displayName}? Linked matches, drafts, and pipeline items will be removed too.`}
              label="Delete creator"
            />
          </form>
        </section>
      ) : null}
    </div>
  );
}
