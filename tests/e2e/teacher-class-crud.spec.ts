import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("teacher can create, edit, and delete a class", async ({ page }) => {
  const suffix = Date.now().toString();
  const className = `E2E Class ${suffix}`;
  const updatedClassName = `E2E Class Updated ${suffix}`;

  await loginTeacher(page);

  await page.goto("/teacher/classes");
  await expect(page.getByRole("heading", { name: "Classes" })).toBeVisible();

  await createClass(page, className);
  await openClass(page, className);

  await expect(page.getByRole("heading", { name: className })).toBeVisible();
  await expect(page.getByText("Invite Code")).toBeVisible();

  await editClass(page, {
    name: updatedClassName,
    description: "Updated by the Playwright class CRUD flow.",
    level: "E2E",
  });

  await expect(
    page.getByRole("heading", { name: updatedClassName }),
  ).toBeVisible();
  await expect(
    page.getByText("Updated by the Playwright class CRUD flow."),
  ).toBeVisible();
  await expect(page.getByText("E2E", { exact: true })).toBeVisible();

  await deleteCurrentClass(page);

  await expect(page).toHaveURL(/\/teacher\/classes$/);
  await expect(page.getByRole("heading", { name: "Classes" })).toBeVisible();
  await expect(page.getByText(updatedClassName)).toHaveCount(0);
});

async function loginTeacher(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("teacher@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Teacher" }).click();
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(/\/teacher\/dashboard$/);
}

async function createClass(page: Page, name: string) {
  await page.getByRole("button", { name: "Create Class" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Create New Class" }),
  ).toBeVisible();
  await dialog.getByLabel("Class Name").fill(name);
  await dialog.getByRole("button", { name: "Create Class" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(name)).toBeVisible();
}

async function openClass(page: Page, name: string) {
  await page
    .locator("[data-slot='card']")
    .filter({ has: page.getByText(name, { exact: true }) })
    .getByRole("button", { name: "Open" })
    .click();
}

async function editClass(
  page: Page,
  input: { name: string; description: string; level: string },
) {
  await page.getByRole("button", { name: "Edit class" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Edit Class" })).toBeVisible();
  await dialog.getByLabel("Name").fill(input.name);
  await dialog.getByLabel("Description").fill(input.description);
  await dialog.getByLabel("Tag").fill(input.level);
  await dialog.getByRole("button", { name: "Save Changes" }).click();

  await expect(dialog).toBeHidden();
}

async function deleteCurrentClass(page: Page) {
  await page.getByRole("button", { name: "Delete class" }).click();

  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByRole("heading", { name: "Delete class?" })).toBeVisible();
  await dialog.getByRole("button", { name: "Delete Class" }).click();
}
