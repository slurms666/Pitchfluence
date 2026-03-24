export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "Pitchfluence";

export const ACCESS_COOKIE_NAME = "pitchfluence_access";
export const SELECTED_BUSINESS_COOKIE_NAME = "pitchfluence_business";

export const dashboardLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/business-profiles", label: "Business Profiles" },
  { href: "/creators", label: "Creators" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/outreach", label: "Outreach" },
  { href: "/settings", label: "Settings" },
] as const;

export const creatorPlatformValues = ["INSTAGRAM", "TIKTOK", "YOUTUBE", "OTHER"] as const;
export const creatorPlatformLabels: Record<(typeof creatorPlatformValues)[number], string> = {
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  YOUTUBE: "YouTube",
  OTHER: "Other",
};

export const creatorSourceTypeValues = ["DEMO", "MANUAL"] as const;
export const creatorSourceTypeLabels: Record<(typeof creatorSourceTypeValues)[number], string> = {
  DEMO: "Demo",
  MANUAL: "Manual",
};

export const followerBandValues = ["NANO", "MICRO", "RISING", "ESTABLISHED", "LARGE"] as const;
export const followerBandLabels: Record<(typeof followerBandValues)[number], string> = {
  NANO: "Nano",
  MICRO: "Micro",
  RISING: "Rising",
  ESTABLISHED: "Established",
  LARGE: "Large",
};

export const campaignGoalValues = [
  "BRAND_AWARENESS",
  "SALES_CONVERSIONS",
  "LOCAL_FOOTFALL",
  "USER_GENERATED_CONTENT",
  "AFFILIATE_TEST_CAMPAIGN",
] as const;
export const campaignGoalLabels: Record<(typeof campaignGoalValues)[number], string> = {
  BRAND_AWARENESS: "Brand awareness",
  SALES_CONVERSIONS: "Sales / conversions",
  LOCAL_FOOTFALL: "Local footfall",
  USER_GENERATED_CONTENT: "User-generated content",
  AFFILIATE_TEST_CAMPAIGN: "Affiliate / test campaign",
};

export const socialProofLevelValues = [
  "NONE_YET",
  "SOME_CUSTOMER_TRACTION",
  "GROWING_BRAND",
  "ESTABLISHED_BRAND",
] as const;
export const socialProofLevelLabels: Record<(typeof socialProofLevelValues)[number], string> = {
  NONE_YET: "None yet",
  SOME_CUSTOMER_TRACTION: "Some customer traction",
  GROWING_BRAND: "Growing brand",
  ESTABLISHED_BRAND: "Established brand",
};

export const brandToneValues = ["PROFESSIONAL", "FRIENDLY", "PERSUASIVE"] as const;
export const brandToneLabels: Record<(typeof brandToneValues)[number], string> = {
  PROFESSIONAL: "Professional",
  FRIENDLY: "Friendly",
  PERSUASIVE: "Persuasive",
};

export const fitLevelValues = ["STRONG", "POSSIBLE", "LOW"] as const;
export const fitLevelLabels: Record<(typeof fitLevelValues)[number], string> = {
  STRONG: "Strong",
  POSSIBLE: "Possible",
  LOW: "Low fit for this stage",
};

export const collaborationTypeValues = [
  "PAID_COLLAB",
  "GIFTED_COLLAB",
  "AFFILIATE_COLLAB",
  "UGC_REQUEST",
  "LOCAL_AWARENESS_PLAY",
  "NOT_RECOMMENDED_YET",
] as const;
export const collaborationTypeLabels: Record<(typeof collaborationTypeValues)[number], string> = {
  PAID_COLLAB: "Paid collaboration",
  GIFTED_COLLAB: "Gifted collaboration",
  AFFILIATE_COLLAB: "Affiliate collaboration",
  UGC_REQUEST: "UGC request",
  LOCAL_AWARENESS_PLAY: "Local awareness play",
  NOT_RECOMMENDED_YET: "Not recommended yet",
};

export const pipelineStageValues = [
  "NEW",
  "SHORTLISTED",
  "READY_TO_CONTACT",
  "CONTACTED",
  "REPLIED",
  "NEGOTIATING",
  "AGREED",
  "COMPLETED",
  "REJECTED",
] as const;
export const pipelineStageLabels: Record<(typeof pipelineStageValues)[number], string> = {
  NEW: "New",
  SHORTLISTED: "Shortlisted",
  READY_TO_CONTACT: "Ready to Contact",
  CONTACTED: "Contacted",
  REPLIED: "Replied",
  NEGOTIATING: "Negotiating",
  AGREED: "Agreed",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
};
export const activePipelineStages = pipelineStageValues.filter(
  (value) => value !== "COMPLETED" && value !== "REJECTED",
);

export const reminderStatusValues = ["OPEN", "COMPLETED"] as const;
export const reminderStatusLabels: Record<(typeof reminderStatusValues)[number], string> = {
  OPEN: "Open",
  COMPLETED: "Completed",
};

export const outreachChannelValues = ["EMAIL", "INSTAGRAM_DM", "TIKTOK_DM"] as const;
export const outreachChannelLabels: Record<(typeof outreachChannelValues)[number], string> = {
  EMAIL: "Email",
  INSTAGRAM_DM: "Instagram DM",
  TIKTOK_DM: "TikTok DM",
};

export const outreachLengthValues = ["SHORT", "MEDIUM"] as const;
export const outreachLengthLabels: Record<(typeof outreachLengthValues)[number], string> = {
  SHORT: "Short",
  MEDIUM: "Medium",
};

export const outreachMessageTypeValues = [
  "INITIAL_OUTREACH",
  "FOLLOW_UP",
  "GIFTED_COLLABORATION_PITCH",
  "PAID_COLLABORATION_PITCH",
  "UGC_REQUEST",
] as const;
export const outreachMessageTypeLabels: Record<(typeof outreachMessageTypeValues)[number], string> = {
  INITIAL_OUTREACH: "Initial outreach",
  FOLLOW_UP: "Follow-up",
  GIFTED_COLLABORATION_PITCH: "Gifted collaboration pitch",
  PAID_COLLABORATION_PITCH: "Paid collaboration pitch",
  UGC_REQUEST: "UGC request",
};

export const scoringWeights = {
  audienceFit: 0.35,
  pitchViability: 0.4,
  campaignFit: 0.25,
} as const;

export const stageOrder = pipelineStageValues.reduce<Record<string, number>>((accumulator, stage, index) => {
  accumulator[stage] = index;
  return accumulator;
}, {});
