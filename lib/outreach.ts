import {
  brandToneLabels,
  collaborationTypeLabels,
  outreachChannelLabels,
  outreachMessageTypeLabels,
} from "@/lib/constants";
import { formatCurrencyRange } from "@/lib/format";
import type { MatchResult } from "@/lib/scoring";
import { followerBandSummary } from "@/lib/utils";

type OutreachBusiness = {
  name: string;
  productOrServiceSummary?: string | null;
  targetAudience?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  campaignGoal?: string | null;
  brandToneDefault?: "PROFESSIONAL" | "FRIENDLY" | "PERSUASIVE" | null;
  offerNotes?: string | null;
};

type OutreachCreator = {
  displayName: string;
  handle: string;
  platform: "INSTAGRAM" | "TIKTOK" | "YOUTUBE" | "OTHER";
  nicheTags: string[];
  contentStyle?: string | null;
  audienceNotes?: string | null;
  followerCount?: number | null;
  followerBand?: "NANO" | "MICRO" | "RISING" | "ESTABLISHED" | "LARGE" | null;
};

type OutreachInput = {
  business: OutreachBusiness;
  creator: OutreachCreator;
  channel: "EMAIL" | "INSTAGRAM_DM" | "TIKTOK_DM";
  tone: "PROFESSIONAL" | "FRIENDLY" | "PERSUASIVE";
  length: "SHORT" | "MEDIUM";
  messageType:
    | "INITIAL_OUTREACH"
    | "FOLLOW_UP"
    | "GIFTED_COLLABORATION_PITCH"
    | "PAID_COLLABORATION_PITCH"
    | "UGC_REQUEST";
  match?: MatchResult | null;
};

export type OutreachDraftOutput = {
  subjectLine?: string;
  body: string;
};

function getDisplayName(creator: OutreachCreator) {
  return creator.displayName || creator.handle.replace("@", "");
}

function getCollaborationAngle(
  input: OutreachInput,
): MatchResult["recommendedCollaborationType"] {
  if (input.messageType === "GIFTED_COLLABORATION_PITCH") {
    return "GIFTED_COLLAB";
  }

  if (input.messageType === "PAID_COLLABORATION_PITCH") {
    return "PAID_COLLAB";
  }

  if (input.messageType === "UGC_REQUEST") {
    return "UGC_REQUEST";
  }

  return input.match?.recommendedCollaborationType ?? "GIFTED_COLLAB";
}

function getTonePhrases(tone: OutreachInput["tone"]) {
  switch (tone) {
    case "PROFESSIONAL":
      return {
        opener: "I’m reaching out from",
        appreciation: "I appreciate how clearly you communicate",
        closer: "If it sounds relevant, I’d be happy to share a short brief.",
      };
    case "PERSUASIVE":
      return {
        opener: "I’d love to explore a fit between",
        appreciation: "Your content has a strong trust-building feel",
        closer: "If there’s interest, I can send a simple idea and next steps today.",
      };
    default:
      return {
        opener: "I’m with",
        appreciation: "I love how approachable your content feels",
        closer: "If it sounds useful, I can send a short idea over.",
      };
  }
}

function buildOfferLine(
  input: OutreachInput,
  collaborationType: MatchResult["recommendedCollaborationType"],
) {
  const budgetSummary = formatCurrencyRange(input.business.budgetMin, input.business.budgetMax);
  const softerLine = input.match && input.match.pitchViabilityScore < 55;

  switch (collaborationType) {
    case "PAID_COLLAB":
      return softerLine
        ? `I think there could be a lighter paid test if your rates align with a ${budgetSummary.toLowerCase()} budget.`
        : `I think there could be a paid collaboration angle here, with a working budget around ${budgetSummary.toLowerCase()}.`;
    case "AFFILIATE_COLLAB":
      return "I think an affiliate-style partnership could be a practical way to test fit without overcomplicating the first step.";
    case "UGC_REQUEST":
      return "I think you’d be a strong fit for a simple UGC-style brief focused on useful, natural content.";
    case "LOCAL_AWARENESS_PLAY":
      return "I think a local awareness collaboration could work well, especially if the content stays rooted in your real local experience.";
    case "NOT_RECOMMENDED_YET":
      return "This would be a softer exploratory message rather than a hard pitch, just to see whether the fit feels natural.";
    default:
      return "I think a gifted-first collaboration could be the easiest place to start if the fit feels right.";
  }
}

