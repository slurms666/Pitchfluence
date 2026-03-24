import {
  campaignGoalLabels,
  collaborationTypeLabels,
  creatorPlatformLabels,
  fitLevelLabels,
  followerBandLabels,
  scoringWeights,
  socialProofLevelLabels,
} from "@/lib/constants";
import { canBusinessBeScored, getMissingBusinessFieldsForScoring } from "@/lib/business-readiness";
import {
  clamp,
  followerBandFromCount,
  keywordOverlap,
  normalizeKeywordSource,
  tokenize,
} from "@/lib/utils";

type CampaignGoal = typeof import("@/lib/constants").campaignGoalValues[number];
type BrandTone = typeof import("@/lib/constants").brandToneValues[number];
type SocialProofLevel = typeof import("@/lib/constants").socialProofLevelValues[number];
type CreatorPlatform = typeof import("@/lib/constants").creatorPlatformValues[number];
type FollowerBand = typeof import("@/lib/constants").followerBandValues[number];

type BusinessLike = {
  name: string;
  website?: string | null;
  productOrServiceSummary?: string | null;
  niche?: string | null;
  targetAudience?: string | null;
  targetRegion?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  campaignGoal?: CampaignGoal | null;
  socialProofLevel?: SocialProofLevel | null;
  socialProofNotes?: string | null;
  offerNotes?: string | null;
  brandToneDefault?: BrandTone | null;
};

type CreatorLike = {
  displayName: string;
  handle: string;
  platform: CreatorPlatform;
  bio?: string | null;
  nicheTags: string[];
  targetRegion?: string | null;
  creatorLocation?: string | null;
  followerCount?: number | null;
  followerBand?: FollowerBand | null;
  contentStyle?: string | null;
  audienceNotes?: string | null;
  commercialHistoryNotes?: string | null;
};

export type MatchResult = {
  audienceFitScore: number;
  audienceFitSummary: string;
  pitchViabilityScore: number;
  pitchViabilitySummary: string;
  campaignFitScore: number;
  campaignFitSummary: string;
  overallScore: number;
  fitLevel: "STRONG" | "POSSIBLE" | "LOW";
  recommendedCollaborationType:
    | "PAID_COLLAB"
    | "GIFTED_COLLAB"
    | "AFFILIATE_COLLAB"
    | "UGC_REQUEST"
    | "LOCAL_AWARENESS_PLAY"
    | "NOT_RECOMMENDED_YET";
  mainReason: string;
  softWarningMessage?: string;
  riskFlags: string[];
  nextStepGuidance: string;
};

type ScoreBreakdownContext = {
  audienceKeywords: Set<string>;
  creatorKeywords: Set<string>;
  regionScore: number;
  platformScore: number;
  nicheScore: number;
  contentScore: number;
  budgetRatio: number;
  expectedBudget: number;
  sizeFitScore: number;
  readinessScore: number;
};

const socialProofScoreMap = {
  NONE_YET: 8,
  SOME_CUSTOMER_TRACTION: 14,
  GROWING_BRAND: 19,
  ESTABLISHED_BRAND: 24,
} as const;

const creatorSizeBudgetFloor = {
  NANO: 75,
  MICRO: 250,
  RISING: 650,
  ESTABLISHED: 1800,
  LARGE: 5000,
} as const;

function getPlatformGoalScore(goal: BusinessLike["campaignGoal"], platform: CreatorLike["platform"]) {
  const matrix: Record<NonNullable<BusinessLike["campaignGoal"]>, Record<CreatorLike["platform"], number>> = {
    BRAND_AWARENESS: {
      INSTAGRAM: 18,
      TIKTOK: 20,
      YOUTUBE: 16,
      OTHER: 13,
    },
    SALES_CONVERSIONS: {
      INSTAGRAM: 17,
      TIKTOK: 15,
      YOUTUBE: 18,
      OTHER: 12,
    },
    LOCAL_FOOTFALL: {
      INSTAGRAM: 20,
      TIKTOK: 17,
      YOUTUBE: 12,
      OTHER: 14,
    },
    USER_GENERATED_CONTENT: {
      INSTAGRAM: 17,
      TIKTOK: 20,
      YOUTUBE: 14,
      OTHER: 12,
    },
    AFFILIATE_TEST_CAMPAIGN: {
      INSTAGRAM: 16,
      TIKTOK: 14,
      YOUTUBE: 19,
      OTHER: 12,
    },
  };

  if (!goal) {
    return 12;
  }

  return matrix[goal][platform];
}

