"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = {};

type NoteFormProps = {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
  pipelineItemId: string;
  label: string;
  placeholder: string;
  fieldName?: string;
  submitLabel: string;
};

export function NoteForm({
  action,
  pipelineItemId,
  label,
  placeholder,
  fieldName = "body",
  submitLabel,
}: NoteFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input name="pipelineItemId" type="hidden" value={pipelineItemId} />
      <div>
        <label className="label" htmlFor={fieldName}>
          {label}
        </label>
        <textarea className="textarea" id={fieldName} name={fieldName} placeholder={placeholder} />
      </div>
      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}
      <SubmitButton label={submitLabel} pendingLabel="Saving..." />
    </form>
  );
}
