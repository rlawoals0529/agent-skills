import { expect, test } from "@playwright/test";
import { readdirSync, readFileSync } from "node:fs";

const SKILLS = readdirSync("skills", { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);

test("the server under test is this app, not another app on the same port", async ({ page }) => {
  await page.goto("./");
  await expect(page).toHaveTitle(/^agent-skills/);
});

test("every skill in the repository is in the catalogue", async ({ page }) => {
  await page.goto("./");

  // Generated from skills/, so a skill added without rebuilding - or one added with no row
  // in the README table - must not be able to go missing quietly.
  const listed = await page.locator(".entry").evaluateAll((els) => els.map((e) => (e as HTMLElement).dataset.skill));
  expect(listed.sort()).toEqual([...SKILLS].sort());
});

test("each entry leads with the failure, and the skill is the answer to it", async ({ page }) => {
  await page.goto("./");
  const first = page.locator(".entry").first();

  // The order is the design: this repository is organised by what kept going wrong, so the
  // failure is what you look yourself up in and the name is what you get back.
  const failureFirst = await first.evaluate((el) => {
    const failure = el.querySelector(".failure")!;
    const answer = el.querySelector(".answer")!;
    return (failure.compareDocumentPosition(answer) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
  });
  expect(failureFirst).toBe(true);
  await expect(first.locator(".answer")).toHaveAttribute("href", /\/skills\//);
});

test("the triggers are the ones the linter would read, not a second definition", async ({ page }) => {
  await page.goto("./");

  /*
   * The catalogue takes its triggers from agent-skill-lint's own triggersOf, and this is what
   * holds that: the quoted phrases in each skill's description, read straight off the file,
   * have to be exactly what the page shows. A regex written here instead would let the page
   * and the linter that checks these same skills for colliding triggers mean two things by
   * one word.
   */
  for (const dir of SKILLS) {
    const source = readFileSync(`skills/${dir}/SKILL.md`, "utf8");
    const description = /^description:\s*(.+)$/m.exec(source)?.[1] ?? "";
    const quoted = [...description.matchAll(/["“]([^"”]{3,60})["”]/g)].map((m) => m[1]!.trim().toLowerCase());

    const shown = await page
      .locator(`.entry[data-skill="${dir}"] .trigger`)
      .allTextContents();
    expect(shown.map((t) => t.replace(/[“”]/g, "")), dir).toEqual(quoted);
  }
});

test("typing filters to the skills that claim the phrase, and marks which phrase", async ({ page }) => {
  await page.goto("./");
  const all = await page.locator(".entry").count();

  await page.locator("#q").fill("the PR came back");
  await expect(page.locator(".entry")).toHaveCount(1);
  // The matched phrase is marked, or a filtered list leaves you hunting for why it is there.
  await expect(page.locator(".trigger.hit")).toHaveCount(1);
  await expect(page.locator(".trigger.hit")).toHaveText(/the pr came back/);

  await page.locator("#q").fill("");
  await expect(page.locator(".entry")).toHaveCount(all);
});

test("a phrase nobody claims says so, and says what it does not prove", async ({ page }) => {
  await page.goto("./");
  await page.locator("#q").fill("zzzz not a trigger");

  await expect(page.locator(".entry")).toHaveCount(0);
  // An empty list is indistinguishable from a page that failed. And the honest part: a
  // literal match finding nothing is not the same as no skill routing there.
  await expect(page.locator("#count")).toContainText("No trigger contains");
  await expect(page.locator("#count")).toContainText("it reads the description");
});

test("the page says a literal match is not how a harness routes", async ({ page }) => {
  await page.goto("./");
  // The one claim that could mislead, so it is on screen before anybody types rather than
  // in a footnote after they have drawn a conclusion.
  await expect(page.locator("#find-note")).toContainText("not");
  await expect(page.locator("#find-note").getByRole("link", { name: "skill-radar" })).toBeVisible();
});
