import { z } from "zod";

import {
  brandToneValues,
  campaignGoalValues,
  collaborationTypeValues,
  creatorPlatformValues,
  creatorSourceTypeValues,
  followerBandValues,
  outreachChannelValues,
  outreachLengthValues,
  outreachMessageTypeValues,
  pipelineStageValues,
  reminderStatusValues,
  socialProofLevelValues,
} from "@/lib/constants";

const optionalText = z
  .string()
  .trim()
  .transform((value) => (value.length ? value : undefined))
  .optional();

const optionalNumber = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  return trimmed.length ? Number(trimmed) : undefined;
}, z.number().int().nonnegative().optional());

function optionalEnum<const TValues extends readonly [string, ...string[]]>(values: TValues) {
  return z.preprocess((value) => {
    if (typeof value !== "string") {
      return value;
    }

    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }, z.enum(values).optional());
}

export const businessProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  website: optionalText,
  productOrServiceSummary: optionalText,
  niche: optionalText,
  targetAudience: optionalText,
  targetRegion: optionalText,
  budgetMin: optionalNumber,
  budgetMax: optionalNumber,
  campaignGoal: optionalEnum(campaignGoalValues),
  socialProofLevel: optionalEnum(socialProofLevelValues),
  socialProofNotes: optionalText,
  offerNotes: optionalText,
  brandToneDefault: optionalEnum(brandToneValues),
});

export const creatorSchema = z.object({
  sourceType: z.enum(creatorSourceTypeValues).default("MANUAL"),
  handle: z.string().trim().min(2, "Handle is required"),
  displayName: z.string().trim().min(2, "Display name is required"),
  platform: z.enum(creatorPlatformValues),
  bio: optionalText,
  nicheTags: z
    .string()
    .trim()
    .min(2, "Add at least one niche tag"),
  targetRegion: optionalText,
  creatorLocation: optionalText,
  followerCount: optionalNumber,
  followerBand: optionalEnum(followerBandValues),
  contentStyle: optionalText,
  audienceNotes: optionalText,
  contactEmailOrContactNote: optionalText,
  commercialHistoryNotes: optionalText,
});

export const pipelineUpdateSchema = z.object({
  currentStage: z.enum(pipelineStageValues),
  statusNotes: optionalText,
  proposedFeeNotes: optionalText,
  agreedFeeNotes: optionalText,
  deliverablesNotes: optionalText,
  recommendedCollaborationType: optionalEnum(collaborationTypeValues),
});

export const noteSchema = z.object({
  body: z.string().trim().min(3, "Add a bit more detail"),
});

export const activitySchema = z.object({
  message: z.string().trim().min(3, "Add a short activity note"),
});

export const reminderSchema = z.object({
  title: z.string().trim().min(2, "Title is required"),
  dueDate: z.string().trim().min(1, "Due date is required"),
  note: optionalText,
});

export const reminderStatusSchema = z.object({
  status: z.enum(reminderStatusValues),
});

export const accessSchema = z.object({
  passcode: z.string().trim().min(1, "Passcode is required"),
});

export const outreachGeneratorSchema = z.object({
  businessProfileId: z.string().trim().min(1, "Choose a business profile"),
  creatorId: z.string().trim().min(1, "Choose a creator"),
  channel: z.enum(outreachChannelValues),
  tone: z.enum(brandToneValues),
  length: z.enum(outreachLengthValues),
  messageType: z.enum(outreachMessageTypeValues),
});

export type ActionState = {
  success?: boolean;
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export function buildActionErrors(error: z.ZodError): ActionState {
  return {
    success: false,
    message: "Please review the highlighted fields.",
    fieldErrors: error.flatten().fieldErrors,
  };
}
