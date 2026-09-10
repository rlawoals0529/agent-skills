# Agent skills

Skills for coding agents, built while shipping production code and kept because they
earned it. Each one exists because a specific failure kept happening.

They are written for [Claude Code](https://docs.claude.com/en/docs/claude-code) but the
format is plain Markdown with YAML frontmatter, so most agent harnesses can read them.

## Skills

| Skill | The failure it prevents |
| --- | --- |
| [`afk`](skills/afk) | An unattended agent that "improves" a ticket forever, or quietly pushes something nobody reviewed |
| [`afk-report`](skills/afk-report) | Coming back to an overnight run and having no idea which tickets actually converged |
| [`audit-pr-threads`](skills/audit-pr-threads) | Believing "fixed that" without checking the diff, then re-requesting review with threads still open |
| [`deep-review`](skills/deep-review) | Trusting a clean review pass, when a clean pass reported "no issues" on four changes a human found 33 in |
| [`review-triage`](skills/review-triage) | Reading every line to find out which lines mattered, and missing rules implemented twice with nothing enforcing agreement |

## Design notes

Three ideas run through all of them.

**Enforce with tooling, not with instructions.** `afk` cannot push, and that is deny rules
plus a hook that parses the real command — not a sentence in a prompt asking it not to. A
deny glob does not catch `git -C /path push`, so the hook parses instead of matching.

**An unbounded quality loop is a runaway cost.** `afk` carries three independent brakes: a
round cap, a no-progress detector that stops when a round repeats the previous round's
findings, and a quota check where an unknown reading counts as a stop rather than as
headroom.

**A claim is not evidence.** `audit-pr-threads` exists because a verdict that reads the
reply thread will believe anyone who says "fixed". Three lenses have to fail to refute the
claim before it counts, and a vote citing no `file:line` is discarded before the tally.

**Say how far you actually got.** `deep-review` scores every safety claim on a five-rung
ladder, from "you said so" up to "you reproduced it in the running application", and requires
anything below rung 4 to be labelled unverified. A writeup reads as convincing whether or not
it is true.

## Layout

```
skills/<name>/SKILL.md    the skill
workflows/                orchestration scripts some skills invoke
```

`audit-pr-threads` drives [`workflows/thread-audit.js`](workflows/thread-audit.js), so it
needs that file present to run.

## Install

Copy a skill directory into `.claude/skills/` in a project, or into `~/.claude/skills/` to
have it available everywhere. Workflows go in `.claude/workflows/`.

MIT
