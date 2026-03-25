import Link from "next/link";

import { Badge } from "@/components/badge";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getSelectedBusinessProfile } from "@/lib/business";
import { pipelineStageLabels, pipelineStageValues } from "@/lib/constants";
import {
  formatCollaborationType,
  formatDate,
  formatPipelineStage,
  formatRelativeDate,
} from "@/lib/format";
import { getPipelinePageData } from "@/lib/workspace";
import { updatePipelineStageAction } from "@/app/(app)/pipeline/actions";

type SearchParams = Record<string, string | string[] | undefined>;

function getStringValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const selectedBusiness = await getSelectedBusinessProfile();
  const view = getStringValue(params.view) || "kanban";
  const businessProfileId = getStringValue(params.businessProfileId) || selectedBusiness?.id || "";
  const stage = getStringValue(params.stage);
  const sort = getStringValue(params.sort) || "stage";
  const { businessProfiles, items, grouped } = await getPipelinePageData({
    businessProfileId: businessProfileId || null,
    stage: stage || null,
    sort,
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mini CRM"
        title="Pipeline"
        description="Track shortlisted creators through a simple SaaS-style pipeline with notes, reminders, activity history, and saved outreach drafts."
        actions={
          <>
            <Link className={view === "kanban" ? "button-primary" : "button-secondary"} href={`/pipeline?view=kanban${businessProfileId ? `&businessProfileId=${businessProfileId}` : ""}`}>
              Kanban view
            </Link>
            <Link className={view === "table" ? "button-primary" : "button-secondary"} href={`/pipeline?view=table${businessProfileId ? `&businessProfileId=${businessProfileId}` : ""}`}>
              Table view
            </Link>
          </>
        }
      />

      <section className="card-surface space-y-4 p-6">
        <form className="grid gap-3 lg:grid-cols-4" method="get">
          <input name="view" type="hidden" value={view} />
          <select className="select" defaultValue={businessProfileId} name="businessProfileId">
            <option value="">All businesses</option>
            {businessProfiles.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name}
              </option>
            ))}
          </select>
          <select className="select" defaultValue={stage} name="stage">
            <option value="">All stages</option>
            {pipelineStageValues.map((value) => (
              <option key={value} value={value}>
                {pipelineStageLabels[value]}
              </option>
            ))}
          </select>
          <select className="select" defaultValue={sort} name="sort">
            <option value="stage">Sort by stage</option>
            <option value="creator">Sort by creator</option>
            <option value="score">Sort by score</option>
            <option value="updated">Sort by updated</option>
          </select>
          <div className="flex gap-3">
            <button className="button-primary" type="submit">
              Apply
            </button>
            <Link className="button-secondary" href={`/pipeline?view=${view}`}>
              Reset
            </Link>
          </div>
        </form>
      </section>

      {!items.length ? (
        <EmptyState
          title="No pipeline items yet"
          body="Favourite a creator from the creator library to automatically create a pipeline item in Shortlisted."
          action={
            <Link className="button-primary" href="/creators">
              Browse creators
            </Link>
          }
        />
      ) : view === "table" ? (
        <section className="card-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100">
              <thead className="bg-ink-50/80">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-ink-500">
                  <th className="px-5 py-4">Creator</th>
                  <th className="px-5 py-4">Business</th>
                  <th className="px-5 py-4">Stage</th>
                  <th className="px-5 py-4">Score</th>
                  <th className="px-5 py-4">Recommended angle</th>
                  <th className="px-5 py-4">Updated</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 bg-white">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-4">
                      <div className="space-y-1">
                        <Link className="font-semibold text-ink-900 hover:text-brand-700" href={`/pipeline/${item.id}`}>
                          {item.creator.displayName}
                        </Link>
                        <p className="text-sm text-ink-500">{item.creator.handle}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-600">{item.businessProfile.name}</td>
                    <td className="px-5 py-4">
                      <form action={updatePipelineStageAction} className="flex items-center gap-2">
                        <input name="pipelineItemId" type="hidden" value={item.id} />
                        <input name="redirectTo" type="hidden" value={`/pipeline?view=table${businessProfileId ? `&businessProfileId=${businessProfileId}` : ""}`} />
                        <select className="select min-w-[180px]" defaultValue={item.currentStage} name="currentStage">
                          {pipelineStageValues.map((value) => (
                            <option key={value} value={value}>
                              {pipelineStageLabels[value]}
                            </option>
                          ))}
                        </select>
                        <button className="button-secondary whitespace-nowrap" type="submit">
                          Move
                        </button>
                      </form>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-ink-900">{item.latestOverallScore ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-ink-600">
                      {item.recommendedCollaborationType
                        ? formatCollaborationType(item.recommendedCollaborationType)
                        : "Not set"}
                    </td>
                    <td className="px-5 py-4 text-sm text-ink-500">{formatRelativeDate(item.updatedAt)}</td>
                    <td className="px-5 py-4">
                      <Link className="button-secondary" href={`/pipeline/${item.id}`}>
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-5">
          {grouped.map((column) => (
            <div key={column.stage} className="card-surface flex flex-col gap-4 p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-ink-600">
                  {formatPipelineStage(column.stage)}
                </h2>
                <Badge>{column.items.length}</Badge>
              </div>
              <div className="space-y-3">
                {column.items.length ? (
                  column.items.map((item) => (
                    <article key={item.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Link className="font-semibold text-ink-900 hover:text-brand-700" href={`/pipeline/${item.id}`}>
                            {item.creator.displayName}
                          </Link>
                          <p className="text-sm text-ink-600">{item.businessProfile.name}</p>
                          <p className="text-xs text-ink-500">{item.latestScoreSummary ?? "No score summary yet."}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge tone="brand">Score {item.latestOverallScore ?? "-"}</Badge>
                          {item.recommendedCollaborationType ? (
                            <Badge>{formatCollaborationType(item.recommendedCollaborationType)}</Badge>
                          ) : null}
                        </div>
                        {item.reminders.length ? (
                          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            Next reminder: {item.reminders[0]?.title} on {formatDate(item.reminders[0]?.dueDate)}
                          </div>
                        ) : null}
                        <form action={updatePipelineStageAction} className="space-y-2">
                          <input name="pipelineItemId" type="hidden" value={item.id} />
                          <input name="redirectTo" type="hidden" value={`/pipeline?view=kanban${businessProfileId ? `&businessProfileId=${businessProfileId}` : ""}`} />
                          <select className="select" defaultValue={item.currentStage} name="currentStage">
                            {pipelineStageValues.map((value) => (
                              <option key={value} value={value}>
                                {pipelineStageLabels[value]}
                              </option>
                            ))}
                          </select>
                          <button className="button-secondary w-full" type="submit">
                            Move
                          </button>
                        </form>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-500">
                    No items in this stage.
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
