export function getMissingBusinessFieldsForScoring(business: {
  name?: string | null;
  productOrServiceSummary?: string | null;
  targetAudience?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  campaignGoal?: string | null;
  socialProofLevel?: string | null;
}) {
  const missing: string[] = [];

  if (!business.name?.trim()) {
    missing.push("name");
  }

  if (!business.productOrServiceSummary?.trim()) {
    missing.push("product or service summary");
  }

  if (!business.targetAudience?.trim()) {
    missing.push("target audience");
  }

  if (business.budgetMin == null && business.budgetMax == null) {
    missing.push("budget");
  }

  if (!business.campaignGoal) {
    missing.push("campaign goal");
  }

  if (!business.socialProofLevel) {
    missing.push("social proof level");
  }

  return missing;
}

export function canBusinessBeScored(business: Parameters<typeof getMissingBusinessFieldsForScoring>[0]) {
  return getMissingBusinessFieldsForScoring(business).length === 0;
}
