"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = {};

type ReminderFormProps = {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
  pipelineItemId: string;
};

export function ReminderForm({ action, pipelineItemId }: ReminderFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="pipelineItemId" type="hidden" value={pipelineItemId} />
      <div>
        <label className="label" htmlFor="title">
          Reminder title
        </label>
        <input className="input" id="title" name="title" placeholder="Follow up on draft" />
      </div>
      <div>
        <label className="label" htmlFor="dueDate">
          Due date
        </label>
        <input className="input" id="dueDate" name="dueDate" type="date" />
      </div>
      <div>
        <label className="label" htmlFor="note">
          Reminder note
        </label>
        <textarea className="textarea" id="note" name="note" placeholder="What should happen by this date?" />
      </div>
      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}
      <SubmitButton label="Create reminder" pendingLabel="Saving reminder..." />
    </form>
  );
}
