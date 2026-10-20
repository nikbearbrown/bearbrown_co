---
name: requesting-code-review
description: Get a change independently reviewed against its requirements before it moves on. Use after finishing a task or a major feature, after fixing a complex bug, and before merging, or when the user asks for "a code review", "a second pair of eyes", "a security check" or "review before merge". Covers what to give the reviewer, what a usable review contains, and how to act on it.
license: MIT
---

# Requesting a code review

Review early and often, while a problem is still one change away from the cause. A reviewer who has only the work product and its requirements catches what the author, who knows what they meant, no longer sees.

## When to ask

**Always:** after each task in a multi-task plan, after a major feature, and before merging to the main branch.
**Often worth it:** when you are stuck and need a fresh view, before a refactor (to baseline), and after fixing a complex bug.

Small lookups and text-only edits can be checked inline. Never describe a review as independent when you reviewed your own work. Say who did it.

## How to ask

**1. Fix the range.** Record the commit before the work and the commit after it. Include uncommitted and untracked files in the review if the work has any.

```bash
BASE_SHA=$(git rev-parse origin/main)   # or the commit before this task
HEAD_SHA=$(git rev-parse HEAD)
git diff --stat $BASE_SHA..$HEAD_SHA
git status --short                      # staged, unstaged and untracked changes
```

**2. Hand the reviewer a brief, not your session.** Give a separate reviewer (another agent, a fresh session, or a person) only the work product and what it must satisfy, so it judges the change and not your reasoning. Fill in:

- **What was built**, in two or three sentences.
- **Requirements or plan** it must meet, with a link or the text.
- **Range:** base and head commits, and the changed files.
- **Project conventions:** how to run the tests and any required or banned patterns.
- **Verification evidence:** what you ran and what it printed.
- **Decisions already made**, and **concerns you have not resolved**, so the reviewer does not re-argue the first or miss the second.

**3. Say what a good review contains.** Ask for:

- A verdict: ready, ready after fixes, or not ready.
- Findings with a severity (below), the file and line, and why it matters.
- What was **not** checked, and why.
- At least three concrete ways the change could fail, and what would have to be true for the reviewer's own conclusion to be wrong.
- Which break attempts were actually run and which were only reasoned through, labeled as such.

A review that is only "looks good" is not a review. Send it back.

**4. Add a security pass when the change touches it.** If the diff touches authentication or authorization, input validation or output encoding, endpoints handling user data, secrets or credentials, cryptography or tokens, or deployment and CI configuration, the review must also cover: injection (SQL, script, command), broken access control, session and token handling, secrets in code or logs, vulnerable dependencies, and error messages that leak detail. Critical and High security findings block the merge until fixed, or until the user accepts the risk in writing.

For changes with tricky logic (concurrency, state machines, retry or rollback paths, data pipelines), also ask for an adversarial pass: concrete inputs, orderings and states that break it, rather than a checklist.

## Severity

| Level | Meaning | What you do |
|---|---|---|
| **Critical** | Unsafe, loses data, a security hole, or required behavior is broken | Fix now, before anything else |
| **Important** | A required behavior is missing, a regression, or the implementation is fragile | Fix before moving on, unless the user defers it |
| **Minor** | Polish that does not block the work | Note it and do it later |

## Acting on the review

1. Fix Critical issues first, then Important ones. Record Minor ones.
2. Re-run the checks after each fix and ask the reviewer to look again at the findings and the fix diff, not the whole change. If two fixes for the same cause fail, stop retrying: change the plan, or report that you are blocked.
3. If the reviewer is wrong, say so with evidence: the code, the test, the output. Do not argue from opinion. Ask for clarification if you cannot tell. See `receiving-code-review` for the full approach.
4. Do not proceed with unfixed Critical or Important findings.

## What not to do

- Skip a review because the change is "simple".
- Ignore a Critical finding or move on with an unfixed Important one.
- Argue with technically valid feedback.
- Pass the reviewer your whole session history or your conclusions.

## Example

```
Just finished task 2, adding a verification function. Asking for review before task 3.

What was built:  verifyIndex() and repairIndex(), handling four issue types
Requirements:    task 2 in docs/deployment-plan.md
Range:           a7981ec..3df7661
Conventions:     run `npm test`; no network calls in unit tests
Evidence:        npm test, 41 passed, 0 failed
Not resolved:    I am unsure whether repairIndex() is safe to run twice

Review returned:
  Strengths:  clean structure, real tests
  Important:  no progress indication on long repairs (src/index.ts:88)
  Minor:      magic number 100 for the reporting interval (src/index.ts:41)
  Not checked: behavior under a concurrent write
  Verdict:    ready after the Important fix
```

The author then fixes the Important item, notes the Minor one, and asks about the concurrent write before starting task 3.
