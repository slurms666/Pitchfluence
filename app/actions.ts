"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { clearWorkspaceAccessCookie, setWorkspaceAccessCookie, validatePasscodeInput } from "@/lib/auth";
import { SELECTED_BUSINESS_COOKIE_NAME } from "@/lib/constants";
import { accessSchema, buildActionErrors, type ActionState } from "@/lib/validation";
import { optionalString, safeRedirectPath } from "@/lib/utils";

export async function unlockWorkspaceAction(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = accessSchema.safeParse({
    passcode: formData.get("passcode"),
  });

  if (!parsed.success) {
    return buildActionErrors(parsed.error);
  }

  if (!validatePasscodeInput(parsed.data.passcode)) {
    return {
      success: false,
      message: "That passcode did not match. Please try again.",
    };
  }

  await setWorkspaceAccessCookie();

  const redirectTo = safeRedirectPath(optionalString(formData.get("redirectTo")), "/");
  redirect(redirectTo);
}

export async function setSelectedBusinessAction(formData: FormData) {
  const cookieStore = await cookies();
  const businessProfileId = optionalString(formData.get("businessProfileId"));
  const redirectTo = safeRedirectPath(optionalString(formData.get("redirectTo")), "/");

  if (businessProfileId) {
    cookieStore.set({
      name: SELECTED_BUSINESS_COOKIE_NAME,
      value: businessProfileId,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30,
    });
  } else {
    cookieStore.delete(SELECTED_BUSINESS_COOKIE_NAME);
  }

  redirect(redirectTo);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SELECTED_BUSINESS_COOKIE_NAME);
  await clearWorkspaceAccessCookie();
  redirect("/access");
}
