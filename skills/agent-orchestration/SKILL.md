---
name: agent-orchestration
description: Orchestrate a fleet of coding agents - read the board, decide what can move, and dispatch work behind one batched approval. Use when several agent sessions are running and nobody is deciding what happens next, when dispatch requests are waiting, or when work has stalled and you need to know which item is actually blocked and on what. Triggers on "drain the outbox", "what should be dispatched", "run the board", "who is working on what", "/agent-orchestration".
---

# Overseer

A board shows the fleet. This decides what happens next in it.

The split matters: the board writes **requests**, and this is the only thing that turns a
request into work. A dispatcher that dispatches on its own is the thing the permission
rules exist to prevent.

## The one rule that is not negotiable

**An item blocked on a permission goes to the human. Never to a peer agent.**

Routing a blocked item to another session to get past the block is permission laundering.
A peer session cannot consent on the human's behalf however the request is worded, and a
peer *quoting* the human is not the human's word either.

Enforce it in the model rather than in judgement: mark any card whose block is a permission
as not dispatchable, with the reason attached, and treat a blocked card with **no recorded
reason** as a permission block. Fail closed, and report the missing field as an error on
the row. If you find yourself arguing that a particular permission block is fine to hand
off, you have found the failure mode, not an exception.

## `unknown` is not `no`

Every readiness field is three-valued. A merge-readiness of `unknown` means no check has
measured this tree, or the log could not be read, or - the case that bites - a gate passed
*before the last commit* and has since been withdrawn.

**Report unknown as unknown.** A stale green is worse than no answer, because it is the one
a person acts on.

## Read the board once

Build the whole model in one pass and read from it. Never shell out per card. Each card
should carry enough to decide without a second lookup:

| Field | Meaning |
| --- | --- |
| `state` | backlog / ready / running / review / blocked / merged / archived |
| `session_state` | the derived state of the session that owns it, or empty |
| `at_risk` | running or in review with a dead, stalled, looping or blocked owner |
| `merge_ready` | yes / no / **unknown** |
| `dispatchable` + `why_not` | the decision, already made, with its reason |
| `errors` | what is wrong with the card itself, not with the work |

Confirm you actually hold the orchestrator role before dispatching anything, and never
treat two fields that are both written by the claim as corroboration - they always agree.

## Dispatch

### Starting work does not claim the ticket. Pushing does.

Read the assignee, never write it. The write moves to the moment a branch goes up, and
rides the same permission the push already needs.

Read it anyway, because the read is what stops a bad dispatch. Assigned to **someone else**
means stop - that is not yours to reassign, and it is a strong sign the item should not be
dispatched at all. Unassigned, or already the human's, means dispatch and leave the field
alone.

**Say plainly what this costs.** An unassigned ticket with work running against it is one
two people can pick up. The fleet board shows the work in flight; the issue tracker does
not. Anyone looking only at the tracker sees an unclaimed ticket for the whole time a
runner is on it. If a colleague starts the same ticket, that is the mechanism, and the
answer is to push sooner rather than to re-litigate the rule.

**Never assign speculatively to close that window.** "I will claim it early so nobody
collides" is the rule this replaced, reintroduced with a different excuse.

### Ask once, for the whole round

One approval listing every item you would dispatch, with its target. Never one prompt per
card.

### Destructive is not the same as forked

**A prompt is for a real fork, not for a determined outcome that happens to be
irreversible.** Run both tests, and ask only when both say yes:

| | |
| --- | --- |
| **Is it irreversible or outward-facing?** | If no, just do it. |
| **Is there more than one outcome that is not broken?** | If no, **do it and report it**, saying what you did and why nothing else was available. |

Killing an orphaned duplicate agent passes the first and fails the second: it is
irreversible, and every alternative leaves work that cannot finish. Do it. Deciding whether
two conflicting tickets become one change passes both - that is scope, and scope belongs to
the human.

This softens nothing. A permission block still goes to the human. A commit, push, merge or
outward-facing write still needs their word in the turn it happens. Product intent is still
theirs. The half that gets forgotten is the other one: "I do not know" means go and find
out, and "it is destructive" is not on its own a reason to ask.

### Re-derive an escalation, do not relay it

A run that stood down and wrote a blocker was right to stand down. That does not make its
recommendation current. One such write-up named a process that had already exited and
called a file broken that the agent itself retracted four minutes later. Check its facts,
and if the answer is now determined, act rather than forwarding a stale question.

### State the cost, or state that you cannot

Say which of these you are giving:

- **Quota** - often unpublished or stale. When it is, **say it is unknown**. Do not
  substitute a guess, and do not read a null as "plenty".
- **An unattended run** - measurable per round once a run exists. Before that there is no
  figure.
- **A peer's turn** - not measurable in advance. Say so. One earlier estimate counted
  output only and came in roughly 8× low, which made the brake useless. **A number nobody
  computed is worse than a blank.**

## Unresolved duplicates block

Before dispatching, read the item's duplicate field. An entry that is neither confirmed nor
rejected is an open question, and an open question stops that card.

**Do not decide it yourself.** Whether two tickets are the same bug is the judgement an
orchestrator is worst at, and the one whose wrong answer costs most: two agents fixing one
bug on two branches, neither knowing about the other, both opening a change, and the second
to land conflicting with work that already solved it.

Write the question to the board instead, hold the card, and say which cards you are holding
and why.

**A confirmed duplicate stops you, not the human.** Accepting a card already marked as a
duplicate is their decision, and a board that refuses their own ruling back at them is just
in the way. The stop is yours: if the confirmed twin is *also* in the queue, dispatch
**neither**, name both, and hold until they say which survives.

Rulings are the human's judgements, not yours. Never write into that record except through
an answered question.

## Stopping a run: kill the agent, not the script

A supervising loop that spawns one agent per round is not the agent. **Killing the loop
does not kill the agent.** Reap the loop's children and the in-flight agent has usually
already reparented to init, so it survives; a follow-up pattern-kill on the loop's name
then matches only the shell and reports success while the agent keeps writing.

Match the agent by its prompt, which is unique per item and lives in the process table for
exactly as long as it does. **The trailing space is load-bearing** - without it `TASK-9`
matches `TASK-93`:

```bash
pgrep -f "working ticket TASK-93 "
kill $(pgrep -f "working ticket TASK-93 ")

pgrep -f 'working ticket' | while read p; do
  printf '%s ppid=%s\n' "$p" "$(ps -o ppid= -p "$p" | tr -d ' ')"
done
```

**A parent of 1 is an orphan** - a run whose loop is gone. It finishes its current round
and then nothing else happens, which is why it reads as alive and is not.

Two agents against one working tree is the failure this prevents. It has happened, and it
ran for twenty-six minutes before anyone noticed.
