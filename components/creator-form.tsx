"use client";

import { useActionState } from "react";

import { SubmitButton } from "@/components/submit-button";
import {
  creatorPlatformLabels,
  creatorPlatformValues,
  followerBandLabels,
  followerBandValues,
} from "@/lib/constants";
import type { ActionState } from "@/lib/validation";

const initialState: ActionState = {};

type CreatorFormProps = {
  action: (previousState: ActionState, formData: FormData) => Promise<ActionState>;
  submitLabel: string;
  initialValues?: {
    handle?: string | null;
    displayName?: string | null;
    platform?: string | null;
    bio?: string | null;
    nicheTags?: string[] | null;
    targetRegion?: string | null;
    creatorLocation?: string | null;
    followerCount?: number | null;
    followerBand?: string | null;
    contentStyle?: string | null;
    audienceNotes?: string | null;
    contactEmailOrContactNote?: string | null;
    commercialHistoryNotes?: string | null;
  };
};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) {
    return null;
  }

  return <p className="helper text-rose-600">{errors[0]}</p>;
}

export function CreatorForm({ action, submitLabel, initialValues }: CreatorFormProps) {
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-8">
      <div className="card-surface space-y-6 p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="displayName">
              Display name
            </label>
            <input className="input" defaultValue={initialValues?.displayName ?? ""} id="displayName" name="displayName" />
            <FieldError errors={state.fieldErrors?.displayName} />
          </div>
          <div>
            <label className="label" htmlFor="handle">
              Handle
            </label>
            <input className="input" defaultValue={initialValues?.handle ?? ""} id="handle" name="handle" placeholder="@creatorhandle" />
            <FieldError errors={state.fieldErrors?.handle} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="platform">
              Platform
            </label>
            <select className="select" defaultValue={initialValues?.platform ?? "INSTAGRAM"} id="platform" name="platform">
              {creatorPlatformValues.map((value) => (
                <option key={value} value={value}>
                  {creatorPlatformLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="nicheTags">
              Niche tags
            </label>
            <input
              className="input"
              defaultValue={initialValues?.nicheTags?.join(", ") ?? ""}
              id="nicheTags"
              name="nicheTags"
              placeholder="fitness, local food, skincare"
            />
            <FieldError errors={state.fieldErrors?.nicheTags} />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="bio">
            Bio
          </label>
          <textarea className="textarea" defaultValue={initialValues?.bio ?? ""} id="bio" name="bio" placeholder="What kind of content does this creator make?" />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="creatorLocation">
              Creator location
            </label>
            <input className="input" defaultValue={initialValues?.creatorLocation ?? ""} id="creatorLocation" name="creatorLocation" />
          </div>
          <div>
            <label className="label" htmlFor="targetRegion">
              Audience region
            </label>
            <input className="input" defaultValue={initialValues?.targetRegion ?? ""} id="targetRegion" name="targetRegion" />
          </div>
          <div>
            <label className="label" htmlFor="followerCount">
              Follower count
            </label>
            <input className="input" defaultValue={initialValues?.followerCount ?? ""} id="followerCount" min="0" name="followerCount" type="number" />
          </div>
        </div>

        <div>
          <label className="label" htmlFor="followerBand">
            Follower band
          </label>
          <select className="select" defaultValue={initialValues?.followerBand ?? ""} id="followerBand" name="followerBand">
            <option value="">Auto from follower count</option>
            {followerBandValues.map((value) => (
              <option key={value} value={value}>
                {followerBandLabels[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="contentStyle">
              Content style
            </label>
            <textarea className="textarea" defaultValue={initialValues?.contentStyle ?? ""} id="contentStyle" name="contentStyle" placeholder="Reels, tutorials, product reviews, vlogs..." />
          </div>
          <div>
            <label className="label" htmlFor="audienceNotes">
              Audience notes
            </label>
            <textarea className="textarea" defaultValue={initialValues?.audienceNotes ?? ""} id="audienceNotes" name="audienceNotes" placeholder="Who tends to engage with this creator?" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="label" htmlFor="contactEmailOrContactNote">
              Contact email or contact note
            </label>
            <textarea className="textarea" defaultValue={initialValues?.contactEmailOrContactNote ?? ""} id="contactEmailOrContactNote" name="contactEmailOrContactNote" placeholder="Email, manager note, or preferred outreach route..." />
          </div>
          <div>
            <label className="label" htmlFor="commercialHistoryNotes">
              Commercial history notes
            </label>
            <textarea className="textarea" defaultValue={initialValues?.commercialHistoryNotes ?? ""} id="commercialHistoryNotes" name="commercialHistoryNotes" placeholder="Gifted, paid, affiliate, UGC, none known..." />
          </div>
        </div>
      </div>

      {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}

      <SubmitButton label={submitLabel} pendingLabel="Saving creator..." />
    </form>
  );
}
