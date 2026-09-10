---
name: unattended-run
description: Work backlog tickets unattended until each one converges - no duplication, no bugs, no tech debt - committing on a real branch and never pushing. Use when stepping away from the machine and wanting the backlog worked rather than parked, or when a ticket needs iterating to "as good as it gets" rather than merely finished. Triggers on "going afk", "work the backlog", "run the backlog on ABC-82", "iterate this ticket until it is clean", "/unattended-run".
---

# Unattended run

Hand the backlog to an unattended loop. It works one ticket per worktree, iterates a
quality ladder until a full pass finds nothing, commits on a real branch, and stops.

**It cannot push, open a PR, merge, comment, or write to your tracker or chat.** That is
enforced by deny rules in the runner's settings file, which beat every allow rule and apply
in every mode, plus a hook that parses the actual command — because a deny glob does not
catch `git -C /path push`. Not by asking the model nicely.

## Running it

```
unattended-run.sh ABC-82                             # one ticket
unattended-run.sh ABC-82 ABC-78                      # several, in order
unattended-run.sh ABC-82=you/abc-82-real-branch      # pin the branch
unattended-run.sh --rounds 2 --dry-run ABC-82        # plan only, writes nothing
unattended-run.sh --parallel 3 --defer-gate A B C    # three at once, gate queued
unattended-run.sh --quota-stop ABC-82                # refuse on an unknown quota
```

## Several at once, and the one rung that contends

**Only the shared-service rung contends.** The unit-test rung and the host-only checks are
per-worktree and independent, as are the model passes. The full pre-flight gate talks to a
single containerised backend bind-mounted from the main checkout and shared by every
worktree. Two runs reaching that rung together corrupt each other's results rather than
queueing.

`--defer-gate` tells the ladder to run nothing container-backed and to enqueue the gate
instead. The queue is serialised and drained by hand, which is what makes parallel runs
safe **and** puts the gate on your schedule rather than the runner's.

`--parallel` above 1 **without** `--defer-gate` is refused, with the reason. That is not a
preference; it is the collision above.

Two implementation details that bit:

- **`git worktree add` is serialised** behind a lock file. Two at once race on the main
  checkout's `.git/index.lock` and one fails with an error that reads like a corrupt repo.
  A stale lock from a killed run is reclaimed after 60s rather than wedging every future run.
- **The pool refills on the first finisher** (`wait -n`), not on all of them. A plain `wait`
  turns "three at a time" into "batches of three".

## The quota brake reports, it does not refuse

The default assumes you are watching and will stop a run yourself, so an unknown or high
reading prints and carries on. `--quota-stop` restores the refusal, and that is the flag for
a genuinely unattended overnight run — the case the brake was built for is the one where
nobody is there to stop it.

## Choosing what to queue

Rank the backlog; do not just take the top of the list.

**Good**: bounded estimate, no contention on the shared service, an existing branch or
worktree, a defect label giving a clear done-condition.

**Bad, and say why rather than silently dropping**: oversized estimates, tickets with no
spec, and anything whose done-condition is a product judgement. "Export the whole tree or
just what is on screen" is the standing example — that is an answer the owner gives, not
the loop.

Put the shortlist in one question before starting. Which tickets get worked overnight is
scope, and scope is not the loop's to choose.

## The ladder

Cheapest rung first, so a cheap failure never pays for an expensive one.

| # | Rung | Gate |
| --- | --- | --- |
| 1 | Fast unit suite, no containers | tests green |
| 2 | Host-only pre-flight checks | summary line clean |
| 3 | Full pre-flight gate | no unaddressed findings |
| 4 | Adversarial review pass | zero findings above the confidence bar |
| 5 | Consolidation check | no leftover copies of what the ticket introduced |
| 6 | Tech-debt pass on the diff | nothing at the top two severities |

Any rung with findings restarts from rung 1. Converged means one clean pass through all
six. **Read the summary line, never the exit code**, for anything behind a wrapper — a
wrapper has reported 0 while the underlying build returned an error with three failures.

## The brakes

Three, independent, because an unbounded "make it better" loop is the documented
runaway-cost failure.

- **`--rounds`**, default 4.
- **No progress.** If a round repeats the previous round's finding set, it stops. Four
  rounds of the same three findings is a stuck loop wearing a progress bar.
- **Quota.** Read before starting and between rounds. A reading older than 30 minutes is
  *unknown*, and unknown is a stop, never headroom.

## Skills that cannot run here

Anything carrying a mandatory approval gate stays interactive, because unattended mode
denies the asking tool outright. Do not work around it.

## What comes back

`<state-dir>/<TICKET>/` holds `state.json`, `round-N.json`, `BLOCKERS.md` and
`DECISIONS.md`. Read it with `/unattended-triage`, which never pushes, posts, or resolves — an
all-green report is information, not permission.
