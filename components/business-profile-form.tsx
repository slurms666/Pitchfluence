"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import {
  brandToneLabels,
  brandToneValues,
  campaignGoalLabels,
  campaignGoalValues,
  socialProofLevelLabels,
  socialProofLevelValues,
} from "@/lib/constants";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = {};

type BusinessProfileFormProps = {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  initialValues?: {
    name?: string | null;
    website?: string | null;
    productOrServiceSummary?: string | null;
    niche?: string | null;
    targetAudience?: string | null;
    targetRegion?: string | null;
    budgetMin?: number | null;
    budgetMax?: number | null;
    campaignGoal?: string | null;
    socialProofLevel?: string | null;
    socialProofNotes?: string | null;
    offerNotes?: string | null;
    brandToneDefault?: string | null;
  };
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="helper text-rose-600">{errors[0]}</p>;
}

export function BusinessProfileForm({
  action,
  submitLabel,
  initialValues,
}: BusinessProfileFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <div className="card-surface space-y-6 p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:col-span-1">
            <label className="label" htmlFor="name">
              Business name
            </label>
            <input className="input" defaultValue={initialValues?.name ?? ""} id="name" name="name" />
            <FieldError errors={state.fieldErrors?.name} />
          </div>
          <div className="lg:col-span-1">
            <label className="label" htmlFor="website">
              Website
            </label>
            <input
              className="input"
              defaultValue={initialValues?.website ?? ""}
              id="website"
              name="website"
              placeholder="https://"
            />
            <FieldError errors={state.fieldErrors?.website} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="productOrServiceSummary">
            Product or service summary
          </label>
          <textarea
            className="textarea"
            defaultValue={initialValues?.productOrServiceSummary ?? ""}
            id="productOrServiceSummary"
            name="productOrServiceSummary"
            placeholder="What do you sell, and why do customers choose you?"
          />
          <FieldError errors={state.fieldErrors?.productOrServiceSummary} />
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="niche">
              Niche
            </label>
            <input
              className="input"
              defaultValue={initialValues?.niche ?? ""}
              id="niche"
              name="niche"
              placeholder="Skincare, local cafe, strength coaching..."
            />
          </div>
          <div>
            <label className="label" htmlFor="targetRegion">
              Target region
            </label>
            <input
              className="input"
              defaultValue={initialValues?.targetRegion ?? ""}
              id="targetRegion"
              name="targetRegion"
              placeholder="Global, Toronto, Australia..."
            />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="targetAudience">
            Target audience
          </label>
          <textarea
            className="textarea"
            defaultValue={initialValues?.targetAudience ?? ""}
            id="targetAudience"
            name="targetAudience"
            placeholder="Who are you trying to reach?"
          />
        </div>
      </div>

      <div className="card-surface space-y-6 p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="budgetMin">
              Budget min
            </label>
            <input
              className="input"
              defaultValue={initialValues?.budgetMin ?? ""}
              id="budgetMin"
              min="0"
              name="budgetMin"
              type="number"
            />
          </div>
          <div>
            <label className="label" htmlFor="budgetMax">
              Budget max
            </label>
            <input
              className="input"
              defaultValue={initialValues?.budgetMax ?? ""}
              id="budgetMax"
              min="0"
              name="budgetMax"
              type="number"
            />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="campaignGoal">
              Campaign goal
            </label>
            <select
              className="select"
              defaultValue={initialValues?.campaignGoal ?? ""}
              id="campaignGoal"
              name="campaignGoal"
            >
              <option value="">Select a goal</option>
              {campaignGoalValues.map((value) => (
                <option key={value} value={value}>
                  {campaignGoalLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="socialProofLevel">
              Social proof level
            </label>
            <select
              className="select"
              defaultValue={initialValues?.socialProofLevel ?? ""}
              id="socialProofLevel"
              name="socialProofLevel"
            >
              <option value="">Select social proof</option>
              {socialProofLevelValues.map((value) => (
                <option key={value} value={value}>
                  {socialProofLevelLabels[value]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="socialProofNotes">
            Social proof notes
          </label>
          <textarea
            className="textarea"
            defaultValue={initialValues?.socialProofNotes ?? ""}
            id="socialProofNotes"
            name="socialProofNotes"
            placeholder="Reviews, traction, repeat customers, founder credibility..."
          />
        </div>

        <div>
          <label className="label" htmlFor="offerNotes">
            Offer notes
          </label>
          <textarea
            className="textarea"
            defaultValue={initialValues?.offerNotes ?? ""}
            id="offerNotes"
            name="offerNotes"
            placeholder="Gifted product, paid package, affiliate test, UGC rights..."
          />
        </div>

        <div>
          <label className="label" htmlFor="brandToneDefault">
            Default outreach tone
          </label>
          <select
            className="select"
            defaultValue={initialValues?.brandToneDefault ?? "FRIENDLY"}
            id="brandToneDefault"
            name="brandToneDefault"
          >
            {brandToneValues.map((value) => (
              <option key={value} value={value}>
                {brandToneLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}

      <SubmitButton label={submitLabel} pendingLabel="Saving business profile..." />
    </form>
  );
}
