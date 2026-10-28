---
name: executing-plans
description: Carry out a written implementation plan in the current session - question the plan before touching anything, work through the tasks in order, check each one against real command output, stop and ask when blocked or when the plan itself is wrong, and finish with a report of what was done and where it deviated. Use when the user hands over a plan or says "execute the plan", "implement this plan", "follow the plan" or "start building from the plan", or when a half-finished plan needs resuming. Not for writing or revising the plan (use writing-plans), for design questions (use brainstorming), or for work that has no plan.
license: MIT
---

# Executing plans

Follow the plan. Do not improve on it silently. Load it, question it, execute it task by task with evidence, and stop when it stops making sense.

## 1. Load the plan and challenge it

Before editing anything, read the whole plan and the spec it points to. Look for:

- an ordering error, where a task needs something a later task creates
- a check that cannot be run ("confirm it works") instead of a command with an expected result
- unstated environment assumptions: runtime versions, running services, credentials, test data
- steps that name a type, function or file that no task defines
- steps that destroy or send something: deleting, resetting, force-pushing, migrating shared data, deploying, publishing, spending, messaging other people

Raise concerns with the user before starting, each with a concrete fix. If there are none, say so in one line and go on.

```
The plan is workable. Two questions. Task 4's check says "confirm it works";
I suggest running the API tests and expecting all of them to pass. And no
runtime version is stated; I will use the one in the repository's config
unless you say otherwise.
```

## 2. Prepare the workspace

- Check the branch and the state of the working tree. Do not start on the default branch (main or master) without the user's explicit consent. Offer a new branch or a separate working copy.
- Uncommitted changes you did not make belong to the user. Never discard, stash, reset or overwrite them without asking. If they overlap files the plan touches, ask first.
- When resuming, compare the plan's checkboxes with the real state of the repository (what is committed, what the tests say) before continuing. If they disagree, tell the user. Do not reset files to match the plan.
- If the plan exists only in the conversation, save it to a file before the first change, so progress can be tracked and a fresh session can resume.
- Track progress in the plan's own checkboxes, or in whatever task tracker the host offers.

## 3. Run each task

For each task, in the plan's order:

1. Re-read the task, what it consumes and produces, and its acceptance criteria.
2. Do the steps as written. Keep edits inside the task.
3. Where the plan puts a test first, follow test-driven-development: see it fail for the right reason, then pass.
4. Run each verification and read the output. A task is done when the real output matches the expected result, not when the code looks right. Say what you ran and what it printed.
5. Commit only when the plan's step says to. The user's approval of the plan covers that.
6. Tick the box.

Do not stop between tasks to ask whether to continue, unless the user asked for checkpoints or the plan marks them. At a checkpoint, show what is done and the verification results, then wait. How often to pause is the user's call. A pause every few tasks is common, and no number is right for every plan.

## 4. When something goes wrong

Stop and ask, never guess, when a dependency is missing, an instruction is unclear or contradictory, the plan has a gap that blocks you, or a check keeps failing. When a check fails, work out which of three things is wrong.

| What is wrong | What to do |
|---|---|
| The implementation | Fix it and rerun. If the cause is not obvious, find the root cause first (systematic-debugging). |
| The test | Fix the test, and tell the user what was wrong with it and why. Never edit a test only to make it pass. |
| The plan | Stop. Report it with a proposed correction. Once the user agrees, update the plan with a short note of what changed and why. Never rewrite a requirement silently. |

After two failed attempts at the same step, stop and reassess instead of trying a third time. Two is a sensible default, not a measured limit, and the user can set another.

Never reconcile a confusing state by resetting files.

## 5. Risky steps

A step that deletes data, rewrites history, force-pushes, deploys, publishes, runs a migration on shared data, spends money or contacts other people needs the user's explicit yes at that moment, unless the user already approved that exact step. If such a step was interrupted partway, inspect the real state of the target before retrying. Do not replay it blindly.

## 6. Review as you go

After each task, or each checkpoint, read your own diff against the task: requirements met, nothing extra added, callers still work, error paths handled, the user's changes untouched. For larger or riskier work ask for an independent review (requesting-code-review), and treat what comes back with receiving-code-review.

## 7. Finish

- After the last change, run the plan's final verification and the whole test suite. Read the output. Report every failure by name, including ones you did not cause.
- Report in this shape:

```
Plan: <path>      Branch: <name>
Tasks: <done> of <total> complete

Verification: <command> -> <result>, one line per command
Deviations from the plan: <what, why, who approved it>, or "none"
Not done or open: <anything left, or "none">
```

- Offer the user the choices for the branch: merge it, open a pull request, keep it as it is, or discard it. Do what they choose. Never merge, push or discard on your own. Keep the plan file until the handoff is finished.
