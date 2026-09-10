---
name: review-triage
description: Triage a pull request or working diff so a reviewer knows what to skim and what to actually read. Finds rules implemented twice with nothing enforcing agreement, feature-flag paths tested in only one state, and new logic without tests. Produces a per-file verdict of skim, scan or read, with a stated reason for anything that needs a human. Use before opening a PR, when the review queue is the bottleneck, or when asked whether a change is safe to approve quickly. Triggers on "is this ready to review", "will this pass review", "did I test this enough", "triage this PR", "what needs a human look", "is this safe to approve".
---

# Review triage — what can be skimmed, and what must be read

The problem is not a shortage of checks. It is that a reviewer has to read every line to
find out whether a change is safe, and that reading is the bottleneck.

So the output is **not another findings list**. It is a per-file verdict telling a reviewer
where to spend attention, and where they can trust the tests instead.

## The verdict

Every changed file lands in exactly one bucket.

| Bucket | Meaning |
| --- | --- |
| **SKIM** | Tests cover the behaviour. Glance at the diff for shape, do not trace the logic. |
| **SCAN** | Read the diff, but you need not reason about correctness. Usually mechanical, or well-covered but new. |
| **READ** | A human must actually think about this. **Always says why.** |

A reviewer should be able to act on the READ list alone. If READ is most of the diff, the
triage has told you the change is not ready for a fast review. That is a useful answer, not
a failure.

**The bar for SKIM is high.** A test that exists is not the same as a test that could fail.
If a new regression test was never seen red, it is not proven to guard anything, and the
file is SCAN at best.

## 1. Drift — rules implemented twice with nothing enforcing agreement

**This is the reason the skill exists.** One bug bash across four surfaces found six bugs;
five had this single root cause. Crucially, **coverage would not have caught any of them** —
both sides had passing tests. One client-side test asserted a premise in its own comment
that the server contradicted, and both were green.

Hunt for:

- A client-side constant, set or map that describes server-owned data
- Comments admitting the duplication: "must mirror", "must match", "keep in sync", "same as
  the backend"
- Two write paths that create or update the same entity
- A read-side resolver and its write-side guard that gate on a flag differently
- A validation rule (a format, a range, an allowed-transition table) expressed on both sides

For each pair, check whether a **lock test** already pins it — a single test that reads both
definitions and asserts they agree. If none exists, that file is a **READ**, and offer to
generate the lock.

A lock test is worth more than the triage that found it. Once committed, it enforces the
pair forever and neither this skill nor a reviewer is needed for it again. **The triage finds
which locks are missing; the locks are what shrink the next review.**

## 2. Flag matrix

For every feature-flagged surface the diff touches:

- Do tests exercise the flag **off** as well as on? The off path is the one nobody demos.
- Does the read side gate the same way the write side does? A read that hides a control
  while the write still rejects, or the reverse, means the interface offers what the server
  refuses.

Two of those six bugs existed **only** when a flag was off. Flag-off is not an edge case, it
is a customer configuration.

## 3. Coverage of the new logic

Not a percentage. Per new branch or rule the diff introduces, ask whether anything would
fail if it were wrong. Then ask the harder question: **was the test ever seen failing?** An
assertion that passes against both the bug and the fix is decoration.

## 4. Delegate rather than reimplement

Where your setup already has a skill or tool that owns query performance, duplication
detection or security review, invoke it and report its verdict inside the triage rather than
restating its reasoning. Do not rebuild those here.

## 5. Write the verdict

Group by bucket, not by file order. READ first, because it is the only section a busy
reviewer is guaranteed to reach.

```markdown
## Review triage — <branch or PR> · <N files changed>

**READ (n)** — a human needs to reason about these

- `path/file.ts:42` — <the specific reason, in one line>

**SCAN (n)** — read the diff, do not trace the logic

- `path/thing.tsx` — <one-line why it is only a scan>

**SKIM (n)** — covered by tests

- `path/covered.py` — pinned by `tests/test_x.py::test_y`

---

**Drift pairs found:** <none | list, each with whether a lock exists>
**Flag matrix:** <flags touched, and whether both states are tested>
**Delegated:** <tool> <verdict> · <tool> <verdict>
**Not run:** <anything skipped, and why — never leave a gap silent>
```

## Non-negotiables

1. **Never claim SKIM without naming the test.** "Looks covered" is not a verdict. Cite the
   test that would fail.
2. **Every READ states its reason.** A READ with no reason is worse than no triage, because
   the reviewer has to rediscover why.
3. **Say what was not run.** Too large a diff, an unavailable tool, a flag state you could
   not exercise — put it under "Not run". A silent gap reads as coverage.
4. **Do not gate.** This produces a verdict for a human. It does not approve or block, and
   it never commits, pushes or opens a PR.
5. **A generated lock test must be seen failing.** Run it against the current code before
   offering it. A lock that passes on already-drifted values pins the drift in place.
