import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/badge";
import { NoteForm } from "@/components/note-form";
import { PageHeader } from "@/components/page-header";
import { PipelineItemForm } from "@/components/pipeline-item-form";
import { ReminderForm } from "@/components/reminder-form";
import { formatCollaborationType, formatDate, formatDueLabel, formatPipelineStage, formatRelativeDate } from "@/lib/format";
import { getPipelineItemDetail } from "@/lib/workspace";
import {
  addActivityAction,
  addNoteAction,
  addReminderAction,
  toggleReminderStatusAction,
  updatePipelineItemAction,
} from "@/app/(app)/pipeline/actions";

export default async function PipelineItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pipelineItem = await getPipelineItemDetail(id);

  if (!pipelineItem) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Mini CRM"
        title={pipelineItem.creator.displayName}
        description={`Tracking opportunity for ${pipelineItem.businessProfile.name}.`}
        actions={
          <>
            <Link className="button-secondary" href="/pipeline">
              Back to pipeline
            </Link>
            <Link
              className="button-primary"
              href={`/outreach?businessId=${pipelineItem.businessProfileId}&creatorId=${pipelineItem.creatorId}`}
            >
              Generate outreach
            </Link>
          </>
        }
      />

      <section className="card-surface space-y-5 p-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge tone="brand">{pipelineItem.businessProfile.name}</Badge>
          <Badge>{formatPipelineStage(pipelineItem.currentStage)}</Badge>
          {pipelineItem.recommendedCollaborationType ? (
            <Badge tone="success">{formatCollaborationType(pipelineItem.recommendedCollaborationType)}</Badge>
          ) : null}
          <Badge>Score {pipelineItem.latestOverallScore ?? "-"}</Badge>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Score summary</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              {pipelineItem.latestScoreSummary ?? "No stored score summary yet."}
            </p>
          </div>
          <div className="rounded-3xl border border-ink-100 bg-ink-50 p-5">
            <h2 className="text-sm font-semibold text-ink-900">Creator context</h2>
            <p className="mt-2 text-sm leading-6 text-ink-600">{pipelineItem.creator.bio ?? "No creator bio available."}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <section className="card-surface p-6">
            <h2 className="text-lg font-semibold text-ink-900">Opportunity details</h2>
            <p className="mt-2 text-sm text-ink-600">
              Update stage, notes, fees, and deliverables as the conversation moves forward.
            </p>
            <div className="mt-6">
              <PipelineItemForm
                action={updatePipelineItemAction}
                initialValues={pipelineItem}
                pipelineItemId={pipelineItem.id}
              />
            </div>
          </section>

          <section className="card-surface space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">Notes</h2>
              <Badge>{pipelineItem.notes.length}</Badge>
            </div>
            <NoteForm
              action={addNoteAction}
              label="Add note"
              pipelineItemId={pipelineItem.id}
              placeholder="Add context, objections, creator preferences, or follow-up ideas..."
              submitLabel="Add note"
            />
            <div className="space-y-3">
              {pipelineItem.notes.length ? (
                pipelineItem.notes.map((note) => (
                  <article key={note.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                    <p className="whitespace-pre-line text-sm leading-6 text-ink-700">{note.body}</p>
                    <p className="mt-2 text-xs text-ink-500">{formatRelativeDate(note.createdAt)}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink-600">No notes yet.</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card-surface space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">Reminders</h2>
              <Badge>{pipelineItem.reminders.filter((reminder) => reminder.status === "OPEN").length} open</Badge>
            </div>
            <ReminderForm action={addReminderAction} pipelineItemId={pipelineItem.id} />
            <div className="space-y-3">
              {pipelineItem.reminders.length ? (
                pipelineItem.reminders.map((reminder) => (
                  <article key={reminder.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{reminder.title}</p>
                        <p className="mt-1 text-sm text-ink-600">{reminder.note ?? "No reminder note added."}</p>
                        <p className="mt-2 text-xs text-ink-500">
                          Due {formatDate(reminder.dueDate)} · {formatDueLabel(new Date(reminder.dueDate))}
                        </p>
                      </div>
                      <form action={toggleReminderStatusAction}>
                        <input name="pipelineItemId" type="hidden" value={pipelineItem.id} />
                        <input name="reminderId" type="hidden" value={reminder.id} />
                        <input
                          name="status"
                          type="hidden"
                          value={reminder.status === "OPEN" ? "COMPLETED" : "OPEN"}
                        />
                        <button className={reminder.status === "OPEN" ? "button-secondary" : "button-primary"} type="submit">
                          {reminder.status === "OPEN" ? "Mark complete" : "Reopen"}
                        </button>
                      </form>
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink-600">No reminders yet.</p>
              )}
            </div>
          </section>

          <section className="card-surface space-y-4 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink-900">Activity history</h2>
              <Badge>{pipelineItem.activities.length}</Badge>
            </div>
            <NoteForm
              action={addActivityAction}
              fieldName="message"
              label="Log manual activity"
              pipelineItemId={pipelineItem.id}
              placeholder="Creator asked for rates, shared a sample brief, wants usage terms..."
              submitLabel="Log activity"
            />
            <div className="space-y-3">
              {pipelineItem.activities.length ? (
                pipelineItem.activities.map((activity) => (
                  <article key={activity.id} className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                    <p className="text-sm font-semibold text-ink-900">{activity.message}</p>
                    <p className="mt-2 text-xs text-ink-500">{formatRelativeDate(activity.createdAt)}</p>
                  </article>
                ))
              ) : (
                <p className="text-sm text-ink-600">No activity logged yet.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
