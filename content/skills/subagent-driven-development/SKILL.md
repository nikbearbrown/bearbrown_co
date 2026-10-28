---
name: subagent-driven-development
description: Execute an approved written plan one task at a time in the current session. A fresh worker (subagent) implements each task from a self-contained brief, a separate review checks it against the task's requirements before the next task starts, and one final review covers the whole change. Use when the user hands over a plan with mostly independent tasks and says "execute the plan", "work through these tasks with subagents" or "subagent-driven". Covers briefs, worker status handling, per-task review, a bounded fix loop, a progress ledger that survives lost context, and model choice. Not for independent problems to run concurrently (see dispatching-parallel-agents), writing the plan, tightly coupled tasks, or one small change.
license: MIT
---

# Subagent-driven development

You are the controller. You hold the plan, write each brief, decide, and keep the record. A fresh worker implements each task from a brief you wrote, and someone other than that worker reviews it before the next task begins. Workers never inherit your session, which keeps them focused and your own context free for coordination.

**Principle:** one fresh worker per task, a review after each, one broad review at the end, and a written ledger so lost context never costs a repeated task.

## When to use it

Use it when a written plan exists, the user wants it executed here, its tasks are mostly independent (each understandable from its own text plus settled interfaces), and the host can start a worker with its own context.

Do not use it for:

- **No plan yet.** Clarify and write one first.
- **Tightly coupled tasks.** One worker's guesses become the next one's constraints. Work inline, or restructure.
- **A tiny change.** Do a one-file edit directly.
- **Independent problems to run at once.** That is `dispatching-parallel-agents`. Here tasks run strictly one after another, because they share one working tree and each review depends on the order.
- **No worker mechanism.** Work through the plan inline with the same discipline, and say plainly that the review is your own, not independent.

A worker must not start workers of its own.

## Before the first task

1. **Isolate the work** on a branch or a separate working copy. Do not begin on the main branch without the user's consent. Leave the user's unrelated uncommitted changes untouched.
2. **Read the plan once**, with its global constraints, and make a checklist with one entry per task.
3. **Scan for conflicts before dispatching:** tasks that contradict each other or the constraints, tasks that edit the same files, and anything the plan demands that a reviewer would call a defect (a test that asserts nothing). Put everything you find to the user as one batched question, each item beside the plan text behind it. If the scan is clean, go on.
4. **Start the ledger.** Conversation memory does not survive context compaction, and a controller that forgets where it was can redo finished work. Keep a progress file where git ignores it, or in scratch space. Its first line names the plan file; add a line per event (task complete, fix round, parked finding, blocker). A ledger naming a different plan belongs to another run: leave it alone. After any loss of context, trust the ledger and the version-control log over your recollection: a task with a complete line is done, and one whose last line is a fix round resumes at the next round.

## The task loop

### 1. Brief the worker

Record the base first: the commit, or the file state if there is no version control. Never use "the previous commit" as the base for a task that may have made several.

A brief describes one task, not your session:

- one line on where the task fits in the project;
- the task's full text from the plan, with exact values (numbers, strings, signatures, test cases) verbatim;
- interfaces and decisions from earlier tasks that the text cannot know, and your resolution of any ambiguity you noticed;
- the files it may touch and must not touch;
- how to verify, and where to write its full report.

Do not paste a history of earlier tasks, and do not make the worker read the whole plan. Everything you paste into a brief or a worker prints back stays in your context for the rest of the session, so hand over long material as files and have the worker write its full report to a file, replying with its status, a one-line test summary and any concerns.

Tell the worker to follow `test-driven-development`, to ask rather than guess, and to commit only if the plan or the user calls for commits. Run one implementer at a time.

### 2. Handle the status

| Status | You do |
|---|---|
| DONE | Review it |
| DONE_WITH_CONCERNS | Read the concerns. Settle correctness or scope doubts before review; note mere observations and proceed |
| NEEDS_CONTEXT | Supply it and re-dispatch |
| BLOCKED | Find out why: add context, use a more capable worker, split the task, or, if the plan is wrong, take it to the user |

Answer a worker's questions completely before it proceeds. Never ignore a stuck report or resend the same worker unchanged: if it said it is stuck, something has to change.

### 3. Review the task

The reviewer is not the implementer. A worker's self-review helps but never replaces this step. Give the reviewer the brief, the worker's report, the diff for base-to-head (plus uncommitted and untracked files if the worker did not commit), and the binding constraints copied verbatim from the plan. Use `requesting-code-review` for the brief and the severity scale.

Require two verdicts, requirements first: is everything asked for present, and nothing extra; then is the work sound, with real tests and clear code. A report missing either verdict is not a review. For tasks touching authentication or authorization, secrets, money, deletion or migration of data, untrusted input, concurrency or a public interface, finish the requirements pass before starting the quality pass. If unsure whether a task is that kind, treat it as one; size does not lower risk.

