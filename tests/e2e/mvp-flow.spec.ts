import { expect, test, type Page } from "@playwright/test";

const teacher = {
  email: "teacher@example.com",
  password: "password",
};

const student = {
  email: "student@example.com",
  password: "password",
};

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("teacher assignment, student practice, and analytics work with backend data", async ({
  page,
}) => {
  const suffix = Date.now().toString();
  const wordSetTitle = `E2E Travel ${suffix}`;
  const term = `itinerary-${suffix}`;

  await login(page, "teacher");

  await page.goto("/teacher/word-sets");
  await expect(
    page.getByRole("heading", { name: "Word Sets" }),
  ).toBeVisible();

  await createWordSet(page, wordSetTitle);
  await openWordSet(page, wordSetTitle);
  await addWord(page, {
    term,
    translation: "route plan",
    example: "We checked the itinerary before leaving.",
  });
  await assignCurrentWordSetToClass(page, "English A2");

  await logoutByClearingSession(page);
  await login(page, "student");
  await joinSeedClass(page);

  await page.goto("/student/dashboard");
  const assignmentCard = page.locator("[data-slot='card']").filter({
    has: page.getByText(wordSetTitle, { exact: true }),
  });
  await expect(assignmentCard).toBeVisible();
  await assignmentCard.getByRole("link", { name: "Practice" }).click();

  await expect(page.getByRole("heading", { name: "Practice" })).toBeVisible();
  await page.getByRole("button", { name: "Start Practice" }).click();
  await page.getByRole("button", { name: "Show Answer" }).click();
  await page.getByRole("button", { name: "Need Review" }).click();
  await page.getByRole("button", { name: "Next Word" }).click();

  await expect(page.getByText("Session complete")).toBeVisible();
  await expect(
    page.getByText("Practice result saved for progress tracking."),
  ).toBeVisible();

  await logoutByClearingSession(page);
  await login(page, "teacher");

  await page.goto("/teacher/analytics");
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await expect(
    page.locator("[data-slot='card-title']").filter({ hasText: "Problem Words" }),
  ).toBeVisible();
  await expect(page.getByText(term)).toBeVisible();
});

async function login(page: Page, role: "teacher" | "student") {
  const credentials = role === "teacher" ? teacher : student;
  const roleLabel = role === "teacher" ? "Teacher" : "Student";

  await page.goto("/login");
  await page.getByLabel("Email").fill(credentials.email);
  await page.getByLabel("Password").fill(credentials.password);
  await page.getByRole("button", { name: roleLabel }).click();
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(new RegExp(`/${role}/dashboard$`));
}

async function createWordSet(page: Page, title: string) {
  await page.getByRole("button", { name: "Create Word Set" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Create Word Set" }),
  ).toBeVisible();
  await dialog.getByLabel("Title").fill(title);
  await dialog
    .getByLabel("Description")
    .fill("Vocabulary created by the Playwright MVP flow.");
  await dialog.getByRole("button", { name: "Create Word Set" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(title)).toBeVisible();
}

async function openWordSet(page: Page, title: string) {
  await page
    .locator(".transition-shadow")
    .filter({ hasText: title })
    .getByRole("link", { name: "Open" })
    .click();

  await expect(page.getByRole("heading", { name: title })).toBeVisible();
}

async function addWord(
  page: Page,
  word: { term: string; translation: string; example: string },
) {
  await page.getByRole("button", { name: "Add Word" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Add Word" })).toBeVisible();
  await dialog.getByRole("textbox", { name: "Term", exact: true }).fill(word.term);
  await dialog
    .getByRole("textbox", { name: "Translation", exact: true })
    .fill(word.translation);
  await dialog
    .getByRole("textbox", { name: "Example Sentence", exact: true })
    .fill(word.example);
  await dialog.getByRole("button", { name: "Add Word" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(word.term)).toBeVisible();
}

async function assignCurrentWordSetToClass(page: Page, className: string) {
  await page.getByRole("button", { name: "Assign to Class" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Assign Word Set to Class" }),
  ).toBeVisible();

  const classRow = dialog
    .getByText(className, { exact: true })
    .locator("xpath=ancestor::div[contains(@class, 'rounded-lg')][1]");
  await expect(classRow).toBeVisible();
  await classRow.getByRole("button", { name: "Assign" }).click();

  await expect(dialog).toBeHidden();
}

async function joinSeedClass(page: Page) {
  await page.goto("/student/join-class");
  await expect(page.getByRole("heading", { name: "Join Class" })).toBeVisible();
  await page.getByLabel("Invite code").fill("A2-7KQ9");
  await page.getByRole("button", { name: "Join Class" }).click();

  await expect(page.getByText("Class joined")).toBeVisible();
}

async function logoutByClearingSession(page: Page) {
  await page.evaluate(() => window.localStorage.clear());
}
