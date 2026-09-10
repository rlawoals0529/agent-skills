---
name: bug-bash
description: Adversarially break a feature that already runs, through the real UI, and produce reproducible evidence-backed findings. Derives attack charters from the invariants in the code itself, captures the network payload alongside the screenshot so "looks right but sends wrong" is caught, then triages every observation into BUG, EXPECTED, BACKEND-DISAGREES or QUESTION. Use for a QA session on a built feature, for dogfooding a surface before a demo, or when asked to try to break something. Triggers on "break this", "bug bash", "try to break it", "find bugs in X", "QA this page", "dogfood this", "hunt for bugs", "stress the UI", "what can go wrong with X".
---

# Bug bash

For a feature that already **runs**. The goal is not "does it work" but **what makes it not
work**, written down so someone else can reproduce it.

## Non-negotiables

1. **Local first.** A shared environment holds other people's data. Do not run mutating
   charters — create, edit, delete, status change — against one without asking in that turn.
2. **A finding without evidence is a rumour.** Every bug carries the route, the exact steps,
   what you expected, what happened, a screenshot path, and the request payload if one was
   involved.
3. **Never file anything.** Produce the report. Posting it anywhere needs permission in the
   same turn.
4. **Distinguish "I broke it" from "I misunderstood it."** Most first-pass findings are the
   second. Triage exists for exactly this.

## Phase 0 — Target, safety, and data

State plainly, before touching anything:

- **Which surface**, and which environment.
- **Which flags gate it**, and whether they are on for the account you are testing as. A
  not-found is the flag before it is the code.
- **What changed recently.** Fresh code is where the bugs are.
- **Whether the branch is current.**

```bash
git fetch origin main --quiet
git rev-list --left-right --count origin/main...HEAD    # behind / ahead
```

**Being ahead matters as much as being behind.** A combined test branch can carry hundreds
of unmerged commits, so anything you find on it may not exist on the mainline at all. Before
writing up any finding, diff the specific files it rests on:

```bash
git diff --quiet origin/main HEAD -- <file> && echo "same as main" || echo "DIFFERS"
```

Say in the report which base the findings were verified against. "Verified against main" is
a very different claim from "found on my branch", and a reviewer will ask.

### Data prerequisites, before you start and not during

A charter that needs a record in a state your environment does not have is not a hard
charter, it is an **unrunnable** one.

The first live run of this method lost half its coverage to seed data that was twenty out of
twenty in the same state: no draft record and no terminal-state record existed, so the
editable path and the closed path could not be reached, and nobody noticed until the
write-up.

## Phase 1 — Recon: mine invariants out of the code

Read the code for the rules it claims to enforce — status seals, allowed-transition tables,
schema validators, flag gates, uniqueness constraints. Each one is a claim, and a claim is
an attack.

**Recon findings are findings.** A rule implemented in two places with nothing keeping them
in step is a bug whether or not you can reproduce it through the interface. Record it now
rather than waiting for the browser to agree.

## Phase 2 — Charters

One line each:

```
Explore [target] with [resources] to discover [what you want to learn]
```

Aim for six to ten. Cover at minimum: the lifecycle seal, the boundaries, one concurrency
case, one case with the feature flag **off**, one empty state, and one
**payload-not-pixels** case.

Time-box to roughly 45 to 90 minutes per charter set. Effectiveness drops off a cliff after
that.

## Phase 3 — Execute

**Hook the network traffic before you interact.** The interface rendering correctly proves
nothing about what it sent, and that is how a filter regression escapes a whole QA pass.
Install the capture immediately after signing in, not after you notice something.

```js
if (!window.__cap) {
  window.__cap = [];
  const orig = fetch;
  window.fetch = function (...a) {
    const body = a[1] && a[1].body;
    if (body) window.__cap.push("" + body);
    return orig.apply(this, a);
  };
}
```

**Log as you go, not after.** Memory rewrites what happened. Keep a running table and tag
every row `BUG` · `QUESTION` · `RISK` · `IDEA` · `NOTE`. An untagged wall of prose cannot be
triaged.

When something looks wrong: **screenshot immediately**, capture the accessibility tree for
the verbatim labels, dump the captured payloads, and only **then** try to minimise it.
Evidence first. The state is easy to lose and hard to get back.

## Phase 4 — Triage

Every `BUG` row gets one of four verdicts, with a reason.

- **BUG** — reproduced from a clean state, and the behaviour contradicts a stated invariant,
  a real user expectation, or the server's own rule. Cite which.
- **EXPECTED** — the code intends this and the intent is defensible. Say where it is stated,
  with a file and line.
- **BACKEND-DISAGREES** — the interface offered something the server rejected, or blocked
  something the server allows. This is usually the highest-value class, because a client
  that mirrors server rules by hand drifts from them. Check the server rule rather than
  assuming the client is right.
- **QUESTION** — needs a human's product judgment. Route it out rather than guessing.

Re-run each surviving bug once from a clean state. If it does not reproduce, downgrade it to
a risk note saying so. Do not report a one-off as a defect.

### Know what your tools can lie about

**Re-running a finding through the same tool that produced it is not verification, it is
repetition.** A tool that is wrong is wrong consistently, so a second identical run raises
confidence without raising accuracy. This method has already produced one confident,
"app-wide", four-times-reproduced finding that a human disproved with a single screenshot.

Split findings by what the evidence rests on:

- **Logic and data read out of source.** File, line, and the tests around it. Anyone can
  check it without running anything, and automation cannot corrupt it.
- **Anything mediated by synthetic input.** Typing, caret position, focus, hover, drag,
  timing, debounce. The tool sits between you and the truth here, and it does not behave
  like a keyboard or a mouse.

For the second category the bar is **a human, or nothing**. Not a control field, not a
slower run, not a different flag on the same tool — those all failed. Ask for a hand test,
or file it as a code observation and say plainly that no person ever reproduced it.

Getting this wrong costs more than the finding was worth. It spends the team's trust in
every other finding in the report.

## Phase 5 — Report

```markdown
## Bug bash — <surface> · <environment> · <date>

Verified against <base>. <n> charters run, <n> findings.

### BUG-1 — <one-line symptom, no jargon>

**Steps** 1. … 2. … 3. …
**Expected** …
**Actual** …
**Evidence** <screenshot path> · <payload excerpt>
**Verdict** BUG — contradicts <invariant> at `file:line`

### Unverified leads
### Checked and fine
```

**"Checked and fine" earns its place.** A report that lists only failures cannot be
distinguished from one that only looked in a few places, and the next person repeats your
coverage instead of extending it.
