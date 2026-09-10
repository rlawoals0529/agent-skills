---
name: deep-review
description: A second, differently-configured review pass over a diff - a baseline test run before you read a line, a mechanical sweep enumerating the diff's new constructs, and an evidence ladder that makes every safety claim say how far it actually got. Use after a normal review, when reviewing your own change before pushing, or whenever a clean review needs an opinion that does not inherit its candidate set. Triggers on "review this PR", "review the diff", "is this safe to merge", "/deep-review".
---

# Deep review

A review pass built to catch what a criteria-driven read misses. Run it **as well as** your
normal review, never instead of it.

## A clean review is not a baseline

The single most expensive mistake is treating the previous pass's findings as the set of
things worth looking at. Over nine changes on one workstream, an automated review reported
"no issues found" on four of them while a human reviewer filed 33 findings on those same
four. Three of its "verified explicitly" bullets were false: a cap it read as 50 was 30, a
missing gate it argued away was the next round's first blocker, and an arithmetic it called
intentional shipped three figures that did not add up.

It is not always wrong. On the tenth it was the stronger reviewer, read every production
line, and correctly *dismissed* a tempting duplication finding after checking five candidate
reuses — work that yields no finding and was still right.

So the record cuts both ways, and it licenses exactly two things:

- **A previous pass's verified list is the recheck list, not the settled list.**
- **Check which gates abstained.** On a large diff, size-limited checks decline on size
  alone, and an abstention renders identically to a pass.

This pass has **its own intake** — the sweep below — and it runs whether or not the earlier
pass found anything. Skipping intake because coverage looked supplied is how this pass once
missed both of the code bugs the other one found.

## The evidence ladder

For each fact the change's safety depends on, get as far down this list as is cheap, and
**say where it stopped**.

| Rung | Claim |
| --- | --- |
| 1 | You said so. Worthless on its own. |
| 2 | You pointed at a real `file:line`. |
| 3 | You showed the bad case cannot happen — walked the failure, it does not reach. |
| 4 | You ran it. A script or test calling the real code that fails loud if you are wrong. |
| 5 | You reproduced it in the running application. |

**Any safety fact that did not reach rung 4, say so out loud**, and do not write it up as
settled.

**Do not trust your own writeup.** It reads as convincing whether or not it is true. That is
the mechanism behind those three false "verified" bullets: each was a reading of the code
rather than of a result. It is also why an exit code is not the artefact — background jobs
have reported exit 0 while their own output files held failures, so a claim spanning two
layers cites evidence from **both** sides or is written as unverified.

The general form: *failing open is indistinguishable from the check being absent.* **Verify
a guard fires by planting a violation. Do not assume.** One evening produced five
reproduction steps that could not be executed, and two lint guards reporting green while
guarding nothing — one matched a bare identifier the import line already satisfied, the
other carried a filter excluding its only target file. Both were caught by planting a
violation and by nothing else.

## Isolated worktree, and a baseline run before you read a line

Never review on the working branch.

```bash
git fetch origin <branch>
git worktree add /tmp/<branch-slug>-review origin/<branch>
BASE=$(git merge-base HEAD origin/main)
git diff $BASE HEAD
```

**Then run the suite, before forming any opinion.** It is the cheapest evidence available by
orders of magnitude — one suite of 4,169 tests finished in 13 seconds, against roughly
274,000 tokens for a single reading pass — and it buys three things nothing else does.

It anchors every later claim about "green" to a number: that run was **7 failed, 4,162
passed**, all seven pre-existing and in files the diff never touched, so "the suite passes"
was false on that branch and no amount of reading would have said so. It proves the harness
works *before* you rely on it for a mutation test. And it is the only way any claim in the
review reaches ladder rung 4.

**Record the baseline count and quote it.** A later "the tests pass" not compared against
this number is a claim about nothing.

## The boundary sweep

A criteria-driven review reads the diff for defects. This **enumerates the diff's new
constructs** and asks one question of each. It is mechanical, which is the point: the bugs
this pass has missed were findable by grep, not by judgment.

```bash
D=$(git diff $BASE HEAD --unified=0 -- '<production paths>')
echo "$D" | grep -E "^\+.*(sorted\(|\.sort\(|key=|heapq)"    # ordering
echo "$D" | grep -E "^\+.*(try:|except )"                     # error boundaries
echo "$D" | grep -E "^\+.*(\[: *[\w.]*MAX|\[: *[0-9]+\])"     # caps and slices
```

