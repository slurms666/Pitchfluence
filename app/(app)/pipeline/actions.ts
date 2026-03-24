"use server";

import { redirect } from "next/navigation";

import { assertWorkspaceAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  activitySchema,
  buildActionErrors,
  noteSchema,
  pipelineUpdateSchema,
  reminderSchema,
  reminderStatusSchema,
  type ActionState,
} from "@/lib/validation";
import { safeRedirectPath } from "@/lib/utils";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function updatePipelineStageAction(formData: FormData) {
  await assertWorkspaceAccess();

  const pipelineItemId = getString(formData, "pipelineItemId");
  const currentStage = getString(formData, "currentStage");
  const redirectTo = safeRedirectPath(getString(formData, "redirectTo"), "/pipeline");

  const existing = await db.pipelineItem.findUniqueOrThrow({
    where: {
      id: pipelineItemId,
    },
  });

  await db.pipelineItem.update({
    where: {
      id: pipelineItemId,
    },
    data: {
      currentStage: currentStage as never,
    },
  });

  if (existing.currentStage !== currentStage) {
    await db.activity.create({
      data: {
        pipelineItemId,
        kind: "STAGE_CHANGED",
        message: `Stage moved from ${existing.currentStage.replaceAll("_", " ").toLowerCase()} to ${currentStage.replaceAll("_", " ").toLowerCase()}.`,
      },
    });
  }

  redirect(redirectTo);
}

export async function updatePipelineItemAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const pipelineItemId = getString(formData, "pipelineItemId");

  const parsed = pipelineUpdateSchema.safeParse({
    currentStage: formData.get("currentStage"),
    statusNotes: formData.get("statusNotes"),
    proposedFeeNotes: formData.get("proposedFeeNotes"),
    agreedFeeNotes: formData.get("agreedFeeNotes"),
    deliverablesNotes: formData.get("deliverablesNotes"),
    recommendedCollaborationType: formData.get("recommendedCollaborationType"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  const existing = await db.pipelineItem.findUniqueOrThrow({
    where: {
      id: pipelineItemId,
    },
  });

  await db.pipelineItem.update({
    where: {
      id: pipelineItemId,
    },
    data: parsed.data,
  });

  const activityMessages: string[] = [];

  if (existing.currentStage !== parsed.data.currentStage) {
    activityMessages.push(
      `Stage moved from ${existing.currentStage.replaceAll("_", " ").toLowerCase()} to ${parsed.data.currentStage.replaceAll("_", " ").toLowerCase()}.`,
    );
  }

  activityMessages.push("Pipeline details updated.");

  for (const message of activityMessages) {
    await db.activity.create({
      data: {
        pipelineItemId,
        kind: message.startsWith("Stage moved") ? "STAGE_CHANGED" : "SYSTEM",
        message,
      },
    });
  }

  redirect(`/pipeline/${pipelineItemId}`);
}

export async function addNoteAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const pipelineItemId = getString(formData, "pipelineItemId");
  const parsed = noteSchema.safeParse({
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  await db.note.create({
    data: {
      pipelineItemId,
      body: parsed.data.body,
    },
  });

  await db.activity.create({
    data: {
      pipelineItemId,
      kind: "NOTE_ADDED",
      message: "A new note was added to this opportunity.",
    },
  });

  redirect(`/pipeline/${pipelineItemId}`);
}

export async function addActivityAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const pipelineItemId = getString(formData, "pipelineItemId");
  const parsed = activitySchema.safeParse({
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  await db.activity.create({
    data: {
      pipelineItemId,
      kind: "CUSTOM",
      message: parsed.data.message,
    },
  });

  redirect(`/pipeline/${pipelineItemId}`);
}

export async function addReminderAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const pipelineItemId = getString(formData, "pipelineItemId");
  const parsed = reminderSchema.safeParse({
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  await db.reminder.create({
    data: {
      pipelineItemId,
      title: parsed.data.title,
      note: parsed.data.note,
      dueDate: new Date(`${parsed.data.dueDate}T09:00:00.000Z`),
    },
  });

  await db.activity.create({
    data: {
      pipelineItemId,
      kind: "REMINDER_CREATED",
      message: `Reminder created: ${parsed.data.title}.`,
    },
  });

  redirect(`/pipeline/${pipelineItemId}`);
}

export async function toggleReminderStatusAction(formData: FormData) {
  await assertWorkspaceAccess();

  const reminderId = getString(formData, "reminderId");
  const pipelineItemId = getString(formData, "pipelineItemId");
  const parsed = reminderStatusSchema.safeParse({
    status: formData.get("status"),
  });

  if (!parsed.success) {
    redirect(`/pipeline/${pipelineItemId}`);
  }

  const updated = await db.reminder.update({
    where: {
      id: reminderId,
    },
    data: {
      status: parsed.data.status,
    },
  });

  await db.activity.create({
    data: {
      pipelineItemId,
      kind: parsed.data.status === "COMPLETED" ? "REMINDER_COMPLETED" : "REMINDER_CREATED",
      message:
        parsed.data.status === "COMPLETED"
          ? `Reminder completed: ${updated.title}.`
          : `Reminder reopened: ${updated.title}.`,
    },
  });

  redirect(`/pipeline/${pipelineItemId}`);
}
