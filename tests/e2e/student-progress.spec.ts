import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("student progress page reflects saved practice attempts", async ({
  page,
}) => {
  const suffix = Date.now().toString();
  const wordSetTitle = `E2E Progress ${suffix}`;
  const term = `checkpoint-${suffix}`;

  await login(page, "teacher");
  await page.goto("/teacher/word-sets");

  await createWordSet(page, wordSetTitle);
  await openWordSet(page, wordSetTitle);
  await addWord(page, {
    term,
    translation: "контрольна точка",
    example: "The checkpoint confirmed the route.",
  });
  await assignCurrentWordSetToClass(page, "English A2");

  await clearSession(page);
  await login(page, "student");
  await joinSeedClass(page);

  await page.goto("/student/dashboard");
  const assignmentCard = page.locator("[data-slot='card']").filter({
    has: page.getByText(wordSetTitle, { exact: true }),
  });
  await expect(assignmentCard).toBeVisible();
  await assignmentCard.getByRole("link", { name: "Practice" }).click();

  await page.getByRole("button", { name: "Start Practice" }).click();
  await page.getByRole("button", { name: "Show Answer" }).click();
  await page.getByRole("button", { name: "Need Review" }).click();
  await page.getByRole("button", { name: "Next Word" }).click();

  await expect(page.getByText("Session complete")).toBeVisible();
  await expect(
    page.getByText("Practice result saved for progress tracking."),
  ).toBeVisible();

  await page.goto("/student/progress");
  await expect(page.getByRole("heading", { name: "My Progress" })).toBeVisible();

  const progressRow = page
    .getByRole("row")
    .filter({ has: page.getByText(term, { exact: true }) });
  await expect(progressRow).toBeVisible();
  await expect(progressRow.getByText("контрольна точка")).toBeVisible();
  await expect(progressRow.getByText(/0\s*\/\s*1 wrong/)).toBeVisible();

  await page.getByRole("button", { name: "Weak" }).click();
  await expect(progressRow).toBeVisible();
  await expect(page.getByRole("link", { name: "Practice weak words" })).toHaveCount(0);
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

async function createWordSet(page: Page, title: string) {
  await page.getByRole("button", { name: "Create Word Set" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Create Word Set" }),
  ).toBeVisible();
  await dialog.getByLabel("Title").fill(title);
  await dialog
    .getByLabel("Description")
    .fill("Vocabulary created by the Playwright progress flow.");
  await dialog.getByRole("button", { name: "Create Word Set" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.getByText(title)).toBeVisible();
}

async function openWordSet(page: Page, title: string) {
  await page
    .locator("[data-slot='card']")
    .filter({ has: page.getByText(title, { exact: true }) })
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

async function clearSession(page: Page) {
  await page.evaluate(() => window.localStorage.clear());
}
