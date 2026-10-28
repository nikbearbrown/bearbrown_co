---
name: verification-before-completion
description: Gate every claim that work is done, fixed, passing or ready on fresh evidence - run the check that proves the claim, read its output and exit code, and report only what it shows. Use before saying work is complete, before committing, pushing or opening a pull request, before marking a task done or starting the next, and whenever a worker or subagent reports success. Triggers include "is it done", "does it pass", "ready to merge", "did that work", and the urge to write "should work now". Covers tests, builds, linters, file edits, migrations, bug fixes, requirement checks and delegated work. Not for choosing what to test (see test-driven-development) or finding a cause (see systematic-debugging).
license: MIT
---

# Verification before completion

A claim that work is done, fixed or passing is a statement about the state of things right now. Only a check run against that state can support it. Confidence, a plausible diff and an earlier green run are not checks. An unchecked claim is a guess stated as a fact, and the person who trusts it pays for it.

## The rule

```
NO COMPLETION CLAIM WITHOUT EVIDENCE FROM A CHECK RUN AGAINST THE CURRENT STATE
```

"Current state" means the code, configuration, dependencies and environment as they are after your last change. The rule covers paraphrases and implications: "all set", "that's sorted", a commit message, a pull request description, a hand-off, or moving on to the next task. Saying "I made the change and have not run the tests yet" is honest, and always allowed.

## The gate

1. **Identify** the check that would prove this claim, and would fail if the claim were false.
2. **Run** the complete command, not a subset. A claim about the suite needs the suite.
3. **Read** the whole result: the exit code, the counts, the failures, the warnings. The last line is not the result.
4. **Compare** it with the claim. Does it say exactly this, or something narrower?
5. **Report** the claim together with the evidence. If the evidence does not support it, report the actual status instead.

## What proves what

| Claim | Evidence | Not enough |
|---|---|---|
| Tests pass | The full suite, run after the last edit: counts and exit code | An earlier run, only the new test file, "should pass" |
| Build succeeds | The build command exits 0 | A clean linter, logs that look fine |
| Linter or type check is clean | That tool's own output | Inferring it from a related tool |
| Bug is fixed | The original symptom no longer reproduces, and a regression test failed before the fix and passes after | The code changed |
| Edit applied | Re-read or search the file for the new text where it should be, then syntax-check or compile it | The editing tool said success |
| Migration or data change worked | A query showing the new state: row counts, new columns, permissions | The command returned success |
| Requirements are met | Each acceptance condition checked one by one | The tests pass |
| A worker finished | The actual diff, including new untracked files, plus checks you ran or its real log | Its report |
| Nothing else broke | The full suite, and a diff that touches only what you expected | The file you changed passes |

## Making a regression test earn its name

A test that was never red proves nothing. Write it, see it pass, remove the fix, see it fail, restore the fix, see it pass. Do the removal in a way you can restore exactly: a copy of the tree, or a change you can reverse. Never reset, check out over, or stash away the user's uncommitted work to stage the experiment. If you cannot do it safely, say "not shown to fail without the fix" and do not call the test a regression guard.

## Reading a result honestly

A green result can be empty. Look for: zero tests collected, tests skipped, a command run in the wrong directory or environment, an exit code of 0 after error output, and a check that never touched the changed lines. For a bug fix or new behavior, name the test that exercises the lines you changed.

Report every failure the run shows, by name, including ones you did not cause. A red result you watched scroll past and did not mention makes your report false by omission.

## When earlier evidence can be reused

Re-running everything after each message is waste, but reusing a result needs all of these:

- the same code state, including staged, unstaged and untracked files (a commit hash does not cover uncommitted changes);
- the same command and the same scope;
- the same dependencies, configuration, runtime and external state, or a known equivalent;
- the actual log and exit code in hand, not a summary of them.

If any is missing, run the check again. A worker's "PASS" is a lead, not evidence, until these are confirmed.

## Small changes are not exempt

Small changes are where unverified work slips through. Scale the check to the change, never to zero. A one-line edit gets a one-line check: re-read it, syntax-check it, or run the test that covers it. A comment or documentation edit can use a lighter check, such as reading the diff, rendering the page or following the link. Say which check you used. Do not classify a change as trivial to avoid a check you would otherwise owe, and do not defer a check to a reviewer: review reads the change, it does not run your code.

## When you cannot run the check

The check may need a pipeline, hardware, credentials or a service you cannot reach, or the project may have no tests. Do not substitute confidence.

- Say what you could not run and why.
- Do what you can instead: a smoke test, a manual reproduction written down as input, expected result, observed result, and pass or fail.
- Mark the claim unverified, and the work incomplete. An unrun check is not a passed check.
- Known debt is acceptable only when named, assigned and non-blocking. A failed check blocks completion.

## After a failure

Diagnose before you retry (see `systematic-debugging`). Fix the cause, then run the check that covers the fix. If two fixes for the same cause fail, stop looping: change the plan or report that you are blocked.

## Verification must not change the world

A check should not cause the damage it guards against. Do not run deployments, migrations against shared or production data, destructive scripts, or anything that sends messages or spends money as a "check" without the user's say-so. Use a dry run, a test database or a read-only query. Passing verification is the precondition for committing, pushing or opening a pull request, not permission to do them. Do those only when the user has asked.

## Words that should stop you

| You are about to say or think | Do this instead |
|---|---|
| "Should work now", "probably", "seems to" | Run the check |
| "Great!", "Done!" before any run | Run it, then say what it showed |
| "I'm confident" | Confidence is not evidence |
| "The linter passed, so it builds" | Run the build |
| "The worker says it works" | Read the diff and the checks yourself |
| "Just this once" or "I'm tired" | The rule does not bend for either |
| "The reviewer will catch it" | Review comes after verification, not instead of it |

## Reporting

Keep the report short enough to inspect:

```
Ran:      npm test (repository root, after the last edit)
Result:   exit 0, 212 passed, 0 failed, 2 skipped (both skipped before my change)
Not run:  browser tests, which need a display
Claim:    the retry fix works and the unit suite is green. Browser behavior is unchecked.
Status:   incomplete until the browser tests run
```

Bad: "That should fix it. Tests pass."

For a longer run, keep the full log in a file and report the command, the working directory, the state tested (commit plus any uncommitted changes), the result, and the log's path. Status is complete only when every check you meant to run was run. A missing step means incomplete, never a softer sentence.

Before a hand-off, re-read the original request or plan, list every acceptance condition, check each, and report the gaps by name.
