import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("teacher can log in and reach the teacher dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("teacher@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Teacher" }).click();
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(/\/teacher\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Total classes")).toBeVisible();
});

test("student can log in and reach the student dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("student@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Student" }).click();
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(/\/student\/dashboard$/);
  await expect(page.getByRole("heading", { name: "My Word Sets" })).toBeVisible();
  await expect(page.getByText("Classes")).toBeVisible();
  await expect(page.getByText("Assigned sets")).toBeVisible();
});
