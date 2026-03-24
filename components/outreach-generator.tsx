"use client";

import { useActionState } from "react";

import { generateOutreachPreviewAction, type OutreachPreviewState, saveOutreachDraftAction } from "@/app/(app)/outreach/actions";
import { CopyButton } from "@/components/copy-button";
import { SubmitButton } from "@/components/submit-button";
import {
  brandToneLabels,
  brandToneValues,
  outreachChannelLabels,
  outreachChannelValues,
  outreachLengthLabels,
  outreachLengthValues,
  outreachMessageTypeLabels,
  outreachMessageTypeValues,
} from "@/lib/constants";

const initialState: OutreachPreviewState = {};

type OutreachGeneratorProps = {
  businesses: Array<{
    id: string;
    name: string;
  }>;
  creators: Array<{
    id: string;
    displayName: string;
    handle: string;
  }>;
  defaults: {
    businessProfileId?: string;
    creatorId?: string;
    channel?: "EMAIL" | "INSTAGRAM_DM" | "TIKTOK_DM";
    tone?: "PROFESSIONAL" | "FRIENDLY" | "PERSUASIVE";
    length?: "SHORT" | "MEDIUM";
    messageType?:
      | "INITIAL_OUTREACH"
      | "FOLLOW_UP"
      | "GIFTED_COLLABORATION_PITCH"
      | "PAID_COLLABORATION_PITCH"
      | "UGC_REQUEST";
  };
};

export function OutreachGenerator({ businesses, creators, defaults }: OutreachGeneratorProps) {
  const [state, formAction] = useActionState(generateOutreachPreviewAction, initialState);

  return (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-ink-900">Generate outreach</h2>
        <p className="mt-2 text-sm text-ink-600">
          Templates stay fully usable without AI. The output is influenced by the selected business, creator, channel, tone, message type, and latest fit context.
        </p>

        <form action={formAction} className="mt-6 space-y-5">
          <div>
            <label className="label" htmlFor="businessProfileId">
              Business profile
            </label>
            <select className="select" defaultValue={defaults.businessProfileId ?? ""} id="businessProfileId" name="businessProfileId">
              <option value="">Select business profile</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="creatorId">
              Creator
            </label>
            <select className="select" defaultValue={defaults.creatorId ?? ""} id="creatorId" name="creatorId">
              <option value="">Select creator</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.displayName} ({creator.handle})
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="channel">
                Channel
              </label>
              <select className="select" defaultValue={defaults.channel ?? "EMAIL"} id="channel" name="channel">
                {outreachChannelValues.map((value) => (
                  <option key={value} value={value}>
                    {outreachChannelLabels[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="messageType">
                Message type
              </label>
              <select className="select" defaultValue={defaults.messageType ?? "INITIAL_OUTREACH"} id="messageType" name="messageType">
                {outreachMessageTypeValues.map((value) => (
                  <option key={value} value={value}>
                    {outreachMessageTypeLabels[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="label" htmlFor="tone">
                Tone
              </label>
              <select className="select" defaultValue={defaults.tone ?? "FRIENDLY"} id="tone" name="tone">
                {brandToneValues.map((value) => (
                  <option key={value} value={value}>
                    {brandToneLabels[value]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="length">
                Length
              </label>
              <select className="select" defaultValue={defaults.length ?? "SHORT"} id="length" name="length">
                {outreachLengthValues.map((value) => (
                  <option key={value} value={value}>
                    {outreachLengthLabels[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {state.message ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.message}</p> : null}
          <SubmitButton label="Generate draft" pendingLabel="Generating draft..." />
        </form>
      </section>

      <section className="card-surface p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink-900">Preview</h2>
            <p className="mt-2 text-sm text-ink-600">
              {state.preview?.explanation ?? "Generate a draft to preview email, Instagram DM, or TikTok DM copy here."}
            </p>
          </div>
          {state.preview?.body ? <CopyButton value={`${state.preview.subjectLine ? `${state.preview.subjectLine}\n\n` : ""}${state.preview.body}`} /> : null}
        </div>

        {!state.preview ? (
          <div className="mt-8 rounded-3xl border border-dashed border-ink-200 px-6 py-14 text-center text-sm text-ink-500">
            No draft generated yet.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {state.preview.subjectLine ? (
              <div className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Subject line</p>
                <p className="mt-2 text-sm font-semibold text-ink-900">{state.preview.subjectLine}</p>
              </div>
            ) : null}
            <div className="rounded-3xl border border-ink-100 bg-ink-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-500">Body</p>
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink-700">{state.preview.body}</p>
            </div>

            {state.request ? (
              <form action={saveOutreachDraftAction} className="flex flex-wrap gap-3">
                <input name="businessProfileId" type="hidden" value={state.request.businessProfileId} />
                <input name="creatorId" type="hidden" value={state.request.creatorId} />
                <input name="channel" type="hidden" value={state.request.channel} />
                <input name="tone" type="hidden" value={state.request.tone} />
                <input name="length" type="hidden" value={state.request.length} />
                <input name="messageType" type="hidden" value={state.request.messageType} />
                <button className="button-primary" type="submit">
                  Save draft
                </button>
              </form>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
