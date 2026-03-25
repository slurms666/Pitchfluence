import { expect, test } from "@playwright/test";

const passcode = process.env.APP_ACCESS_PASSCODE ?? "pitchfluence-demo";

test("critical MVP flow works end to end", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const businessName = `Playwright Studio ${suffix}`;
  const creatorName = `Playwright Creator ${suffix}`;
  const creatorHandle = `@playwright${suffix}`;
  const reminderDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);

  await page.goto("/access");
  await page.getByLabel("Shared passcode").fill(passcode);
  await page.getByRole("button", { name: "Enter Pitchfluence" }).click();

  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Create business profile" }).first().click();
  await expect(page.getByRole("heading", { name: "Create Business Profile", exact: true })).toBeVisible();

  await page.getByLabel("Business name").fill(businessName);
  await page.getByLabel("Product or service summary").fill("a friendly stationery brand for creative freelancers");
  await page.getByLabel("Target audience").fill("creative freelancers and small studio owners");
  await page.getByLabel("Budget max").fill("600");
  await page.getByLabel("Campaign goal").selectOption("BRAND_AWARENESS");
  await page.getByLabel("Social proof level").selectOption("SOME_CUSTOMER_TRACTION");
  await page.getByRole("button", { name: "Create business profile" }).click();

  await expect(page.getByRole("heading", { name: businessName })).toBeVisible();

  await page.getByRole("link", { name: "Creators" }).click();
  await expect(page.getByRole("heading", { name: "Creators", exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Add manual creator" }).click();
  await page.getByLabel("Display name").fill(creatorName);
  await page.getByLabel("Handle").fill(creatorHandle);
  await page.getByLabel("Niche tags").fill("design, small business, productivity");
  await page.getByLabel("Bio").fill("A design-focused creator sharing studio workflows, freelance systems, and realistic tools.");
  await page.getByLabel("Audience notes").fill("Freelancers and indie founders building creative businesses.");
  await page.getByRole("button", { name: "Save creator" }).click();

  await expect(page.getByRole("heading", { name: creatorName })).toBeVisible();
  await expect(page.getByText("Overall")).toBeVisible();

  await page.getByRole("button", { name: "Favourite + shortlist" }).click();
  await expect(page.getByRole("link", { name: "Open pipeline item" })).toBeVisible();
  await page.getByRole("link", { name: "Open pipeline item" }).click();

  await expect(page.getByLabel("Current stage")).toHaveValue("SHORTLISTED");
  await page.getByLabel("Add note").fill("Warm niche overlap for a first outreach test.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Warm niche overlap for a first outreach test.", { exact: true })).toBeVisible();

  await page.getByLabel("Reminder title").fill("Send first outreach");
  await page.getByLabel("Due date").fill(reminderDate);
  await page.getByLabel("Reminder note").fill("Reference their latest workflow post.");
  await page.getByRole("button", { name: "Create reminder" }).click();
  await expect(page.getByText("Send first outreach", { exact: true })).toBeVisible();

  await page.getByLabel("Current stage").selectOption("CONTACTED");
  await page.getByRole("button", { name: "Save pipeline details" }).click();
  await expect(page.getByLabel("Current stage")).toHaveValue("CONTACTED");

  await page.getByRole("link", { name: "Generate outreach" }).first().click();
  await expect(page.getByRole("heading", { name: "Outreach", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Generate draft" }).click();
  await expect(page.getByRole("button", { name: "Save draft" })).toBeVisible();
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page.getByText("Draft saved", { exact: true })).toBeVisible();

  await page.goto("/pipeline?view=kanban");
  await expect(page.getByRole("heading", { name: "Pipeline", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Contacted", exact: true })).toBeVisible();

  await page.goto("/pipeline?view=table");
  await expect(page.getByRole("heading", { name: "Pipeline", exact: true })).toBeVisible();
  await expect(page.getByText(creatorName, { exact: true })).toBeVisible();
});
