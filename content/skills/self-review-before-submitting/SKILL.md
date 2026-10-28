---
name: self-review-before-submitting
description: Run the author's own completeness pass on a change before opening a pull request or asking for review - list every requirement as met or unmet with evidence, check that each new test can actually fail, find what the change made false, try unusual spellings of anything parsed, check failure direction and early exits, and run the project's checks with real output. Use when a task is finished but not yet submitted, or when the user says "self-review", "before I open the PR", "am I done", "is this ready for review" or "check my work before pushing". This is the author's check, not an independent review. Not for reviewing someone else's change (performing-code-review), asking a reviewer (requesting-code-review), or the test-first cycle (test-driven-development).
license: MIT
---

# Self-review before submitting

You wrote the change, so you cannot see what you assumed. This pass finds what is still free to fix and lets the change arrive at review carrying evidence instead of claims. It is the author's check. It is not an independent review and never counts as one: write "self-review", not "reviewed".

## Size the pass to the risk

A typo fix, or a local and reversible change with a direct check, needs steps 1, 2 and 9. A change to authentication, stored data, concurrency, public interfaces, deletion or deployment needs the whole pass **and** an independent reviewer (see requesting-code-review). Do not invent low-value tests or write a long checklist for ceremony. Self-review never replaces tests or reviews the project requires.

## 1. Look at what you are about to submit

Read the diff as a stranger would, not as you wrote it.

- Check the working tree status first. Only your changes should be there. Changes you do not recognize may belong to the user or to another agent running at the same time: do not commit them, do not discard them, and tell the user.
- Remove your own leftovers: debug output, commented-out code, unrelated reformatting, TODOs with no ticket.
- Confirm the branch was cut from the right base. A wrong base carries someone else's diff into yours.
- Every changed line should trace back to the task. Pull out or flag what does not, even when it is an improvement.
- Look at how the repo already does the same thing. If your change makes an existing convention impossible to follow, the change is probably wrong, not the convention.

## 2. Requirement ledger

List every requirement of the task and mark each **met** or **unmet**, with evidence: a test name, a command and its output, a line in the diff. "Implements the issue" is not an entry.

- A requirement you cannot mark met is unfinished work. Finish it, or cut it on purpose and say so.
- Count the artifacts the task owes besides code: tests, docs, migrations, configuration, changelog.
- If the task is too open to enumerate (no acceptance criteria, a requirement you would have to invent), stop and ask. Building past that gap yields something that passes review and fails the person who asked.
- If this is the last piece of a larger goal, check that the whole goal is delivered, and list what is not as follow-up work, not as a caveat.

## 3. Five questions about the whole diff

1. Does it do exactly what I say it does, no more and no less?
2. What is the worst input or state it can receive: null, empty, zero, huge, concurrent, a missing config key, an unauthenticated caller?
3. Where can it silently do the wrong thing: swallowed exceptions, defaults that mask errors, partial writes, flags that can be misread?
4. Does it change anything outside its stated scope: shared state, configuration, schema, global handlers, code that runs on import?
5. If it breaks in production, how soon will I know? Is the path tested, logged and loud?

## 4. Can each new test fail?

A green run and a coverage number cannot tell you. A test that cannot fail passes while asserting nothing.

For each test you added or changed, break the production code in the way the test claims to guard against, run the test, and expect red. Then undo that break and expect green. A new assertion that adds no red asserts nothing. (A test you watched fail before writing the code has already passed this check; see test-driven-development.)

- Break the **source**, never the test. Mutating the test only checks the test.
- Do it safely: make the break a small manual edit, note exactly what you changed, and restore by undoing that edit. Never restore by resetting or discarding the working tree, which would also throw away uncommitted work that is not yours.
- Common reasons a test cannot fail: an earlier guard short-circuits so the branch under test never runs (choose inputs that clear every earlier guard, and add a control case with the opposite outcome); the same literal sits on both sides of the assertion (derive the expectation from the computed or rendered value); a test double answers the same whatever it is asked.

## 5. What did this change make false?

A changed rule leaves stale claims in files the diff does not touch, and those files use the words of the **old** claim. Searching for what you edited searches the one region that is already correct.

- Search the repo for the identifiers, command names, flag names, counts and sentences that are no longer true. Read every hit and give each a disposition: fixed, or noted as not drift.
- Check the README, the header comment of each file you changed, docs, configuration examples and any table that carries a count.
- A search finds restatements, not omissions. Also ask where the repo tells someone how to do this thing, and whether that place knows about the change.
- If the repo keeps decision records, supersede the old statement with the reason rather than rewriting it silently.
- Do it now. A sentence that becomes false the moment this merges cannot wait for a later change.

## 6. Other spellings

If the change parses or matches text (commands, flags, paths, names, labels), try the legal but unobvious forms: attached values such as `--flag=value`; text that looks like a flag but sits inside quotes; a second occurrence when the match is greedy; a marker inside a longer word; case and prefix variants.

## 7. Failure direction and early exits

- For each new error path, decide whether it fails open (it silently stops protecting) or closed (it blocks loudly). Both are defects, but only one announces itself, so check the silent one first.
- For each new early return, exit or `continue`, list every rule or step after it and confirm each is still reachable for the cases that matter. A success path can skip code the diff never touched while every existing test still passes.

## 8. Production lens

When the change can reach production, name what you checked instead of writing "no impact": dependencies and lockfiles, permissions and roles, secrets, new external inputs, the deploy or publish path, configuration. "Not applicable" counts only with the evidence: "no manifest or lockfile in the diff, no CI or infrastructure files, a scan of the diff for key patterns found nothing." Check the artifact that ships, not how the diff looks: a comment-only change can still be emitted by a build that inlines content.

## 9. Run the project's checks and read the output

Run the suites you touched and the ones you did not, since a change in one place can redden another, plus lint, type check and build. Use what they printed, not a prediction.

- A check that skipped did not pass. If it matched no files, say so.
- Name failures that were already there. Do not hide them, and do not fix them unasked.
- A red check gets its own sentence in your report, never a parenthesis under "done". Confirm green after the run finishes.
- A check you did not run is reported as not run.

## 10. Write the submission note

Put in it: what changed and why; the ledger; what you cut and why; the checks you ran and what they showed; the checks you did not run; the decisions and assumptions you made; where you want the reviewer to look hardest; and whether anything a user or reader sees has changed. The reviewer will find any gap anyway, and finding it in your own report is cheaper for everyone.

If your self-review and an independent review disagree, the independent review wins. Your pass is a claim to the reviewer, not evidence.

## The one-line test

Would a stranger reading only the task agree this is finished? Can every assertion I added fail? Is every sentence this change leaves behind still true? Can it break production?
