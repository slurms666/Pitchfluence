import { describe, expect, it } from "vitest";

import { generateOutreachDraft } from "@/lib/outreach";

const business = {
  name: "Northline Coaching",
  productOrServiceSummary:
    "online strength coaching and habit-based programmes for professionals who want realistic fitness structure",
  targetAudience: "busy adults who want sustainable strength training without extreme routines",
  budgetMin: 150,
  budgetMax: 900,
  campaignGoal: "USER_GENERATED_CONTENT",
  brandToneDefault: "PROFESSIONAL" as const,
  offerNotes: "Open to gifted programme access and UGC content.",
};

const creator = {
  displayName: "Fit With Kiana",
  handle: "@fitwithkiana",
  platform: "TIKTOK" as const,
  nicheTags: ["fitness", "wellness", "habits"],
  contentStyle: "Short-form training clips, voiceover tips, and realistic beginner fitness updates.",
  audienceNotes: "Women in their 20s and 30s who want fitness advice without intimidation.",
  followerCount: 32700,
  followerBand: "MICRO" as const,
};

const match = {
  audienceFitScore: 80,
  audienceFitSummary: "Strong audience fit.",
  pitchViabilityScore: 68,
  pitchViabilitySummary: "Possible pitch viability.",
  campaignFitScore: 86,
  campaignFitSummary: "Strong campaign fit.",
  overallScore: 77,
  fitLevel: "POSSIBLE" as const,
  recommendedCollaborationType: "UGC_REQUEST" as const,
  mainReason: "Campaign goal and creator style line up for UGC.",
  softWarningMessage: "Keep the first step simple.",
  riskFlags: [],
  nextStepGuidance: "Lead with a UGC angle.",
};

describe("generateOutreachDraft", () => {
  it("creates an email with a subject line", () => {
    const draft = generateOutreachDraft({
      business,
      creator,
      channel: "EMAIL",
      tone: "FRIENDLY",
      length: "MEDIUM",
      messageType: "INITIAL_OUTREACH",
      match,
    });

    expect(draft.subjectLine).toContain("Northline Coaching");
    expect(draft.body).toContain("Hi Fit With Kiana");
    expect(draft.body).toContain("UGC");
  });

  it("keeps DM output compact and without a subject line", () => {
    const draft = generateOutreachDraft({
      business,
      creator,
      channel: "INSTAGRAM_DM",
      tone: "PROFESSIONAL",
      length: "SHORT",
      messageType: "FOLLOW_UP",
      match,
    });

    expect(draft.subjectLine).toBeUndefined();
    expect(draft.body).toContain("message got buried");
    expect(draft.body.split("\n").length).toBeLessThanOrEqual(5);
  });
});