function getExpectedBudget(band?: CreatorLike["followerBand"] | null, followerCount?: number | null) {
  const resolvedBand = band ?? followerBandFromCount(followerCount);
  return resolvedBand ? creatorSizeBudgetFloor[resolvedBand] : 250;
}

function getBudgetRatio(business: BusinessLike, creator: CreatorLike) {
  const availableBudget = business.budgetMax ?? business.budgetMin ?? 0;
  const expectedBudget = getExpectedBudget(creator.followerBand, creator.followerCount);

  if (availableBudget <= 0) {
    return {
      availableBudget,
      expectedBudget,
      ratio: 0,
    };
  }

  return {
    availableBudget,
    expectedBudget,
    ratio: availableBudget / expectedBudget,
  };
}

function getRegionScore(businessRegion?: string | null, creatorRegion?: string | null, goal?: BusinessLike["campaignGoal"]) {
  const businessValue = businessRegion?.trim().toLowerCase();
  const creatorValue = creatorRegion?.trim().toLowerCase();

  if (!businessValue || !creatorValue) {
    return 12;
  }

  if (businessValue === creatorValue) {
    return 20;
  }

  if (businessValue.includes(creatorValue) || creatorValue.includes(businessValue)) {
    return 18;
  }

  if (businessValue.includes("global") || creatorValue.includes("global")) {
    return 15;
  }

  if (goal === "LOCAL_FOOTFALL") {
    return 4;
  }

  return 9;
}

function getNicheScore(overlap: number) {
  if (overlap >= 5) {
    return 40;
  }

  if (overlap >= 3) {
    return 33;
  }

  if (overlap >= 2) {
    return 28;
  }

  if (overlap === 1) {
    return 22;
  }

  return 10;
}

function getContentRelevanceScore(overlap: number) {
  if (overlap >= 4) {
    return 20;
  }

  if (overlap >= 2) {
    return 16;
  }

  if (overlap === 1) {
    return 12;
  }

  return 8;
}

function buildContext(business: BusinessLike, creator: CreatorLike): ScoreBreakdownContext {
  const audienceKeywords = tokenize(
    normalizeKeywordSource(
      business.niche,
      business.productOrServiceSummary,
      business.targetAudience,
      business.targetRegion,
      business.campaignGoal ? campaignGoalLabels[business.campaignGoal] : undefined,
    ),
  );
  const creatorKeywords = tokenize(
    normalizeKeywordSource(
      creator.bio,
      creator.nicheTags.join(" "),
      creator.contentStyle,
      creator.audienceNotes,
      creator.commercialHistoryNotes,
      creatorPlatformLabels[creator.platform],
    ),
  );
  const overlap = keywordOverlap(audienceKeywords, creatorKeywords);
  const regionScore = getRegionScore(
    business.targetRegion,
    creator.targetRegion ?? creator.creatorLocation,
    business.campaignGoal,
  );
  const platformScore = getPlatformGoalScore(business.campaignGoal, creator.platform);
  const nicheScore = getNicheScore(overlap);
  const contentScore = getContentRelevanceScore(
    keywordOverlap(
      tokenize(normalizeKeywordSource(business.productOrServiceSummary, business.targetAudience)),
      tokenize(normalizeKeywordSource(creator.audienceNotes, creator.bio, creator.contentStyle)),
    ),
  );
  const budget = getBudgetRatio(business, creator);

  const sizeFitScore = (() => {
    const band = creator.followerBand ?? followerBandFromCount(creator.followerCount);
    const proofLevel = business.socialProofLevel ?? "NONE_YET";

    if (!band) {
      return 10;
    }

    if (band === "LARGE" && proofLevel === "NONE_YET") {
      return 2;
    }

    if (band === "ESTABLISHED" && proofLevel === "NONE_YET") {
      return 5;
    }

    if (band === "LARGE" && proofLevel === "SOME_CUSTOMER_TRACTION") {
      return 6;
    }

    if (band === "ESTABLISHED" && proofLevel === "SOME_CUSTOMER_TRACTION") {
      return 9;
    }

    if (band === "RISING" && proofLevel === "NONE_YET") {
      return 8;
    }

    return 15;
  })();

  const readinessScore =
    (business.website ? 6 : 0) +
    (business.offerNotes?.trim() ? 7 : 0) +
    ((business.productOrServiceSummary?.trim()?.length ?? 0) > 40 ? 7 : 3);

  return {
    audienceKeywords,
    creatorKeywords,
    regionScore,
    platformScore,
    nicheScore,
    contentScore,
    budgetRatio: budget.ratio,
    expectedBudget: budget.expectedBudget,
    sizeFitScore,
    readinessScore,
  };
}