**Check each grep's count against a number you already know before you trust it.** The caps
pattern above first shipped requiring an uppercase character straight after the colon, so it
matched `[:MAX_ROWS]` while missing every `[:_constants.MAX_ROWS]` — one hit where the answer
was four. It was caught only because the count was compared against three caps already known
to be in that file. Otherwise it would have reported a clean sweep of a list it had barely
read. That is this skill's thesis turned on its own tooling.

Then, of each construct:

- **Every new sort key: what fraction of rows tie, and is the surviving set then
  order-dependent?** A key whose every component is *derived* collapses on the common case,
  and a stable sort falls back to insertion order — whatever the upstream happened to return.
  Compare each key against the diff's others; the one not ending in an id or a label is the
  outlier. In one diff that was 1 of 13 sort constructs, and it decided which 29 of N rows
  the answer named, by backend page order.
- **Every new `try`: what is outside it?** Where a contract says the function never raises,
  the question is whether the *whole* body is inside, never whether a try exists. Payload
  assembly and a size guard once sat after the catch-all closed, with three reachable raisers.
- **Every new cap or slice: is what gets dropped deterministic, and does the output say it
  was dropped?** A silent cut and a nondeterministic cut are different bugs, and a capped
  list can have both.
- **Every new tuple, format string or comparison built from row data: which member can be
  null?** Sort keys and format strings are where a nullable column becomes a runtime error.

**State the counts you enumerated** — "13 sort constructs, 6 try blocks, 3 caps" — and do it
even when nothing is wrong. A sweep reporting no findings without a count is
indistinguishable from a sweep that never ran.

## Four probes with no lens of their own

**Confirm duplication before claiming it, and check the inverse.** The commoner miss is that
the helper exists because *this diff just added it*, and the copies it was meant to replace
still stand. A diff introducing the one true home has to go net negative on that idiom. On a
stack it is worse: the same fix written twice under two names produces **no conflict**, so
version control never warns and both land. A clean merge is not evidence of success.

**Prose is a spec, and either half can be the wrong one.** A docstring, comment, description,
fixture, test name or guard key each assert something about the code beside them. Load-bearing
prose is a pointer, a contract, or an argued design, so a false half is a bug rather than a
docs nit — the next editor acts on it. After a rename, sweep the **old** token through test
names and fixture comments, not just source. After a move, read the lines either side of the
old site. A story told in four places has already drifted.

**A unit, scale or denomination claim in model-facing prose gets checked against the code,
every time.** The probes above all test for *staleness*, and a unit claim is usually wrong
from the day it was written, so it never drifted and nothing flags it. Two logged incidents,
same shape, both found by a human rather than a review: a price documented as per-base-unit
when it priced a pack, so an agent stored a cost **24× understated**; and a figure documented
as "all in cents" while carried in currency units, so a costing tool reported **1% of the
real cost**. The tell is a constant — a quantize value is a *scale*, and prose calling it a
unit is the bug. A docstring parity check that walks key *names* will not catch this: one
confirmed all 55 payload keys were documented and still missed that the unit was false.

**Make the test show it can fail.** A guard reading a key the tool never emits abstains on
every run. A hand-written fixture proves only that the code matches the fixture. A test
restating a literal (`assert MAX_ROWS == 50`) checks nothing about size. Anchor the fixture
to the artefact under test, and mutate against the failure case the finding names, not the
one the test already covers. **A requested test can itself encode the bug.**

**A stated property deserves a seeded fuzz, not more fixtures.** When a design *claims*
monotonicity, idempotence or round-trip stability, hand fixtures encode only the failures
someone already imagined. A streaming prefix that had to be monotonic shrank three different
ways, and no fixture caught the last one; a seeded generative test found it in minutes.

## These are not coverage findings

Nothing here asks for a missing test, because coverage adequacy should not be an agentic
gate. A guard reading a key the tool never emits is a **broken check reporting green**, and a
test restating a literal is a check that cannot fail. Those are defects in the change, scored
like any other. Say which of the two a finding is, every time.

## Verdict

Two states. **Verdict in the first line, then the detail.**

- **Request changes.** A real bug at any size, or any new duplication. One hand-rolled
  duplicate is this state on its own — it is not a weighing test.
- **Approve.**

There is no "approve with changes". It is gone as a label and kept as a requirement:
**every approve names what must still land in the same push**, and the approve is void if one
of those is missing from it.

A finding you would let ship undone is not a finding. It is an observation, and it goes in a
separate list.

Per finding, give **the rung of the evidence ladder the claim reached**. Draft the review,
hand it over, **never post it**.
