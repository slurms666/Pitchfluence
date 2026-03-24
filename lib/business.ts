import "server-only";

import { cookies } from "next/headers";

import { SELECTED_BUSINESS_COOKIE_NAME } from "@/lib/constants";
import { db } from "@/lib/db";
export { canBusinessBeScored, getMissingBusinessFieldsForScoring } from "@/lib/business-readiness";

export type SelectedBusinessContext = {
  businesses: Awaited<ReturnType<typeof getBusinessProfiles>>;
  selectedBusiness: Awaited<ReturnType<typeof getSelectedBusinessProfile>>;
};

export async function getBusinessProfiles() {
  return db.businessProfile.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getSelectedBusinessProfile() {
  const businessProfiles = await getBusinessProfiles();
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(SELECTED_BUSINESS_COOKIE_NAME)?.value;

  if (!selectedId) {
    return businessProfiles[0] ?? null;
  }

  return businessProfiles.find((profile) => profile.id === selectedId) ?? businessProfiles[0] ?? null;
}

export async function getSelectedBusinessContext(): Promise<SelectedBusinessContext> {
  const [businesses, selectedBusiness] = await Promise.all([
    getBusinessProfiles(),
    getSelectedBusinessProfile(),
  ]);

  return {
    businesses,
    selectedBusiness,
  };
}
