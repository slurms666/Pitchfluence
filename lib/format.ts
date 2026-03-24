import { formatDistanceToNowStrict, isAfter, isBefore, startOfDay } from "date-fns";

import {
  brandToneLabels,
  campaignGoalLabels,
  collaborationTypeLabels,
  creatorPlatformLabels,
  creatorSourceTypeLabels,
  fitLevelLabels,
  followerBandLabels,
  outreachChannelLabels,
  outreachLengthLabels,
  outreachMessageTypeLabels,
  pipelineStageLabels,
  reminderStatusLabels,
  socialProofLevelLabels,
} from "@/lib/constants";
import { formatCompactNumber } from "@/lib/utils";

type LabelMap = Record<string, string>;

function labelFromMap(map: LabelMap, value?: string | null) {
  if (!value) {
    return "Not set";
  }

  return map[value] ?? value;
}

export function formatCurrencyRange(min?: number | null, max?: number | null) {
  const formatter = new Intl.NumberFormat("en", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  if (min != null && max != null) {
    return `${formatter.format(min)}-${formatter.format(max)}`;
  }

  if (min != null) {
    return `From ${formatter.format(min)}`;
  }

  if (max != null) {
    return `Up to ${formatter.format(max)}`;
  }

  return "Budget not set";
}

export function formatDate(date?: Date | string | null) {
  if (!date) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export function formatRelativeDate(date?: Date | string | null) {
  if (!date) {
    return "No date";
  }

  return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
}

export function formatFollowerCount(value?: number | null) {
  if (value == null) {
    return "Not provided";
  }

  return `${formatCompactNumber(value)} followers`;
}

export function formatDueLabel(date: Date) {
  const due = startOfDay(date);
  const today = startOfDay(new Date());

  if (isBefore(due, today)) {
    return `Overdue by ${formatDistanceToNowStrict(due)}`;
  }

  if (isAfter(due, today)) {
    return `Due ${formatDistanceToNowStrict(due, { addSuffix: true })}`;
  }

  return "Due today";
}

export const formatCampaignGoal = (value?: string | null) => labelFromMap(campaignGoalLabels, value);
export const formatSocialProof = (value?: string | null) => labelFromMap(socialProofLevelLabels, value);
export const formatTone = (value?: string | null) => labelFromMap(brandToneLabels, value);
export const formatPlatform = (value?: string | null) => labelFromMap(creatorPlatformLabels, value);
export const formatSourceType = (value?: string | null) => labelFromMap(creatorSourceTypeLabels, value);
export const formatFollowerBand = (value?: string | null) => labelFromMap(followerBandLabels, value);
export const formatFitLevel = (value?: string | null) => labelFromMap(fitLevelLabels, value);
export const formatCollaborationType = (value?: string | null) => labelFromMap(collaborationTypeLabels, value);
export const formatPipelineStage = (value?: string | null) => labelFromMap(pipelineStageLabels, value);
export const formatReminderStatus = (value?: string | null) => labelFromMap(reminderStatusLabels, value);
export const formatOutreachChannel = (value?: string | null) => labelFromMap(outreachChannelLabels, value);
export const formatOutreachLength = (value?: string | null) => labelFromMap(outreachLengthLabels, value);
export const formatOutreachMessageType = (value?: string | null) =>
  labelFromMap(outreachMessageTypeLabels, value);
