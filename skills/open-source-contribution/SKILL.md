---
name: open-source-contribution
description: Take a public GitHub issue from candidate check through a verified, project-native pull request. Routes through task-kickoff, code-quality, adversarial-review, review-triage, voice-capture, and audit-pr-threads at the stages where each belongs. Use when choosing an open-source issue, contributing to another repository, preparing or opening a PR, or handling feedback on an external contribution. Triggers on "open source contribution", "contribute to this repo", "work this issue", "prepare this PR", "open this PR", "/open-source-contribution".
---

# Open source contribution

The goal is not to produce a pull request. The goal is to make one small change that the
maintainer can verify, review, and reasonably want in the project. Contribution count is not
a quality metric.

## Rule zero: the upstream repository wins

Read `CONTRIBUTING.md`, `AGENTS.md`, pull request templates, issue comments, and repository
rules before editing. Their rules override this skill.

If the repository says to claim an issue and wait for assignment, stop after claiming it.
Do not create a branch or code while waiting. If it prohibits or restricts AI-assisted work,
follow that rule exactly. Never disguise prohibited assistance.

Do not contribute to a repository only because it has a `good first issue` label. A useful
candidate has a real problem, active ownership, a reviewable scope, and a way to prove the
change works.

## 1. Qualify the work before forking or editing

Check all of these against current upstream state:

- The issue is open and the requested behavior is still relevant.
- Read every issue comment. Scope often moves there.
- There is no assignee, claimed contributor, branch, or open PR already doing the same work.
- Outside contributions are accepted for this issue.
- The project is active enough that maintainers still review changes.
- The task can be reproduced or verified without private infrastructure the contributor does
  not have.
- The change is meaningful product, test, documentation, accessibility, reliability, or
  developer-experience work. Reject typo farming and artificial contribution exercises.

Record the issue URL, upstream base branch, contribution rules, acceptance criteria, and exact
verification commands before touching code.

## 2. Start with the existing task skills

Use the sibling skills as a pipeline rather than copying their rules here.

1. `task-kickoff` - establish ground truth, comments, base branch, existing work, reuse points,
   and evidence gates.
2. `code-quality` START - map sibling implementations and stop at the smallest design that
   holds.
3. Build the smallest coherent slice. No unrelated cleanup.
4. `code-quality` DEEP CHECK - read the risky changed files, trace the real path, and run the
   blocks gate.
5. `adversarial-review` - independently try to disprove the change and grade every important
   claim by its evidence.
6. `review-triage` - say what a maintainer can skim, scan, or must read.
7. `voice-capture` - write the outward-facing PR text only after the implementation and
   evidence are settled.

If subagents are used, `agent-orchestration` governs routing and permissions. Use `bug-bash`
when the finding depends on a mediated runtime, timing, UI, or other surface where a second
independent reproducer materially changes confidence.

## 3. Prove the bug and the fix

For a bug fix, prefer red to green evidence:

1. Reproduce the bad behavior or add the smallest regression test that represents the real
   production sequence.
2. Confirm it fails on the unmodified behavior.
3. Make the narrow fix.
4. Confirm the same check passes.
5. Run the repository's required focused and full checks.

For a feature, prove the acceptance criteria with tests or executable verification. A test
that passes with and without the change is not evidence for the change.

Never write `tests pass`, `lint is clean`, `CI is green`, or similar language without literal
output or an authoritative check result from the exact commit being proposed. If the local
environment cannot run a required check, say so and use upstream CI as the execution gate.
Do not turn missing local evidence into a passing claim.

## 4. Make the code look native because it is native

Read the surrounding implementation and recent accepted changes before choosing structure.
Match the repository's naming, error handling, comments, test style, dependency policy, and
commit convention.

Avoid the common generated-PR tells:

- no architecture around a five-line fix
- no generic comments that restate code
- no unrelated renames or formatting passes
- no speculative abstractions
- no invented metrics, examples, or confidence claims
- no verbose PR body that says the same thing three ways
- no new dependency when an existing helper or standard library already solves it

A small diff is not automatically better, but every changed line should be needed for the
issue or its proof.

## 5. Prepare the PR in the writer's register

The upstream PR template comes first. Fit this shape into it rather than replacing it:

```
WHAT         what changed for the user or maintainer
WHY          the concrete problem that required it
HOW TO TEST  the commands actually run and the behavior they prove
```

Use `voice-capture` for the final prose. Keep it plain, specific, and short. Mention the
issue with the repository's preferred closing syntax only when the PR really resolves it.
Include limitations or checks not run. Do not claim a result merely because the code looks
right.

Outward writes follow `voice-capture`: draft and hand over unless the user explicitly
authorized posting in the current turn. If the current instruction already says to carry
the contribution through posting after verification, that is authorization; do not ask
again.

## 6. After the PR opens

Watch the exact head commit's checks. A queued, action-required, cancelled, or absent run is
not green. Read the failing job and step before changing code.

When review arrives, use `code-quality` FEEDBACK. Enumerate every unresolved thread before
working the summary. If `audit-pr-threads` would help, count the unresolved threads first and
ask before invoking it because that workflow can spawn a large agent fleet. Zero unresolved
threads means do not run it.

Reply to review feedback with evidence, not ceremony. Let maintainers decide whether to
resolve their threads unless the repository's norms say otherwise.

## Finish states

Use one of these, and do not blur them:

- **READY** - implementation is verified and the PR is ready to post.
- **POSTED** - PR is open; state the CI and review status separately.
- **BLOCKED** - a repository rule, assignment, permission, missing environment, or failing
  check prevents the next legitimate step. Say exactly what is needed.
- **DONE** - upstream merged or otherwise accepted the contribution. An open PR is not done.
