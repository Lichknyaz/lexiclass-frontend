import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("teacher creates and assigns a review word set from class weak words", async ({
  page,
}) => {
  const reviewTitle = `E2E Review ${Date.now()}`;

  await login(page, "teacher");
  await openClass(page, "English A2 - Travel");

  await page.getByRole("button", { name: "Create review set" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Create review set" }),
  ).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Weak words" })).toHaveAttribute(
    "data-slot",
    "button",
  );
  await expect(
    dialog.getByRole("checkbox", { name: "Assign to this class" }),
  ).toBeChecked();
  await expect(dialog.getByText(/wrong answer/)).toBeVisible();

  await dialog.getByLabel("Title").fill(reviewTitle);
  await dialog
    .getByLabel("Description")
    .fill("Review set created by the Playwright review flow.");
  await dialog.getByRole("button", { name: "Create review set" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(reviewTitle, { exact: true })).toBeVisible();

  await clearSession(page);
  await login(page, "student");
  await page.goto("/student/dashboard");

  await expect(page.getByRole("heading", { name: "My Word Sets" })).toBeVisible();
  await expect(page.getByText(reviewTitle, { exact: true })).toBeVisible();
});

async function login(page: Page, role: "teacher" | "student") {
  const roleLabel = role === "teacher" ? "Teacher" : "Student";
  const email = role === "teacher" ? "teacher@example.com" : "student@example.com";

  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: roleLabel }).click();
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`));
}

async function openClass(page: Page, className: string) {
  await page.goto("/teacher/classes");
  await expect(page.getByRole("heading", { name: "Classes" })).toBeVisible();

  const classCard = page.locator("[data-slot='card']").filter({
    has: page.getByText(className, { exact: true }),
  });

  await expect(classCard).toBeVisible();
  await classCard.getByRole("button", { name: "Open" }).click();
  await expect(page.getByRole("heading", { name: className })).toBeVisible();
}

async function clearSession(page: Page) {
  await page.evaluate(() => window.localStorage.clear());
}
