import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("teacher can edit and delete word sets and words", async ({ page }) => {
  const suffix = Date.now().toString();
  const title = `E2E Word Set ${suffix}`;
  const updatedTitle = `E2E Word Set Updated ${suffix}`;
  const term = `departure-${suffix}`;
  const updatedTerm = `arrival-${suffix}`;

  await loginTeacher(page);

  await page.goto("/teacher/word-sets");
  await expect(
    page.getByRole("heading", { name: "Word Sets" }),
  ).toBeVisible();

  await createWordSet(page, title);
  await openWordSet(page, title);

  await editWordSet(page, {
    title: updatedTitle,
    description: "Updated by the Playwright word-set CRUD flow.",
    tag: "E2E",
  });

  await expect(
    page.getByRole("heading", { name: updatedTitle }),
  ).toBeVisible();
  await expect(
    page.getByText("Updated by the Playwright word-set CRUD flow."),
  ).toBeVisible();
  await expect(page.getByText("E2E", { exact: true })).toBeVisible();

  await addWord(page, {
    term,
    translation: "leaving",
    example: "The departure time changed.",
  });

  await editWord(page, term, {
    term: updatedTerm,
    translation: "coming",
    example: "The arrival time is listed on the board.",
  });

  await expect(page.getByText(updatedTerm)).toBeVisible();
  await expect(page.getByText("coming")).toBeVisible();
  await expect(page.getByText(term)).toHaveCount(0);

  await deleteWord(page, updatedTerm);
  await expect(page.getByText(updatedTerm)).toHaveCount(0);

  await deleteCurrentWordSet(page);

  await expect(page).toHaveURL(/\/teacher\/word-sets$/);
  await expect(page.getByRole("heading", { name: "Word Sets" })).toBeVisible();
  await expect(page.getByText(updatedTitle)).toHaveCount(0);
});

async function loginTeacher(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill("teacher@example.com");
  await page.getByLabel("Password").fill("password");
  await page.getByRole("button", { name: "Teacher" }).click();
  await page.getByRole("button", { name: "Log In" }).click();

  await expect(page).toHaveURL(/\/teacher\/dashboard$/);
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
    .fill("Vocabulary created by the Playwright word-set CRUD flow.");
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

async function editWordSet(
  page: Page,
  input: { title: string; description: string; tag: string },
) {
  await page.getByRole("button", { name: "Edit word set" }).click();

  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Edit Word Set" }),
  ).toBeVisible();
  await dialog.getByLabel("Title").fill(input.title);
  await dialog.getByLabel("Description").fill(input.description);
  await dialog.getByLabel("Tag").fill(input.tag);
  await dialog.getByRole("button", { name: "Save Changes" }).click();

  await expect(dialog).toBeHidden();
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

async function editWord(
  page: Page,
  currentTerm: string,
  input: { term: string; translation: string; example: string },
) {
  await openWordActions(page, currentTerm);
  await page.getByRole("menuitem", { name: "Edit word" }).click();

  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Edit Word" })).toBeVisible();
  await dialog.getByRole("textbox", { name: "Term", exact: true }).fill(input.term);
  await dialog
    .getByRole("textbox", { name: "Translation", exact: true })
    .fill(input.translation);
  await dialog
    .getByRole("textbox", { name: "Example sentence", exact: true })
    .fill(input.example);
  await dialog.getByRole("button", { name: "Save" }).click();

  await expect(dialog).toBeHidden();
}

async function deleteWord(page: Page, term: string) {
  await openWordActions(page, term);
  await page.getByRole("menuitem", { name: "Delete word" }).click();

  const dialog = page.getByRole("alertdialog");
  await expect(
    dialog.getByRole("heading", { name: "Delete this word?" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Delete" }).click();

  await expect(dialog).toBeHidden();
}

async function openWordActions(page: Page, term: string) {
  await page
    .getByRole("row")
    .filter({ has: page.getByText(term, { exact: true }) })
    .getByRole("button", { name: "Word actions" })
    .click();
}

async function deleteCurrentWordSet(page: Page) {
  await page.getByRole("button", { name: "Delete word set" }).click();

  const dialog = page.getByRole("alertdialog");
  await expect(
    dialog.getByRole("heading", { name: "Delete word set?" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Delete Word Set" }).click();
}