function buildSubjectLine(
  input: OutreachInput,
  collaborationType: MatchResult["recommendedCollaborationType"],
) {
  const creatorName = getDisplayName(input.creator);

  if (input.channel !== "EMAIL") {
    return undefined;
  }

  if (input.messageType === "FOLLOW_UP") {
    return `Following up from ${input.business.name}`;
  }

  const label = collaborationTypeLabels[collaborationType];
  return `${input.business.name} x ${creatorName} (${label})`;
}

function buildReasonLine(input: OutreachInput) {
  const tag = input.creator.nicheTags[0] ?? "creator";
  const summary = input.business.productOrServiceSummary?.trim();
  const targetAudience = input.business.targetAudience?.trim();

  if (summary && targetAudience) {
    return `We help ${targetAudience} with ${summary.toLowerCase()}, and your ${tag.toLowerCase()} content feels like a natural audience match.`;
  }

  if (summary) {
    return `We’re building ${summary.toLowerCase()}, and your audience feels relevant for that kind of offer.`;
  }

  return `Your content style feels aligned with the kind of people we want to reach.`;
}

function buildFollowUpLine(input: OutreachInput) {
  const creatorName = getDisplayName(input.creator);

  if (input.channel === "EMAIL") {
    return `Hi ${creatorName}, just following up in case my last note got buried.`;
  }

  return `Hi ${creatorName}, just nudging this in case my last message got buried.`;
}

function buildBody(input: OutreachInput, collaborationType: MatchResult["recommendedCollaborationType"]) {
  const creatorName = getDisplayName(input.creator);
  const tone = getTonePhrases(input.tone);
  const reasonLine = buildReasonLine(input);
  const offerLine = buildOfferLine(input, collaborationType);
  const followerLine = `I’m looking at your ${followerBandSummary(
    input.creator.followerBand,
    input.creator.followerCount,
  ).toLowerCase()} presence and the way you show up for your audience.`;
  const matchLine =
    input.match?.softWarningMessage && input.messageType !== "FOLLOW_UP"
      ? `${input.match.softWarningMessage} With that in mind, I’d keep the first step simple.`
      : tone.closer;

  if (input.messageType === "FOLLOW_UP") {
    const lines = [
      buildFollowUpLine(input),
      `I’m still keen to explore whether a ${collaborationTypeLabels[collaborationType].toLowerCase()} could make sense with ${input.business.name}.`,
      "No pressure at all if the timing is not right.",
      tone.closer,
      `- ${input.business.name}`,
    ];
    return lines.filter(Boolean).join(input.channel === "EMAIL" ? "\n\n" : "\n");
  }

  const mediumLines = [
    input.channel === "EMAIL" ? `Hi ${creatorName},` : `Hi ${creatorName} -`,
    `${tone.opener} ${input.business.name}. ${tone.appreciation} in your ${input.creator.nicheTags[0] ?? "creator"} posts.`,
    reasonLine,
    followerLine,
    offerLine,
    matchLine,
    input.channel === "EMAIL" ? `Best,\n${input.business.name}` : `- ${input.business.name}`,
  ];

  const shortLines = [
    input.channel === "EMAIL" ? `Hi ${creatorName},` : `Hi ${creatorName} -`,
    `${tone.opener} ${input.business.name}. ${reasonLine}`,
    offerLine,
    tone.closer,
    input.channel === "EMAIL" ? `Best,\n${input.business.name}` : `- ${input.business.name}`,
  ];

  return (input.length === "SHORT" ? shortLines : mediumLines)
    .filter(Boolean)
    .join(input.channel === "EMAIL" ? "\n\n" : "\n");
}

export function generateOutreachDraft(input: OutreachInput): OutreachDraftOutput {
  const collaborationType = getCollaborationAngle(input);

  return {
    subjectLine: buildSubjectLine(input, collaborationType),
    body: buildBody(input, collaborationType),
  };
}

export function explainOutreachChoice(input: OutreachInput) {
  const collaborationType = getCollaborationAngle(input);
  const channel = outreachChannelLabels[input.channel].toLowerCase();
  const tone = brandToneLabels[input.tone].toLowerCase();
  const messageType = outreachMessageTypeLabels[input.messageType].toLowerCase();

  return `Generated a ${tone} ${messageType} for ${channel} using a ${collaborationTypeLabels[
    collaborationType
  ].toLowerCase()} angle.`;
}
