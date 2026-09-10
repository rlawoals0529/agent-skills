---
name: deep-start
description: Open a task properly instead of diving straight into edits. Four beats - orient on ground truth, roll call which tools apply to THIS task, build in verified increments with a checkpoint per slice, then close the loop by capturing what the task taught. Use at the top of any non-trivial piece of work, and whenever a task has drifted and needs re-orienting mid-flight. Triggers on "starting on", "let's build", "let's work on", "implement X", "pick up this ticket", "take a look at this issue", "/deep-start".
---

# Deep start

An orchestrator for the beginning and end of a task. It owns three things: the tooling
roll call, the per-slice checkpoint cadence, and the close-the-loop capture.

**Rule zero: never guess.** Every claim about code carries a path and a line, from a
search. When it cannot be verified, say "I have not verified this."

## Beat 1: Orient

Before any edit. One line restating the task in your own words, then establish ground
truth. Do not skip a step because it "probably" holds.

**Read the ticket's comments, not just its fields.** The description is the filing; the
thread is where scope actually got decided, and it frequently contradicts the title. One
ticket read "on all transfers" while its comment said every table with varying column
widths — those two send you to different components. It is a cheap call and it is the
difference between building the ticket and building what was agreed.

**Check for an existing branch or open change, and read its conversation** before touching
work someone else has been on. Handoffs live in comments, not in assignee fields.

**Identify the real base branch, then refresh against that.** Never assume the default
branch. A change's diff is computed against *its* base, so merging the default branch into
a stacked branch drags unrelated commits into the diff and asks a reviewer to review files
nobody touched.

```bash
git fetch origin
git log --oneline HEAD..origin/<base> | head
```

If the base moved, merge it **before** writing code, then re-run the tests, and say what
landed in a sentence.

**A clean merge is not a correct merge.** Zero conflicts proves the tool could reconcile
the text, not the meaning. Check whether anything upstream deleted a field or helper this
branch still calls. Never resolve wholesale with `--theirs`, `--ours`, or
`git checkout <branch> -- <file>` — each silently reverts someone else's newer work in that
file. Take the newer version and re-apply this branch's narrow change on top.

**Map what exists.** Search for the helper, the pattern, the sibling implementation. Reuse
is won or lost here. A second copy of a drift-prone helper is worse than a boring reuse of
the first.

### Then write the gates

Last thing in Beat 1, once the task is known and before any edit. Non-trivial work only.

One gate per acceptance criterion, plus one per checkpoint Beat 3 will owe:

```
- [ ] converge: every acceptance criterion cited to a file:line
    EVIDENCE: pending
- [ ] tests: suite green
    EVIDENCE: pending
```

A gate is met only when the box is `[x]` **and** `EVIDENCE:` holds real output. Paste the
literal pass line. **A ticked box with nothing under it is not met, because the tick
records a feeling and the output records a fact.**

If a gate turns out to be genuinely impossible, write `ABANDON: <id> <reason>` and **say it
out loud in the same turn**. Scaling the work down is the requester's call. An abandoned
gate nobody mentioned is a deferral list wearing a different hat.

**Nothing enforces this file, and that is its known weakness.** Re-reading it before
claiming to be finished is itself an instruction, and instructions decay over a long task
in exactly the way this file exists to counter. What it buys is that the list was written
early, while the whole task was still in view. What it cannot buy is that you read it back.

So make the re-read mechanical: **open the gates as the first act of Beat 4, before the
review, not after.** Reading them last means reading them once you have already decided you
are done, which is too late to change the answer.

Delete the file when the work ships. A stale gate file read at the top of the next task is
worse than none, because it looks authoritative and describes finished work.

## Beat 2: Tooling roll call

Still before any edit. Emit one short block, then move on.

```
Roll call
  Using      <tool> - <half-line why>
  Offering   <borderline one> - <what it would add>
  Skipping   <considered> - <half-line why not>
```

- **Work from what is actually installed**, not from memory of what exists.
- **Invoke a cheap tool; ask before an expensive one.** Anything that spends a fleet of
  agents asks first. Everything else fires without a question.
- **Name the rejections.** "Skipping the query profiler, no SQL touched" is information; an
  unmentioned tool reads as unconsidered.
- Some tools are proactive by standing habit rather than by request — a security pass on
  auth surfaces, a profiler on query changes.

## Beat 3: Build in verified increments

Smallest coherent slice, then a checkpoint, then the next slice. Not one big pass with
verification bolted on at the end.

**Quote the literal pass line.** "Tests pass" with no output is a rule-zero violation, and
so is "lint is clean" and "types check".

**Then put that same line in the gate, in the same breath.** Doing it at the end means
reconstructing from memory. A gate whose evidence you had to recall rather than copy is not
evidence.

While building, hold five things:

- **Split as you go.** If the diff is crossing two areas, decide the split now rather than
  at review time.
- **Removing a guard is its own slice.** Before deleting a conditional, an early return or
  a wrapper, enumerate every path that reached it and say what each does once it is gone. A
  guard that looks redundant for the case in front of you is usually load-bearing for one
  you have not looked at, and is often masking a second source of truth that is the real
  fix.
- **A subagent's finding is evidence, not an instruction.** Verify the problem it names is
  real, and enumerate what its fix would break, before acting. Acting on a recommendation
  because it is the most recent thing in context is the specific way drift causes bugs.
- **A blocked tool call is a signal to reconsider the approach, not to find a variant that
  slips past the block.** One hook refused a scripting call that was going to patch a shell
  script; the honest reading was not "use a different interpreter" but "this is a file
  edit, so use the file tool". Ask what the block is protecting before routing around it.
- **Never edit a file a running process is executing.** A monitor or background task
  reading its own script mid-run does something undefined. Stop it, edit, restart.

If the task drifts far from Beat 1's map — the real fix is somewhere else, the ticket was
wrong, the design does not hold — stop and re-run Beats 1 and 2 rather than pushing on.

**Re-anchor after any context compaction, and say so out loud.** Restate the objective and
the out-of-scope list in the first message after context is summarised. A silent re-review
is indistinguishable from a skipped one.

## Beat 4: Close the loop

When it looks done, before anything is committed.

1. **Re-read the gates first.** Not last. By the end of this beat you have already
   concluded you are finished, and a list read after that conclusion gets graded against it
   rather than the other way round.
2. **Review the diff properly.** Triage, read, then apply your quality lenses. Do not skip
   to the lenses.
3. **Fix every finding.** No "deliberate deferrals" list. Pre-existing and house-style are
   not reasons to skip.
4. **Close the gates, and add one per finding still open.** Every unfixed finding becomes
   its own gate line. That is step 3 made countable — "fix every finding" is an unanswerable
   claim while nothing holds the count. State the tally out loud, met over total.
5. **Ask what the task taught.** The beat most often dropped.
   - A recurring class of issue → add it to whatever catalog the next reviewer walks.
   - A correction or a stated preference → write it down where it will be read again.
   - A tool that misfired, over-triggered or was missing → fix the tool, not just this
     instance.

**An unmet gate is reported, never quietly carried.** If work is going out with gates open,
say which ones. Silent carry-over is the same failure as a deferral list.
