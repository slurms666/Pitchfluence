"use server";

import { redirect } from "next/navigation";

import { assertWorkspaceAccess } from "@/lib/auth";
import { db } from "@/lib/db";
import { resetAndSeedDemoData } from "@/lib/demo-seed";

export async function reseedDemoDataAction() {
  await assertWorkspaceAccess();

  if (process.env.ALLOW_DEMO_RESEED !== "true") {
    redirect("/settings");
  }

  await resetAndSeedDemoData(db);
  redirect("/settings?reseed=1");
}
