"use client";

import { useActionState } from "react";

import { unlockWorkspaceAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = {};

type AccessFormProps = {
  redirectTo?: string;
};

export function AccessForm({ redirectTo }: AccessFormProps) {
  const [state, action] = useActionState(unlockWorkspaceAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <input name="redirectTo" type="hidden" value={redirectTo ?? "/"} />
      <div>
        <label className="label" htmlFor="passcode">
          Shared passcode
        </label>
        <input
          autoComplete="current-password"
          className="input"
          id="passcode"
          name="passcode"
          placeholder="Enter the app passcode"
          type="password"
        />
        {state.fieldErrors?.passcode ? (
          <p className="helper text-rose-600">{state.fieldErrors.passcode[0]}</p>
        ) : (
          <p className="helper">Set this via `APP_ACCESS_PASSCODE` in your environment.</p>
        )}
      </div>

      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}

      <SubmitButton label="Enter Pitchfluence" pendingLabel="Checking passcode..." />
    </form>
  );
}