export function recommendCollaborationType(
  business: BusinessLike,
  creator: CreatorLike,
  context: ScoreBreakdownContext,
  audienceFitScore: number,
  pitchViabilityScore: number,
) {
  const goal = business.campaignGoal;
  const band = creator.followerBand ?? followerBandFromCount(creator.followerCount);

  if (pitchViabilityScore < 35) {
    return "NOT_RECOMMENDED_YET" as const;
  }

  if (goal === "LOCAL_FOOTFALL" && context.regionScore >= 18) {
    return "LOCAL_AWARENESS_PLAY" as const;
  }

  if (goal === "USER_GENERATED_CONTENT") {
    return "UGC_REQUEST" as const;
  }

  if (goal === "AFFILIATE_TEST_CAMPAIGN") {
    return pitchViabilityScore >= 55 ? "AFFILIATE_COLLAB" : "GIFTED_COLLAB";
  }

  if (context.budgetRatio >= 0.8 && pitchViabilityScore >= 60) {
    return "PAID_COLLAB" as const;
  }

  if (
    context.budgetRatio < 0.5 &&
    (band === "ESTABLISHED" || band === "LARGE") &&
    audienceFitScore >= 60
  ) {
    return "AFFILIATE_COLLAB" as const;
  }

  if (
    creator.contentStyle?.toLowerCase().includes("ugc") ||
    creator.contentStyle?.toLowerCase().includes("review") ||
    creator.contentStyle?.toLowerCase().includes("tutorial")
  ) {
    return "UGC_REQUEST" as const;
  }

  if (context.budgetRatio < 0.55) {
    return "GIFTED_COLLAB" as const;
  }

  return "PAID_COLLAB" as const;
}

function getAudienceFitSummary(
  creator: CreatorLike,
  context: ScoreBreakdownContext,
  score: number,
) {
  const parts: string[] = [];

  if (context.nicheScore >= 28) {
    parts.push("there is a clear niche overlap");
  } else if (context.nicheScore >= 22) {
    parts.push("there is a workable niche overlap");
  } else {
    parts.push("the niche overlap is fairly broad");
  }

  if (context.regionScore >= 18) {
    parts.push("the geography lines up well");
  } else if (context.regionScore <= 6) {
    parts.push("the region is a weaker match for a local-first campaign");
  }

  if (context.platformScore >= 18) {
    parts.push(`${creatorPlatformLabels[creator.platform]} is a strong platform for this goal`);
  } else if (context.platformScore <= 13) {
    parts.push(`${creatorPlatformLabels[creator.platform]} is not the strongest platform for this goal`);
  }

  if (score >= 80) {
    return `Strong audience fit because ${parts.join(", ")}.`;
  }

  if (score >= 60) {
    return `Possible audience fit because ${parts.join(", ")}.`;
  }

  return `Low audience fit for this stage because ${parts.join(", ")}.`;
}

