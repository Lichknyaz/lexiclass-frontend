import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("anonymous users are redirected from protected routes to login", async ({
  page,
}) => {
  await page.goto("/teacher/classes");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Log in", { exact: true })).toBeVisible();
});

test("students are redirected away from teacher routes", async ({
  page,
}) => {
  await login(page, "student");
  await page.goto("/teacher/classes");

  await expect(page).toHaveURL(/\/student\/dashboard$/);
  await expect(
    page.getByRole("heading", { name: "My Word Sets" }),
  ).toBeVisible();
});

test("teachers are redirected away from student routes", async ({
  page,
}) => {
  await login(page, "teacher");
  await page.goto("/student/dashboard");

  await expect(page).toHaveURL(/\/teacher\/dashboard$/);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
});

test("logout clears the session and returns to login", async ({ page }) => {
  await login(page, "teacher");

  await page.getByRole("button", { name: "Logout" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByText("Log in", { exact: true })).toBeVisible();

  await page.goto("/teacher/dashboard");
  await expect(page).toHaveURL(/\/login$/);
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
  await expect(
    page.getByRole("heading", {
      name: role === "teacher" ? "Dashboard" : "My Word Sets",
    }),
  ).toBeVisible();
}