- Do not tell the reviewer which findings to ignore or soften. If you expect a finding to be wrong, let it be raised and decide in the loop. Wording like "do not flag" is pre-judging.
- Do not ask it to rerun tests the worker already ran on the same code. Check that the report's command, output and code state are real (see `verification-before-completion`), and run the full suite yourself when in doubt.
- A reviewer may mark items "cannot verify from the diff" because they depend on code outside it. You hold the cross-task context, so settle each before completing the task. A confirmed gap counts as a failed requirements verdict.

### 4. The fix loop

The loop starts on a requirements gap, a Critical or Important finding, or a confirmed "cannot verify" gap. Minor findings never enter it: log each in the ledger as deferred and give the list to the final review. A finding that collides with what the plan's text requires is the user's decision. Show them both and ask which governs; do not dismiss it because the plan says so, and do not dispatch a fix that contradicts the plan unasked.

A fix round is one fix dispatch plus one scoped re-review:

1. Send the open findings verbatim, preferably to the original worker, which knows the code and its own choices. If the host cannot message a live worker, start a fresh one with the brief, the report file and the findings.
2. It fixes, runs the tests covering the change, and appends a fix report with command and output.
3. The re-reviewer sees the findings, the brief, the report and only the fix diff. It marks each finding addressed or not addressed and flags new breakage in the fix diff alone. New Critical or Important breakage joins the open list; anything else goes to the ledger as deferred.
4. Log the round.

Do not fix findings yourself in the controller session. It spends your context, and an unreviewed fix is how regressions land.

**The breaker.** If two fixes for the same cause have failed, or rounds keep surfacing new, different problems, stop dispatching. Something must change before another attempt: the brief, a fresh worker, a more capable model, a smaller task, or the plan. Then rule on each open finding and write every ruling in the ledger:

- Reviewer wrong, or the point arguable: park it, with why the code stands.
- Real, but nothing downstream builds on it: park it, with a ruling that says it is real and deferred.
- Real and load-bearing, because a later task builds on it or it exposes a plan defect: stop and report to the user with the finding, the plan text it collides with and the fix history. Parking it lets every later task build on a fault.

Rule on findings only at the breaker. Ruling earlier to end a loop is pre-judging under another name, and silent discards are not allowed.

### 5. Complete the task

Write the completion line: range, review result, number parked, and the test command with its result. Tick the checklist. Never start the next task while a Critical or Important finding is neither fixed nor parked with a ruling.

## Choosing a worker

If your host lets you choose, give each role the least capable model that can do it well; an unconfigured worker may inherit your own, more expensive one. Mechanical tasks (isolated function, complete spec, one or two files) suit a cheap model, integration and judgment work a standard one, and design-heavy tasks and the final review the most capable. Scale reviewers to the diff's size and risk. Cheap models can need many more turns on multi-step work, which can erase the saving, so use the cheapest tier mainly when the plan text already contains the code to write.

## Final review and finish

After the last task, give a reviewer on the most capable model the whole range from where the work began, the ledger's deferred and parked lines, and the plan's requirements. If it returns findings, send the complete list to one fix worker (not one per finding), run one scoped re-review, and rule on what remains as at the breaker. There is no second fix wave: a leftover load-bearing finding goes to the user.

Then run the full suite yourself and apply `verification-before-completion` before reporting. Tell the user what was built per task, what was parked or deferred and why, the commands you ran with their results, and anything unverified.

Do not merge, push, open a pull request, delete the branch, or remove the ledger and scratch files unless the user asks. Say where they are.

## Pace

Inside an approved plan, do not stop between tasks to ask "should I continue?". Stop for: a BLOCKED you cannot resolve, ambiguity that truly prevents progress, a conflict between plan and review, a load-bearing finding at the breaker, an action outside the plan (push, deploy, deletion, spending), or a check-in the user asked for.

## Excuses you will hear yourself make

| Excuse | Reality |
|---|---|
| "Close enough on the requirements" | A reviewer-found gap means not done |
| "I'll fix it myself, dispatching is overhead" | Your fix skips review and fills your context |
| "The fix was small, skip the re-review" | Unreviewed fixes are how regressions land |
| "One more round will converge" | Past two failures for one cause the problem is structural |

## Example ledger

```
# Ledger - plan: docs/recovery-plan.md
Task 1: complete (a1b2c3d..d4e5f6a, review clean, npm test: 41 passed)
Task 2: fix round 1 (2 addressed, 0 open: missing progress report, magic number 100)
Task 2: complete (d4e5f6a..b7c8d9e, review clean, recovery tests: 10 passed)
Task 3: minor (deferred): rename helper in src/index.ts
```
