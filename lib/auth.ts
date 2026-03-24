import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_COOKIE_NAME } from "@/lib/constants";

function getPasscode() {
  return process.env.APP_ACCESS_PASSCODE ?? "pitchfluence-demo";
}

function getCookieSecret() {
  return process.env.APP_ACCESS_COOKIE_SECRET ?? "pitchfluence-cookie-secret";
}

function signatureFor(value: string) {
  return createHmac("sha256", getCookieSecret()).update(value).digest("hex");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function getExpectedAccessToken() {
  return signatureFor(getPasscode());
}

export async function hasWorkspaceAccess() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return safeCompare(token, getExpectedAccessToken());
}

export async function assertWorkspaceAccess() {
  const allowed = await hasWorkspaceAccess();

  if (!allowed) {
    redirect("/access");
  }
}

export function validatePasscodeInput(passcode: string) {
  return safeCompare(signatureFor(passcode), signatureFor(getPasscode()));
}

export async function setWorkspaceAccessCookie() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: ACCESS_COOKIE_NAME,
    value: getExpectedAccessToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearWorkspaceAccessCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE_NAME);
}