function getPitchViabilitySummary(
  business: BusinessLike,
  creator: CreatorLike,
  context: ScoreBreakdownContext,
  score: number,
) {
  const proofLabel = business.socialProofLevel
    ? socialProofLevelLabels[business.socialProofLevel]
    : "limited social proof";
  const band = creator.followerBand ?? followerBandFromCount(creator.followerCount);
  const creatorBandLabel = band ? followerBandLabels[band] : "unknown-size";

  const budgetLine =
    context.budgetRatio >= 0.8
      ? "the current budget is realistic for this creator size"
      : context.budgetRatio >= 0.5
        ? "the budget is in range but may need a carefully framed offer"
        : "the budget looks tighter than this creator size usually suits";

  const readinessLine =
    context.readinessScore >= 16 ? "the business profile feels pitch-ready" : "the offer may need stronger detail";

  if (score >= 80) {
    return `Strong pitch viability because ${budgetLine}, ${readinessLine}, and ${proofLabel.toLowerCase()} supports a ${creatorBandLabel.toLowerCase()} creator approach.`;
  }

  if (score >= 60) {
    return `Possible pitch viability because ${budgetLine}, while ${proofLabel.toLowerCase()} gives you enough credibility to test the angle.`;
  }

  return `Low pitch viability for this stage because ${budgetLine}, ${readinessLine}, and ${proofLabel.toLowerCase()} may not fully support a ${creatorBandLabel.toLowerCase()} creator pitch yet.`;
}

function getCampaignFitSummary(
  business: BusinessLike,
  creator: CreatorLike,
  recommendedCollaborationType: MatchResult["recommendedCollaborationType"],
  score: number,
) {
  const goalLabel = business.campaignGoal ? campaignGoalLabels[business.campaignGoal] : "current goal";
  const collabLabel = collaborationTypeLabels[recommendedCollaborationType].toLowerCase();
  const platformLabel = creatorPlatformLabels[creator.platform];

  if (score >= 80) {
    return `Strong campaign fit because a ${collabLabel} is a practical way to support ${goalLabel.toLowerCase()} on ${platformLabel}.`;
  }

  if (score >= 60) {
    return `Possible campaign fit because a ${collabLabel} can support ${goalLabel.toLowerCase()}, although the brief should stay simple.`;
  }

  return `Low campaign fit for this stage because the current goal and channel may need a softer or different collaboration angle.`;
}

function getCampaignCollaborationScore(
  goal: BusinessLike["campaignGoal"],
  collaborationType: MatchResult["recommendedCollaborationType"],
) {
  if (!goal) {
    return 20;
  }

  const matrix: Record<NonNullable<BusinessLike["campaignGoal"]>, Record<MatchResult["recommendedCollaborationType"], number>> = {
    BRAND_AWARENESS: {
      PAID_COLLAB: 35,
      GIFTED_COLLAB: 30,
      AFFILIATE_COLLAB: 22,
      UGC_REQUEST: 27,
      LOCAL_AWARENESS_PLAY: 32,
      NOT_RECOMMENDED_YET: 10,
    },
    SALES_CONVERSIONS: {
      PAID_COLLAB: 30,
      GIFTED_COLLAB: 22,
      AFFILIATE_COLLAB: 35,
      UGC_REQUEST: 24,
      LOCAL_AWARENESS_PLAY: 18,
      NOT_RECOMMENDED_YET: 10,
    },
    LOCAL_FOOTFALL: {
      PAID_COLLAB: 24,
      GIFTED_COLLAB: 18,
      AFFILIATE_COLLAB: 14,
      UGC_REQUEST: 20,
      LOCAL_AWARENESS_PLAY: 35,
      NOT_RECOMMENDED_YET: 10,
    },
    USER_GENERATED_CONTENT: {
      PAID_COLLAB: 26,
      GIFTED_COLLAB: 22,
      AFFILIATE_COLLAB: 16,
      UGC_REQUEST: 35,
      LOCAL_AWARENESS_PLAY: 18,
      NOT_RECOMMENDED_YET: 10,
    },
    AFFILIATE_TEST_CAMPAIGN: {
      PAID_COLLAB: 24,
      GIFTED_COLLAB: 25,
      AFFILIATE_COLLAB: 35,
      UGC_REQUEST: 18,
      LOCAL_AWARENESS_PLAY: 16,
      NOT_RECOMMENDED_YET: 10,
    },
  };

  return matrix[goal][collaborationType];
}

