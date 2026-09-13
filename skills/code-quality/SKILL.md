---
name: code-quality
description: Verify before claiming, and check code the way a good reviewer does. Three modes. START opens work - maps what exists, ladders the design, fixes the split first. DEEP CHECK closes it - reads the high-risk files, applies three lenses, then a twelve-question blocks gate. FEEDBACK handles a change that came back - syncs the base, counts every unresolved thread, treats each ask as a symptom, and closes a thread only with recorded proof. Use whenever a task starts or finishes, before any commit or push, when refactoring, and always when a change is blocked, has requested changes or a red check. Triggers on "starting X", "let's build X", "how should I split this", "does this look done", "is this ready", "about to commit", "refactor this", "requested changes", "address the feedback", "unresolved threads", "CI is red".
---

# Code quality

<!-- skill-lint disable trigger-collision -->

Shares two triggers with `audit-pr-threads` deliberately. That one enumerates and verifies
the threads; this one decides what an ask really means and what closes it. If it is
available, run it for step 2 of FEEDBACK instead of building the ledger by hand.

## Rule zero: never guess

**Never guess about code being fixed or touched. Verify, then cite.**

A lens applied to a guess produces a confident wrong answer, which is worse than no answer:
it costs a round trip and burns trust in every other line of the report.

Every claim carries the evidence that settles it - a path and line from a search, a log line
quoted, a test read rather than its name trusted, a bug reproduced or its path traced end to
end. **When it cannot be verified, say "I have not verified this."** That is a valid output.

## The spine: three properties

Everything hangs off three, not twenty rules.

1. **Safe from bugs** - correct now, and defensive about what comes later.
2. **Easy to understand** - the next reader gets it in one pass.
3. **Ready for change** - when the next requirement lands, how many places change? One.

That last question is the prime directive. A clever solution that adds a second copy of a
drift-prone helper is worse than a boring one that reuses the first.

---

## Mode: START

**Refresh the branch before writing anything.** If the last work here was more than a couple
of hours ago, the base has probably moved.

```bash
git fetch origin
git log --oneline HEAD..origin/<base> | head    # what landed while you were away
git log --oneline origin/<base>..HEAD | head    # what you have that it does not
```

Merge it **before** touching code, not after. Then re-run the tests: a merge that silently
broke something is worse than the conflict was. Conflict resolution can change what the
right fix even is, and a reviewer should not have to read around a stale base.

Say what landed. "The base moved three commits, two of them touch files we are about to
edit" is worth a sentence.

**1. Map before building.** Reuse is won or lost here, and rule zero applies: confirm by
searching, never assume something had to be hand-rolled.

- What already exists that this could reuse?
- Which two or three sibling features set the idiom? Copy their shape.
- Which paths need batching to avoid a per-row query?

**2. Ladder the design. Stop at the first rung that holds.**

1. Does this need to exist at all? Speculative work gets cut, and say so.
2. Does the standard library or an existing helper cover it?
3. Does the framework, the database, or a platform feature already do it?
4. Only then, minimum new code, in the right layer.

**3. Decide the split now, not at the end.** One ticket per change, never mix unrelated
areas, split by revertability. A change that crosses a service boundary is a contract
change rather than a split.

**4. Write the short spec and get agreement before building.**

```
PROBLEM      one paragraph
APPROACH     what changes, what stays
ASSUMPTIONS  what you are treating as given that nobody said
SPLIT        change 1 / change 2 / change 3
RISKS        gating, rollback
OPEN Qs      2-3 real decisions
```

`ASSUMPTIONS` is not permission to proceed on a guess. Rule zero still holds, and an
assumption you can write down is usually one you can verify in less time than it took to
write. It is for the residue: things that are genuinely someone else's call and that you
would otherwise pick silently. **Anything on that line you could have checked belongs in a
search, not in the spec.**

`OPEN Qs` blocks. If a question there changes what gets built, it is answered or explicitly
waived before the first edit, not carried alongside the diff.

---

## Mode: DEEP CHECK

Use when something looks finished, before a commit or push. Run it on your own diff before
anyone else sees it. Cheaper than a review cycle.

### First: triage, then READ. Do not skip to the lenses.

This step exists because skipping it produced a 0-for-4 on a real change, missing two
blockers. The failure was running aggregate analysis over the diff - comment ratios, greps,
file counts - and never opening the files where the bugs were. **Metrics are a supplement.
They are not the pass.**

**1. Rank the changed files by risk and read the top ones in full**, in this order:

1. **Write paths.** Anything that assigns and then commits.
2. **Validation and normalisation**, especially where the same rule exists on both sides of
   a wire.
3. **State machines.** Dirty-tracking, draft versus saved, loading versus error.
4. **New shared utilities.** A new helper is where duplication hides, because you have to
   search the tree to know it is new.
5. **Anything crossing a service boundary.**

Tests, generated files, styling and config get skimmed after.

**2. For each high-risk file, trace one full path end to end.** Not "does this look right"
but "what happens when I call it with X". Take a concrete bad input and follow it: which
line assigns, which line raises, what is left behind, does the transaction commit.

Both blockers missed on that change needed exactly this and nothing more:

- assign, then validate, then `return` instead of raising, so the session commits the
  half-written row
