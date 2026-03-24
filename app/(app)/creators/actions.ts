"use server";

import { redirect } from "next/navigation";

import { assertWorkspaceAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { createShortlistPipelineItem } from "@/lib/workspace";
import { buildActionErrors, creatorSchema, type ActionState } from "@/lib/validation";
import { safeRedirectPath, splitCommaList } from "@/lib/utils";

export async function createCreatorAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const parsed = creatorSchema.safeParse({
    sourceType: "MANUAL",
    handle: formData.get("handle"),
    displayName: formData.get("displayName"),
    platform: formData.get("platform"),
    bio: formData.get("bio"),
    nicheTags: formData.get("nicheTags"),
    targetRegion: formData.get("targetRegion"),
    creatorLocation: formData.get("creatorLocation"),
    followerCount: formData.get("followerCount"),
    followerBand: formData.get("followerBand"),
    contentStyle: formData.get("contentStyle"),
    audienceNotes: formData.get("audienceNotes"),
    contactEmailOrContactNote: formData.get("contactEmailOrContactNote"),
    commercialHistoryNotes: formData.get("commercialHistoryNotes"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  const created = await db.creator.create({
    data: {
      ...parsed.data,
      sourceType: "MANUAL",
      nicheTags: splitCommaList(parsed.data.nicheTags),
    },
  });

  redirect(`/creators/${created.id}`);
}

export async function updateCreatorAction(
  creatorId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const existing = await db.creator.findUniqueOrThrow({
    where: {
      id: creatorId,
    },
  });

  if (existing.sourceType !== "MANUAL") {
    return {
      success: false,
      message: "Demo creators are read-only in v1. Add a manual creator if you want to edit one.",
    };
  }

  const parsed = creatorSchema.safeParse({
    sourceType: existing.sourceType,
    handle: formData.get("handle"),
    displayName: formData.get("displayName"),
    platform: formData.get("platform"),
    bio: formData.get("bio"),
    nicheTags: formData.get("nicheTags"),
    targetRegion: formData.get("targetRegion"),
    creatorLocation: formData.get("creatorLocation"),
    followerCount: formData.get("followerCount"),
    followerBand: formData.get("followerBand"),
    contentStyle: formData.get("contentStyle"),
    audienceNotes: formData.get("audienceNotes"),
    contactEmailOrContactNote: formData.get("contactEmailOrContactNote"),
    commercialHistoryNotes: formData.get("commercialHistoryNotes"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  await db.creator.update({
    where: {
      id: creatorId,
    },
    data: {
      ...parsed.data,
      nicheTags: splitCommaList(parsed.data.nicheTags),
    },
  });

  redirect(`/creators/${creatorId}`);
}

export async function deleteCreatorAction(creatorId: string) {
  await assertWorkspaceAccess();

  const creator = await db.creator.findUniqueOrThrow({
    where: {
      id: creatorId,
    },
  });

  if (creator.sourceType !== "MANUAL") {
    redirect(`/creators/${creatorId}`);
  }

  await db.creator.delete({
    where: {
      id: creatorId,
    },
  });

  redirect("/creators");
}

export async function shortlistCreatorAction(formData: FormData) {
  await assertWorkspaceAccess();

  const businessProfileId = String(formData.get("businessProfileId") ?? "");
  const creatorId = String(formData.get("creatorId") ?? "");
  const redirectTo = safeRedirectPath(String(formData.get("redirectTo") ?? "/creators"), "/creators");

  if (!businessProfileId || !creatorId) {
    redirect(redirectTo);
  }

  await createShortlistPipelineItem(businessProfileId, creatorId);
  redirect(redirectTo);
}