function getRiskFlags(
  business: BusinessLike,
  creator: CreatorLike,
  context: ScoreBreakdownContext,
  audienceFitScore: number,
  pitchViabilityScore: number,
) {
  const flags: string[] = [];

  if (context.budgetRatio < 0.5) {
    flags.push("Budget may suit smaller creators first");
  }

  if (
    business.socialProofLevel === "NONE_YET" &&
    ["ESTABLISHED", "LARGE"].includes(creator.followerBand ?? followerBandFromCount(creator.followerCount) ?? "")
  ) {
    flags.push("This offer may need stronger proof before approaching creators at this size");
  }

  if (business.campaignGoal === "LOCAL_FOOTFALL" && context.regionScore <= 6) {
    flags.push("Region mismatch for a local footfall campaign");
  }

  if (audienceFitScore < 55) {
    flags.push("Audience overlap looks broad rather than highly specific");
  }

  if (pitchViabilityScore < 50) {
    flags.push("The pitch may need a simpler ask or a clearer offer");
  }

  return [...new Set(flags)].slice(0, 3);
}

function getFitLevel(score: number) {
  if (score >= 80) {
    return "STRONG" as const;
  }

  if (score >= 60) {
    return "POSSIBLE" as const;
  }

  return "LOW" as const;
}

function getSoftWarning(
  fitLevel: MatchResult["fitLevel"],
  audienceFitScore: number,
  pitchViabilityScore: number,
  campaignFitScore: number,
) {
  if (fitLevel === "STRONG") {
    return undefined;
  }

  if (pitchViabilityScore < 55) {
    return "This offer may need stronger proof or budget before it feels easy to pitch.";
  }

  if (audienceFitScore < 55) {
    return "The audience match is broad, so a personalised opener will matter more here.";
  }

  if (campaignFitScore < 55) {
    return "A softer ask may work better than a direct sponsorship angle right now.";
  }

  return "This could work with caveats, so keep the outreach specific and low pressure.";
}

function getMainReason(
  audienceFitScore: number,
  pitchViabilityScore: number,
  campaignFitScore: number,
  collaborationType: MatchResult["recommendedCollaborationType"],
) {
  if (pitchViabilityScore >= audienceFitScore && pitchViabilityScore >= campaignFitScore) {
    return `Pitch viability is the clearest driver here, and a ${collaborationTypeLabels[collaborationType].toLowerCase()} feels realistic.`;
  }

  if (audienceFitScore >= campaignFitScore) {
    return "Audience overlap is the clearest strength in this match.";
  }

  return "The campaign goal and collaboration angle line up well for this creator.";
}

function getNextStepGuidance(
  fitLevel: MatchResult["fitLevel"],
  collaborationType: MatchResult["recommendedCollaborationType"],
) {
  const collaborationLabel = collaborationTypeLabels[collaborationType].toLowerCase();

  if (fitLevel === "STRONG") {
    return `Shortlist this creator and lead with a concise ${collaborationLabel} message that references a specific piece of their content.`;
  }

  if (fitLevel === "POSSIBLE") {
    return `Shortlist with caveats and keep the ask simple. A ${collaborationLabel} angle is the safest starting point.`;
  }

  return "Keep this creator in view, but smaller or more tightly matched creators may be easier first wins.";
}