- one side trims, the other collapses internal whitespace, so the dirty flag never clears

Neither is visible from a diff summary. Both are obvious after reading the function.

**3. For anything that looks like a new helper, search the tree before accepting it.** Grep
the **body**, not the name. A duplicate is usually the same four lines under a different
identifier.

**4. Only now apply the three lenses.**

### Last: the blocks gate

Not a lens. Twelve yes/no questions answered out loud against the diff, immediately before
saying anything is ready. On one review round **every blocker taken was on this list**. They
were all findable. Nobody ran the list.

"No" is the passing answer.

```
Blocks gate
- [ ] Unhandled empty or null, off-by-one, an untested boundary?
- [ ] Soft-delete leak, authorization gap, data visible across customers?
- [ ] Swallowed exception, silent fallback, dropped promise?
- [ ] Per-row database or network call with no batching?
- [ ] Third copy of a mapping, a predicate, or a shared helper?
- [ ] A query outside the layer that owns queries?
- [ ] Two migration heads, an edited applied migration, or a non-reversible one?
- [ ] A regression test that passes without the fix?
- [ ] A test that pins the buggy behaviour as correct?
- [ ] A feature that needs a backfill, or a manual toggle, to be correct?
- [ ] The off path broken or unreachable for something that worked before?
- [ ] A payload or event shape changed on one side of a boundary only?
```

A "yes" is fixed before the change goes back, ahead of any nit.

**Rule of three, with an actual number.** Two copies ship; the third is extracted. That
also settles the apparent conflict with "no speculative abstraction at one caller":
abstract at three, not at one.

---

## Mode: FEEDBACK

Use when a change comes back with requested changes, unresolved threads, or a red check.
START opens work and DEEP CHECK closes it; this is the loop in between.

**1. Sync the base and fix conflicts first, before touching any feedback.** On a stacked
branch merge the *base branch*, read off the change's own metadata rather than assumed.

**A clean merge is not a correct merge.** The tool resolves text, not meaning. Check that
nothing upstream deleted a field, contract or helper the branch still uses, and that a
wholesale `--theirs` or `--ours` has not reverted someone's newer work. Both have happened,
and neither produced a conflict marker.

**2. Gather every thread, then group by root concern.** Review summaries and general
comments carry intent that inline comments do not. Two comments on two files are usually
one issue, and grouping is most of the work.

Enumerate through an API that exposes whether a thread is **resolved**. A plain comments
listing counts long-settled threads and cannot tell you. **Outdated is not resolved** - it
means the code moved, and the concern still needs an answer.

**Count the threads before planning the work.** A reviewer's summary list is typically about
half of them. Build a ledger with one row per thread and work it to zero, rather than
working the summary and calling it done.

**3. Every ask is a symptom.** Read for the worry behind it. "Rename this variable" means
the function does too much to name well. "Add a null check" means it should never be null,
so fix the source. "This is confusing" means the abstraction is in the wrong layer.

**4. The bar on the fix.** Every change either strictly reduces debt or fixes a real
problem. A type-ignore, an expected-failure marker, a skip, a loosened lint rule, a deleted
test: **green by suppression is red wearing a coat.**

Blind compliance is not the goal either. Verify the reviewer's claim before implementing it,
and verify your pushback before drafting it.

**The same bar applies to whoever is directing the work, and this is the half that gets
skipped.** Verify their instruction the same way, and when it does not survive, say so in
one sentence with the evidence, offer the better path, then build what they ask for if they
still want it. Agreeing with a bad approach is not deference, it is a defect you chose not
to report, and they cannot overrule a concern they were never given. Do this **before**
building: a doubt raised after the diff exists is a complaint, not a choice.

**5. Close a thread only with a proof, not an opinion.**

| Ask | Proof |
| --- | --- |
| A bug | A test recorded failing before the fix and passing after |
| A duplicate | A tree-wide grep showing one definition and N call sites |
| Dead code | Zero importers, plus a green typecheck |
| Conditional behaviour | The test run with the condition both ways |
| A comment or doc | The rendered text, quoted |
| You disagree | The counter-evidence, written down before anything goes out |

**The regression test has to reproduce the real sequence, not a convenient one.** This is
where a proof most often lies to you. A fix for an error-handling bug got a test whose event
stream was `chunk, error, chunk`, and it passed. The real stream ends with a completion
event that rewrites the body from the server's own state, so the bug was still live and the
test could never see it. Before believing a red-then-green, ask what the production sequence
actually is and whether the test contains it. **If you invented the inputs, you may have
invented the pass.**

**A fix aimed at one writer does not cover the others.** List every path that writes the
thing you just corrected, then check each. That error-text fix caught the buffer and the
loop end and missed the completion handler, which was the one that mattered.

**Fix the class, not the instance the reviewer happened to see.** Blanking fenced code
blocks so their contents stop breaking a delimiter scan left inline code spans doing the
identical thing, and inline spans are commoner.

**6. Reply on every thread. Silence reads as ignored.** Say what changed and why, or why it
did not change. Threads get replies; let the reviewer resolve.

**7. Watch CI until green**, not until the push lands. A cancelled job frequently reports as
a failure - re-run it rather than reading it either way, and read the failing step's log
rather than guessing from the job name. The job name is regularly the wrong place to look.
