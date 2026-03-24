"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { assertWorkspaceAccess } from "@/lib/auth";
import { SELECTED_BUSINESS_COOKIE_NAME } from "@/lib/constants";
import { db } from "@/lib/db";
import { buildActionErrors, businessProfileSchema, type ActionState } from "@/lib/validation";

export async function createBusinessProfileAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const parsed = businessProfileSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    productOrServiceSummary: formData.get("productOrServiceSummary"),
    niche: formData.get("niche"),
    targetAudience: formData.get("targetAudience"),
    targetRegion: formData.get("targetRegion"),
    budgetMin: formData.get("budgetMin"),
    budgetMax: formData.get("budgetMax"),
    campaignGoal: formData.get("campaignGoal"),
    socialProofLevel: formData.get("socialProofLevel"),
    socialProofNotes: formData.get("socialProofNotes"),
    offerNotes: formData.get("offerNotes"),
    brandToneDefault: formData.get("brandToneDefault"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  const created = await db.businessProfile.create({
    data: parsed.data,
  });

  const cookieStore = await cookies();
  cookieStore.set({
    name: SELECTED_BUSINESS_COOKIE_NAME,
    value: created.id,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect(`/business-profiles/${created.id}`);
}

export async function updateBusinessProfileAction(
  businessId: string,
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertWorkspaceAccess();

  const parsed = businessProfileSchema.safeParse({
    name: formData.get("name"),
    website: formData.get("website"),
    productOrServiceSummary: formData.get("productOrServiceSummary"),
    niche: formData.get("niche"),
    targetAudience: formData.get("targetAudience"),
    targetRegion: formData.get("targetRegion"),
    budgetMin: formData.get("budgetMin"),
    budgetMax: formData.get("budgetMax"),
    campaignGoal: formData.get("campaignGoal"),
    socialProofLevel: formData.get("socialProofLevel"),
    socialProofNotes: formData.get("socialProofNotes"),
    offerNotes: formData.get("offerNotes"),
    brandToneDefault: formData.get("brandToneDefault"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  await db.businessProfile.update({
    where: {
      id: businessId,
    },
    data: parsed.data,
  });

  redirect(`/business-profiles/${businessId}`);
}

export async function deleteBusinessProfileAction(businessId: string) {
  await assertWorkspaceAccess();

  await db.businessProfile.delete({
    where: {
      id: businessId,
    },
  });

  const cookieStore = await cookies();
  cookieStore.delete(SELECTED_BUSINESS_COOKIE_NAME);

  redirect("/business-profiles");
}
