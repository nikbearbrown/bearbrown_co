---
name: dispatching-parallel-agents
description: Split two or more truly independent problems across parallel agents or workers, one focused brief each, then integrate and verify the combined result. Use when several failures, files or subsystems have separate causes and no shared state, and the user wants them worked concurrently. Not for related failures, exploration, diagnosis of one unknown problem, or tasks that edit the same files.
license: MIT
---

# Dispatching parallel agents

Several unrelated problems (different test files, different subsystems, different bugs) wait in line if one worker takes them in turn. If they really are independent, give each its own worker and run them at the same time. Each worker gets a brief you wrote for it, never your session's history, so it stays focused and you keep your own context for coordinating.

**The principle:** one worker per independent problem, and parallel only when nothing is shared.

## Decide first

Go parallel only if **all** of these hold:

- The problems have **separate causes**. Fixing one would not fix another.
- The tasks **do not edit the same files**, generated artifacts, shared config, lockfiles, schemas, APIs or test fixtures.
- Each task can be understood and tested **without another worker's uncommitted state**.
- You know how the results will be combined and how a conflict would be resolved.

If any of these is uncertain, do not parallelize. Use one worker, or do it yourself in sequence.

**Do not use this for:**

- **Related failures**, where one fix might clear several. Investigate them together first.
- **Exploration or diagnosis** when you do not yet know what is broken.
- **Needing the whole system in your head** to understand the problem.
- **Shared resources**: the same files, ports, databases or hardware.
- **Content relay**: fetching raw material (file contents, web pages, API responses) to bring back. A worker's reply is a compressed summary and the raw content is lost. Fetch it yourself.
- **Review, planning, a second opinion or judgment calls.** Those stay with you.

A worker should not start workers of its own.

## The procedure

**1. Split the work into independent domains.** Group failures by what is broken:

- tool approval flow: tests in file A
- batch completion: tests in file B
- abort handling: tests in file C

**2. Write one brief per domain.** Each brief contains:

- the **exact scope** (one file, one subsystem),
- the **goal and acceptance check** (what "done" means, and how to prove it),
- the **constraints** (what must not be touched),
- the **context it needs**: the error messages, the names of the failing tests, and the interfaces that are already settled,
- the **output you want back**: a summary of the cause found and the changes made, plus where the full report goes.

A brief that is too broad ("fix all the tests") loses the worker. One with no context ("fix the race condition") sends it searching. One with no constraints invites a refactor. One with no output format leaves you unable to tell what changed.

**3. Dispatch them together.** Start all the workers in the same step so they run concurrently. Staggering the starts across several steps delays the later ones and defeats the point. Tell each worker it is a focused worker with one job, so it does not pull in other tools or workflows.

**4. Collect, then integrate.** When the workers return:

1. Read every summary **and the actual diff**. A report is evidence, not approval.
2. Check for overlap: did two workers touch the same code or the same assumptions?
3. Resolve any conflict yourself.
4. Run the **full** test suite plus any cross-domain checks. Do not call the work complete until the combined result passes.
5. Spot check. Workers can make the same systematic mistake in parallel.

If a worker's fix is wrong, send the specific correction back to that same worker when you can. If two attempts fail for the same cause, stop retrying, and change the plan or fix it yourself.

## Example brief

```markdown
Fix the 3 failing tests in src/agents/agent-tool-abort.test.ts:

1. "should abort tool with partial output capture" expects 'interrupted at' in the message
2. "should handle mixed completed and aborted tools": a fast tool was aborted instead of completing
3. "should properly track pendingToolCount" expects 3 results but gets 0

These look like timing or race issues. Your task:

1. Read the test file and understand what each test verifies.
2. Find the root cause. Is it a timing problem or a real bug?
3. Fix it: replace arbitrary timeouts with waiting on the real event, and fix any bug you find in the abort code.
4. Do not simply raise a timeout. Do not change files outside this test file and the abort implementation it exercises.

You are a focused worker with one job. Return a summary of the root cause and what you changed.
```

## Worked case

Six failures across three files after a large refactor: three in the abort tests (timing), two in batch completion (tools not executing), one in approval race conditions (an execution count of zero). The three areas share no state, so each went to its own worker. One replaced timeouts with event-based waiting. One fixed a bug where an identifier was set in the wrong place. One added a wait for an asynchronous tool to finish. The changes did not overlap, and the full suite passed after integration.

## Boundary checklist before dispatching

- Files and generated artifacts are disjoint.
- No worker changes a shared config, lockfile, schema, API or fixture.
- Each worker can test its result alone.
- You know the integration order and how to resolve a merge conflict.
- Anything with outside effects (permissions, hardware, deployment) stays with you and with the user's own authorization.

## Risks

- **False independence.** Two problems that looked separate share a cause or a file. A boundary check and a full-suite run catch it.
- **Merge conflicts** across shared files.
- **Inconsistent fixes** that each work but disagree with each other.

When the risk is high, fall back to sequential work.