export function scoreCreatorForBusiness(business: BusinessLike, creator: CreatorLike): MatchResult {
  const missingFields = getMissingBusinessFieldsForScoring(business);

  if (!canBusinessBeScored(business)) {
    return {
      audienceFitScore: 0,
      audienceFitSummary: `Complete ${missingFields.join(", ")} before scoring this creator.`,
      pitchViabilityScore: 0,
      pitchViabilitySummary: "Pitch viability is unavailable until the business profile is complete enough to score.",
      campaignFitScore: 0,
      campaignFitSummary: "Campaign fit is unavailable until a scoring-ready business profile is selected.",
      overallScore: 0,
      fitLevel: "LOW",
      recommendedCollaborationType: "NOT_RECOMMENDED_YET",
      mainReason: "This business profile still needs a few basics before Pitchfluence can score creators honestly.",
      softWarningMessage: "Finish the business profile first so the score reflects your real offer.",
      riskFlags: ["Business profile is missing required scoring fields"],
      nextStepGuidance: "Add the missing business details, then rescore this creator.",
    };
  }

  const context = buildContext(business, creator);

  const audienceFitScore = clamp(
    context.nicheScore + context.regionScore + context.platformScore + context.contentScore,
    0,
    100,
  );

  const budgetScore =
    context.budgetRatio >= 1.2
      ? 45
      : context.budgetRatio >= 0.8
        ? 38
        : context.budgetRatio >= 0.5
          ? 28
          : context.budgetRatio >= 0.25
            ? 17
            : context.budgetRatio > 0
              ? 10
              : 0;

  const proofScore = business.socialProofLevel ? socialProofScoreMap[business.socialProofLevel] : 8;
  const pitchViabilityScore = clamp(
    budgetScore + proofScore + context.readinessScore + context.sizeFitScore,
    0,
    100,
  );

  const recommendedCollaborationType = recommendCollaborationType(
    business,
    creator,
    context,
    audienceFitScore,
    pitchViabilityScore,
  );

  const collaborationScore = getCampaignCollaborationScore(
    business.campaignGoal,
    recommendedCollaborationType,
  );
  const contentStyleScore =
    creator.contentStyle?.trim() && context.contentScore >= 16
      ? 25
      : context.contentScore >= 12
        ? 18
        : 12;
  const campaignFitScore = clamp(context.platformScore * 2 + collaborationScore + contentStyleScore, 0, 100);

  let overallScore = Math.round(
    audienceFitScore * scoringWeights.audienceFit +
      pitchViabilityScore * scoringWeights.pitchViability +
      campaignFitScore * scoringWeights.campaignFit,
  );

  // Pitchfluence should stay conservative when the pitch itself is not realistic yet.
  if (pitchViabilityScore < 30) {
    overallScore = Math.min(overallScore, 39);
  } else if (pitchViabilityScore < 45) {
    overallScore = Math.min(overallScore, 59);
  }

  const fitLevel = getFitLevel(overallScore);
  const riskFlags = getRiskFlags(business, creator, context, audienceFitScore, pitchViabilityScore);

  return {
    audienceFitScore,
    audienceFitSummary: getAudienceFitSummary(creator, context, audienceFitScore),
    pitchViabilityScore,
    pitchViabilitySummary: getPitchViabilitySummary(business, creator, context, pitchViabilityScore),
    campaignFitScore,
    campaignFitSummary: getCampaignFitSummary(
      business,
      creator,
      recommendedCollaborationType,
      campaignFitScore,
    ),
    overallScore,
    fitLevel,
    recommendedCollaborationType,
    mainReason: getMainReason(
      audienceFitScore,
      pitchViabilityScore,
      campaignFitScore,
      recommendedCollaborationType,
    ),
    softWarningMessage: getSoftWarning(
      fitLevel,
      audienceFitScore,
      pitchViabilityScore,
      campaignFitScore,
    ),
    riskFlags,
    nextStepGuidance: getNextStepGuidance(fitLevel, recommendedCollaborationType),
  };
}

export function rankCreatorsForBusiness<TCreator extends CreatorLike>(business: BusinessLike, creators: TCreator[]) {
  return creators
    .map((creator) => ({
      creator,
      match: scoreCreatorForBusiness(business, creator),
    }))
    .sort((left, right) => right.match.overallScore - left.match.overallScore);
}

export function explainFitBand(score: number) {
  if (score >= 80) {
    return fitLevelLabels.STRONG;
  }

  if (score >= 60) {
    return fitLevelLabels.POSSIBLE;
  }

  return fitLevelLabels.LOW;
}
