"use server";

import { redirect } from "next/navigation";

import { assertWorkspaceAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { explainOutreachChoice, generateOutreachDraft } from "@/lib/outreach";
import { scoreCreatorForBusiness } from "@/lib/scoring";
import { buildActionErrors, outreachGeneratorSchema, type ActionState } from "@/lib/validation";

export type OutreachPreviewState = ActionState & {
  request?: {
    businessProfileId: string;
    creatorId: string;
    channel: "EMAIL" | "INSTAGRAM_DM" | "TIKTOK_DM";
    tone: "PROFESSIONAL" | "FRIENDLY" | "PERSUASIVE";
    length: "SHORT" | "MEDIUM";
    messageType:
      | "INITIAL_OUTREACH"
      | "FOLLOW_UP"
      | "GIFTED_COLLABORATION_PITCH"
      | "PAID_COLLABORATION_PITCH"
      | "UGC_REQUEST";
  };
  preview?: {
    subjectLine?: string;
    body: string;
    explanation: string;
  };
};

async function buildDraftFromRequest(request: OutreachPreviewState["request"]) {
  if (!request) {
    return null;
  }

  const [business, creator] = await Promise.all([
    db.businessProfile.findUniqueOrThrow({
      where: {
        id: request.businessProfileId,
      },
    }),
    db.creator.findUniqueOrThrow({
      where: {
        id: request.creatorId,
      },
    }),
  ]);

  const match = scoreCreatorForBusiness(business, creator);
  const draft = generateOutreachDraft({
    business,
    creator,
    channel: request.channel,
    tone: request.tone,
    length: request.length,
    messageType: request.messageType,
    match,
  });

  return {
    business,
    creator,
    match,
    draft,
  };
}

export async function generateOutreachPreviewAction(
  _previousState: OutreachPreviewState,
  formData: FormData,
): Promise<OutreachPreviewState> {
  await assertWorkspaceAccess();

  const parsed = outreachGeneratorSchema.safeParse({
    businessProfileId: formData.get("businessProfileId"),
    creatorId: formData.get("creatorId"),
    channel: formData.get("channel"),
    tone: formData.get("tone"),
    length: formData.get("length"),
    messageType: formData.get("messageType"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  const data = await buildDraftFromRequest(parsed.data);

  if (!data) {
    return {
      success: false,
      message: "Unable to generate a draft with the current selection.",
    };
  }

  return {
    success: true,
    request: parsed.data,
    preview: {
      subjectLine: data.draft.subjectLine,
      body: data.draft.body,
      explanation: explainOutreachChoice({
        business: data.business,
        creator: data.creator,
        channel: parsed.data.channel,
        tone: parsed.data.tone,
        length: parsed.data.length,
        messageType: parsed.data.messageType,
        match: data.match,
      }),
    },
  };
}

export async function saveOutreachDraftAction(formData: FormData) {
  await assertWorkspaceAccess();

  const parsed = outreachGeneratorSchema.safeParse({
    businessProfileId: formData.get("businessProfileId"),
    creatorId: formData.get("creatorId"),
    channel: formData.get("channel"),
    tone: formData.get("tone"),
    length: formData.get("length"),
    messageType: formData.get("messageType"),
  });

  if (!parsed.success) {
    redirect("/outreach");
  }

  const data = await buildDraftFromRequest(parsed.data);

  if (!data) {
    redirect("/outreach");
  }

  await db.outreachDraft.create({
    data: {
      businessProfileId: parsed.data.businessProfileId,
      creatorId: parsed.data.creatorId,
      channel: parsed.data.channel,
      tone: parsed.data.tone,
      length: parsed.data.length,
      messageType: parsed.data.messageType,
      subjectLine: data.draft.subjectLine,
      body: data.draft.body,
    },
  });

  const pipelineItem = await db.pipelineItem.findUnique({
    where: {
      businessProfileId_creatorId: {
        businessProfileId: parsed.data.businessProfileId,
        creatorId: parsed.data.creatorId,
      },
    },
  });

  if (pipelineItem) {
    await db.activity.create({
      data: {
        pipelineItemId: pipelineItem.id,
        kind: "OUTREACH_SAVED",
        message: "An outreach draft was saved for this opportunity.",
      },
    });
  }

  redirect(`/outreach?businessId=${parsed.data.businessProfileId}&creatorId=${parsed.data.creatorId}&saved=1`);
}
