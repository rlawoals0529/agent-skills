---
name: audit-pr-threads
description: Audits every unresolved review thread on a PR or a stack, giving each a verdict with a file:line proof, then adversarially refutes every "addressed" claim with a three-voter panel. Use when a PR comes back, to tell genuinely-handled threads from only-claimed-handled, before re-requesting review, or when a reviewer's summary looks shorter than the real thread count. Triggers on "the PR came back", "requested changes", "unresolved threads", "did we address everything", "ready for re-review".
---

# Audit PR threads

<!-- skill-lint disable trigger-collision -->

Shares two triggers with `code-quality` deliberately: they fire on the same moment, and
this one is the *tool* where that one is the *method*. Either entry point is fine - this
produces the ledger, `code-quality` FEEDBACK decides whether an ask was really answered.

Runs the `thread-audit` workflow in this repo's `workflows/` directory.

## What it does

For every UNRESOLVED thread on the given PRs: one verdict from a closed set
(`ADDRESSED` / `NOT_ADDRESSED` / `PARTIAL` / `MOVED` / `PUSHBACK`), each carrying a
`file:line` verified against the code at that PR's head. Then a three-lens panel tries to
**refute** every `ADDRESSED` verdict, and only 2-of-3 confirms it. The tally is computed in
code, and a vote that cites no `file:line` is discarded before the count.

The point is the refutation. A verdict that only reads the reply thread will believe
anyone who says "fixed"; a panel that has to find the fix in the diff will not.

## Confirm the cost before running it, every time

This spawns an agent fleet. **Count the threads yourself, then ask before the workflow
call.** Approval is per invocation and never remembered, because the cost scales with the
PR.

**Count first, it costs nothing:**

```bash
gh api graphql -f query='{ repository(owner:"OWNER",name:"REPO"){ pullRequest(number:NNNN){
  reviewThreads(first:100){ totalCount nodes{ isResolved } } } }}' \
  --jq '[.data.repository.pullRequest.reviewThreads.nodes[]|select(.isResolved==false)]|length'
```

Then the arithmetic, from the script's own caps:

| Phase | Agents |
|---|---|
| Preflight | 1, serialises the single fetch |
| Enumerate | 1 per PR |
| Verdict | one per thread, capped |
| Panel | **3 per ADDRESSED verdict**, capped |
| Sweep | up to 3, only with `sweep: true` |

A 4-thread PR is about `1 + 1 + 4 + 12 = 18` agents. A full run at the cap is roughly 48.
Quote the number for *this* input, and offer three choices: run it as counted, cap the
panels (saying the cost - unpanelled verdicts come back at low confidence, so an
"addressed" claim goes unrefuted rather than confirmed), or read a handful of threads
inline for free.

Zero unresolved threads means **do not run it at all**. Say so and stop.

## Reading the result

Work the ledger top-down; it is sorted not-done first. The number that says whether the
panel earned its cost is `votes.overturnedAddressed` - verdicts that claimed done and did
not survive refutation.

Two fields to take seriously:

- `panelOutcome: "UNPANELLED_BY_CAP"` means an `ADDRESSED` verdict was never adversarially
  checked. It is reported at LOW confidence and should not be trusted.
- `claimedByProseOnly: true` means the only support for the fix was a commit message, a
  reply, or a code comment. That is not evidence.

## What it will not do

It never resolves a thread, never posts a comment, and never commits. `replyDraft` on each
row is a draft for a human to post. Threads get replies, never resolutions from the tool.

**If PR numbers are not obvious from context, ask rather than guessing.** A run against the
wrong PR spends the whole fleet reporting someone else's threads as yours.
