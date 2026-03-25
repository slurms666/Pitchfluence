import { expect, test, type Page } from "@playwright/test";

const passcode = process.env.APP_ACCESS_PASSCODE ?? "pitchfluence-demo";

async function enterWorkspace(page: Page) {
  await page.goto("/access");
  await page.getByLabel("Shared passcode").fill(passcode);
  await page.getByRole("button", { name: "Enter Pitchfluence" }).click();
  await expect(page.getByRole("heading", { name: "Dashboard", exact: true })).toBeVisible();
}

test("settings, business management, and manual creator management work", async ({ page }) => {
  const suffix = Date.now().toString().slice(-6);
  const businessName = `Lifecycle Studio ${suffix}`;
  const updatedBusinessName = `Lifecycle Studio Updated ${suffix}`;
  const creatorName = `Lifecycle Creator ${suffix}`;
  const updatedCreatorName = `Lifecycle Creator Updated ${suffix}`;
  const creatorHandle = `@lifecycle${suffix}`;

  await enterWorkspace(page);

  await page.getByRole("link", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByText("App access gate", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset demo data" })).toBeVisible();

  await page.getByRole("link", { name: "Business Profiles" }).click();
  await expect(page.getByRole("heading", { name: "Business Profiles", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Create business profile" }).click();

  await page.getByLabel("Business name").fill(businessName);
  await page.getByLabel("Product or service summary").fill("a lightweight studio management brand for freelancers");
  await page.getByLabel("Target audience").fill("freelancers and studio owners");
  await page.getByLabel("Budget max").fill("500");
  await page.getByLabel("Campaign goal").selectOption("BRAND_AWARENESS");
  await page.getByLabel("Social proof level").selectOption("SOME_CUSTOMER_TRACTION");
  await page.getByRole("button", { name: "Create business profile" }).click();

  await expect(page.getByRole("heading", { name: businessName, exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Edit profile" }).click();
  await expect(page.getByRole("heading", { name: `Edit ${businessName}`, exact: true })).toBeVisible();
  await page.getByLabel("Business name").fill(updatedBusinessName);
  await page.getByLabel("Offer notes").fill("Open to simple product seeding and UGC tests.");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: updatedBusinessName, exact: true })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete profile" }).click();
  await expect(page.getByRole("heading", { name: "Business Profiles", exact: true })).toBeVisible();
  await expect(page.getByText(updatedBusinessName, { exact: true })).toHaveCount(0);

  await page.getByRole("link", { name: "Creators" }).click();
  await expect(page.getByRole("heading", { name: "Creators", exact: true })).toBeVisible();
  await expect(page.getByText("Demo Creator Library + Manual Creators", { exact: true })).toBeVisible();
  await expect(page.getByText("Maria Eats Local", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Add manual creator" }).click();
  await page.getByLabel("Display name").fill(creatorName);
  await page.getByLabel("Handle").fill(creatorHandle);
  await page.getByLabel("Niche tags").fill("operations, productivity, small business");
  await page.getByLabel("Bio").fill("A creator sharing realistic systems, operations, and small business workflow tips.");
  await page.getByRole("button", { name: "Save creator" }).click();

  await expect(page.getByRole("heading", { name: creatorName, exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Edit" }).click();
  await expect(page.getByRole("heading", { name: `Edit ${creatorName}`, exact: true })).toBeVisible();
  await page.getByLabel("Display name").fill(updatedCreatorName);
  await page.getByLabel("Content style").fill("Talking-head explainers and workflow breakdowns.");
  await page.getByRole("button", { name: "Save changes" }).click();

  await expect(page.getByRole("heading", { name: updatedCreatorName, exact: true })).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete creator" }).click();
  await expect(page.getByRole("heading", { name: "Creators", exact: true })).toBeVisible();
  await expect(page.getByText(updatedCreatorName, { exact: true })).toHaveCount(0);
});
