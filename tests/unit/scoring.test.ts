import { describe, expect, it } from "vitest";

import { recommendCollaborationType, scoreCreatorForBusiness } from "@/lib/scoring";

const skincareBusiness = {
  name: "Luma Skin Co",
  website: "https://lumaskin.example.com",
  productOrServiceSummary:
    "science-backed skincare kits for busy professionals who want a simple glow routine",
  niche: "skincare beauty wellness",
  targetAudience: "women aged 24 to 40 who want low-fuss skincare and visible results",
  targetRegion: "Global English-speaking",
  budgetMin: 250,
  budgetMax: 1200,
  campaignGoal: "SALES_CONVERSIONS" as const,
  socialProofLevel: "GROWING_BRAND" as const,
  offerNotes: "Open to gifted first tests, paid creator whitelisting later, and before/after UGC.",
  brandToneDefault: "FRIENDLY" as const,
};

const beautyCreator = {
  displayName: "Glow With Sana",
  handle: "@glowwithsana",
  platform: "TIKTOK" as const,
  bio: "Skincare educator who breaks down routines, ingredients, and before-and-after experiments.",
  nicheTags: ["skincare", "beauty", "education"],
  targetRegion: "Global English-speaking",
  creatorLocation: "Dubai",
  followerCount: 84200,
  followerBand: "RISING" as const,
  contentStyle: "Ingredient explainers, comparison videos, and routine demos.",
  audienceNotes: "Beauty consumers comparing products and trying to build simple routines.",
  commercialHistoryNotes: "Paid skincare integrations and UGC licensing.",
};

describe("scoreCreatorForBusiness", () => {
  it("returns a strong match for a well-aligned creator", () => {
    const match = scoreCreatorForBusiness(skincareBusiness, beautyCreator);

    expect(match.overallScore).toBeGreaterThanOrEqual(75);
    expect(match.audienceFitScore).toBeGreaterThan(match.pitchViabilityScore - 25);
    expect(match.fitLevel).toBe("STRONG");
    expect(match.recommendedCollaborationType).toBe("PAID_COLLAB");
  });

  it("softens viability when budget and proof are too low for creator size", () => {
    const earlyBusiness = {
      ...skincareBusiness,
      budgetMin: 50,
      budgetMax: 150,
      socialProofLevel: "NONE_YET" as const,
      offerNotes: "Open to a soft gifted try.",
    };
    const largerCreator = {
      ...beautyCreator,
      followerCount: 220000,
      followerBand: "ESTABLISHED" as const,
    };

    const match = scoreCreatorForBusiness(earlyBusiness, largerCreator);

    expect(match.pitchViabilityScore).toBeLessThan(55);
    expect(match.fitLevel).toBe("LOW");
    expect(match.softWarningMessage).toContain("stronger proof or budget");
    expect(match.riskFlags).toContain("Budget may suit smaller creators first");
  });
});

describe("recommendCollaborationType", () => {
  it("leans into local awareness for strong local footfall matches", () => {
    const localBusiness = {
      name: "Harbor Cup Cafe",
      productOrServiceSummary: "independent specialty cafe",
      targetAudience: "local cafe regulars",
      targetRegion: "Toronto",
      budgetMax: 350,
      campaignGoal: "LOCAL_FOOTFALL" as const,
      socialProofLevel: "SOME_CUSTOMER_TRACTION" as const,
    };
    const localCreator = {
      displayName: "Maria Eats Local",
      handle: "@mariaeatslocal",
      platform: "INSTAGRAM" as const,
      nicheTags: ["food", "cafe", "toronto"],
      targetRegion: "Toronto",
      creatorLocation: "Toronto",
      followerCount: 18400,
      followerBand: "MICRO" as const,
      contentStyle: "Local cafe spotlights and menu reviews",
    };

    const collaborationType = recommendCollaborationType(
      localBusiness,
      localCreator,
      {
        audienceKeywords: new Set(["cafe", "toronto"]),
        creatorKeywords: new Set(["cafe", "toronto"]),
        regionScore: 20,
        platformScore: 20,
        nicheScore: 33,
        contentScore: 18,
        budgetRatio: 1.4,
        expectedBudget: 250,
        sizeFitScore: 15,
        readinessScore: 18,
      },
      82,
      77,
    );

    expect(collaborationType).toBe("LOCAL_AWARENESS_PLAY");
  });
});
