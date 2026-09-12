#!/usr/bin/env node
/**
 * The catalogue the page renders, built from the skills themselves.
 *
 * Two sources, both already the canonical one for what they hold. Each `SKILL.md` carries
 * its name and description; the README table carries the failure each skill prevents, which
 * is the thing this repository is actually organised around and exists nowhere else.
 *
 * Triggers come from `agent-skill-lint`, not from a regex written here. A trigger is whatever
 * the linter says a trigger is - otherwise this page and the linter that checks these skills
 * for colliding triggers would be describing two different things with one word.
 */
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { frontmatter, triggersOf } from "agent-skill-lint/core";

const dirs = readdirSync("skills", { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

if (dirs.length === 0) {
  console.error("no skills found in skills/, which cannot be right");
  process.exit(1);
}

/**
 * The failure each skill prevents, read off the README's table.
 *
 * `| [`name`](skills/name) | the failure |`. Parsed rather than duplicated into a second
 * file: the table is what a reader of the repository sees, and a catalogue that disagreed
 * with it would be a second answer to the same question.
 */
const readme = readFileSync("README.md", "utf8");
const prevents = new Map(
  [...readme.matchAll(/^\|\s*\[`([^`]+)`\]\([^)]*\)\s*\|\s*(.+?)\s*\|\s*$/gm)].map((m) => [m[1], m[2]]),
);

const catalogue = dirs.map((dir) => {
  const source = readFileSync(join("skills", dir, "SKILL.md"), "utf8");
  const front = frontmatter(source);
  const name = front.name ?? dir;

  // A skill with no row is a skill nobody wrote down the point of, and the table is the
  // point. Failing here is how it gets noticed at all.
  const failure = prevents.get(name);
  if (!failure) {
    console.error(`${name} has no row in the README table, so nothing says what it prevents`);
    process.exit(1);
  }

  return {
    name,
    dir,
    failure,
    description: front.description ?? "",
    triggers: triggersOf(front.description ?? ""),
  };
});

const orphans = [...prevents.keys()].filter((n) => !catalogue.some((c) => c.name === n));
if (orphans.length) {
  // The other direction: a row for a skill that is not here any more points at a 404.
  console.error(`README names ${orphans.join(", ")}, which no longer exist in skills/`);
  process.exit(1);
}

mkdirSync("site", { recursive: true });
writeFileSync("site/catalogue.json", JSON.stringify(catalogue, null, 2) + "\n");
console.log(`${catalogue.length} skills, ${catalogue.reduce((n, c) => n + c.triggers.length, 0)} triggers`);
