---
name: unattended-triage
description: Triage what an unattended run left behind - which tickets converged, which stalled, and the blockers only the owner can clear - turning each into a batched question. Use the morning after an unattended run, or any time you want to know what the loop actually got done. Triggers on "what did the run do", "unattended report", "read the overnight run", "/unattended-triage".
---

# AFK report

Read the run state directory and hand back a decision list. **Never push, post, comment,
resolve, or write to the tracker.** An all-green report is information, not permission.

## Read

For each ticket directory:

- `state.json` — `converged` / `stalled` / `maxrounds`, and the round count.
- `round-N.json` — the last round's open findings, and the commit sha.
- `BLOCKERS.md` — blockers. Each `## ` heading is one.
- `DECISIONS.md` — calls the loop made on its own. Skim for anything you disagree with; a
  decision the loop got wrong is worth more than a blocker it correctly escalated.

Confirm the commit actually exists — `git -C <worktree> log --oneline -1`. A sha in a JSON
file the loop wrote is a claim, not evidence.

## Report

One line per ticket, worst first: outcome, branch, round count, and for anything that did
not converge, the last rung that failed. Then the blockers.

## Ask

Convert each blocker into one question option:

- **Self-contained.** Which ticket, what it was doing, what it found, what changes
  depending on the answer.
- **Recommendation first**, labelled as such.
- **Batched**, and only questions whose prerequisites are already settled. Hold dependents
  for the next round.

A blocker that is not one of these four is a bug in the run, not a question — say so
instead of forwarding it:

1. product intent, 2. irreversible, 3. an outward-facing write, 4. a rung that could not
run at all.

## Then stop

Nothing is pushed. If a ticket converged and the owner wants it up, that is their next
instruction, not this skill's next step.
