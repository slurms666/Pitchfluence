"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import {
  collaborationTypeLabels,
  collaborationTypeValues,
  pipelineStageLabels,
  pipelineStageValues,
} from "@/lib/constants";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = {};

type PipelineItemFormProps = {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
  pipelineItemId: string;
  initialValues: {
    currentStage: string;
    recommendedCollaborationType?: string | null;
    statusNotes?: string | null;
    proposedFeeNotes?: string | null;
    agreedFeeNotes?: string | null;
    deliverablesNotes?: string | null;
  };
};

export function PipelineItemForm({ action, pipelineItemId, initialValues }: PipelineItemFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input name="pipelineItemId" type="hidden" value={pipelineItemId} />
      <div className="grid gap-5 lg:grid-cols-2">
        <div>
          <label className="label" htmlFor="currentStage">
            Current stage
          </label>
          <select className="select" defaultValue={initialValues.currentStage} id="currentStage" name="currentStage">
            {pipelineStageValues.map((value) => (
              <option key={value} value={value}>
                {pipelineStageLabels[value]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="recommendedCollaborationType">
            Recommended collaboration type
          </label>
          <select
            className="select"
            defaultValue={initialValues.recommendedCollaborationType ?? ""}
            id="recommendedCollaborationType"
            name="recommendedCollaborationType"
          >
            <option value="">Not set</option>
            {collaborationTypeValues.map((value) => (
              <option key={value} value={value}>
                {collaborationTypeLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="statusNotes">
          Status notes
        </label>
        <textarea className="textarea" defaultValue={initialValues.statusNotes ?? ""} id="statusNotes" name="statusNotes" />
      </div>
      <div>
        <label className="label" htmlFor="proposedFeeNotes">
          Proposed fee notes
        </label>
        <textarea className="textarea" defaultValue={initialValues.proposedFeeNotes ?? ""} id="proposedFeeNotes" name="proposedFeeNotes" />
      </div>
      <div>
        <label className="label" htmlFor="agreedFeeNotes">
          Agreed fee notes
        </label>
        <textarea className="textarea" defaultValue={initialValues.agreedFeeNotes ?? ""} id="agreedFeeNotes" name="agreedFeeNotes" />
      </div>
      <div>
        <label className="label" htmlFor="deliverablesNotes">
          Deliverables notes
        </label>
        <textarea className="textarea" defaultValue={initialValues.deliverablesNotes ?? ""} id="deliverablesNotes" name="deliverablesNotes" />
      </div>

      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}

      <SubmitButton label="Save pipeline details" pendingLabel="Saving pipeline..." />
    </form>
  );
}
