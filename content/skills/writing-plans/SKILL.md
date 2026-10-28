---
name: writing-plans
description: Turn an agreed design or spec into an implementation plan that an engineer or agent with none of your context can follow without guessing - exact files, signatures, tests with expected results, verification commands, and the decisions only you can make. Use when there is a spec or settled requirements for a task with several steps and you are about to touch code, or when the user says "write a plan", "implementation plan", "break this into tasks" or "plan this out". Skip it for an obvious one-file change. Not for designing (use brainstorming), for carrying a plan out (use executing-plans), or for open-ended research.
license: MIT
---

# Writing plans

A plan records the decisions an implementer cannot make alone, so they can carry the work out without guessing, possibly in a fresh session that has none of your context. It is not the design, and it is not the program.

## When to write one

Write a plan for multi-step work whose design is settled. If the design still has open questions, go back to brainstorming first. For an obvious small change, such as one file with nothing to coordinate, just do the work. A ceremonial plan costs more than it saves. If the user asks for a plan anyway, write one.

## Before you write

1. Read the approved spec and the code it touches. Trace callers and interfaces before drawing task boundaries.
2. Check the repository's own instructions, the current branch, the existing tests, and any uncommitted changes. Uncommitted changes you did not make belong to the user, and the plan must not require discarding them.
3. Search for existing code that already does what a planned unit would do. Plan to reuse or extend it rather than duplicate it.
4. Check the scope. If the spec spans independent subsystems, write one plan per subsystem. Each plan should produce working, testable software on its own.

## Map the files first

Before any task, list the files to create or change and what each is responsible for. Give each file one clear responsibility. Files that change together live together. Split by responsibility, not by technical layer. In an existing codebase follow its layout, and propose a split only for a file you must change that has grown unmanageable.

## Cut the tasks

A task is the smallest unit that carries its own test cycle and is worth reviewing on its own. Fold setup, configuration, scaffolding and documentation into the task that needs them. Split only where a reviewer could reject one task and accept its neighbor. Every task ends in something that can be tested by itself. Tests come first inside each task. There is no separate testing phase at the end.

## Header

Start the plan with:

- the goal in one sentence, and the architecture in a few
- the key technologies
- the path to the spec the plan implements, so the executor can read both
- **Global constraints**: the spec's project-wide requirements, one line each, with exact values copied from the spec (version floors, dependency limits, naming and copy rules, platform needs). Every task implicitly includes these.
- non-goals

## Task format

```
### Task N: <name>

Files: Create <path> / Modify <path> / Test <path>
Consumes: what this task uses from earlier tasks - exact names and signatures
Produces: what later tasks rely on - exact names, parameter and return types
Acceptance: observable outcomes, for example Given / When / Then

- [ ] Step 1: write the test <name> asserting <values from the spec>
- [ ] Step 2: run <exact command>; expect it to fail with <message>
- [ ] Step 3: implement <signature> in <file>
- [ ] Step 4: run <exact command>; expect <passing output>
- [ ] Step 5: commit (only if the user's workflow commits per task)
```

Consumes and Produces matter because an implementer may see only their own task. This block is how they learn the names and types the neighboring tasks use.

## What a step contains

The test for a step: the implementer can write exactly one reasonable thing from it. That is the whole requirement. It means unambiguous, not exhaustive.

- **A test step** gives the test's name and its assertions as code, with the spec's exact values in them.
- **A code step** gives the file, the exact signature (name, parameters, return type) and any values the spec pins. A function body appears only when the signature and tests do not determine the algorithm, or when the spec fixes exact text.
- **A verification step** gives the command and the output that means it passed.
- **A reference to another task** points to that task's Consumes and Produces. It does not repeat that task's code.

A plan can fail in two opposite ways. A gap is a line that decides nothing: "TBD", "handle edge cases", "add appropriate validation", "write tests for the above", "similar to task 3", or a type or function that no task defines. A transcript is a plan that contains the program, which goes stale the moment the real code differs.

People differ on how much code a plan should hold. One school puts full code in every step so a novice cannot go wrong. Another holds that a plan longer than the code it describes has written the code instead. This skill takes the second view, and neither has been measured. If the implementer is known to need full bodies, such as a weaker model or someone new to the stack, add them and say that you did.

## Review focus

After the tasks, list the inputs and failure modes that the spec implies, that no task's tests exercise, and that are most likely to hurt a real user: empty input, duplicates, an unexpected format, a missing permission. A spec says what the software must do, not everything it will meet, and its silence on an input is not permission for that input to break the program. Write one line each, naming the condition and the behavior a reasonable person would expect, most likely first. Then add the test that pins each line to the task that owns the code. An empty list means you checked and found none.

## Self-review before handing over

Read the finished plan once against the spec.

1. **Coverage.** Can you point to a task for every requirement? Add the missing ones.
2. **Step scan.** Each step lets the implementer write exactly one reasonable thing. Fix gaps, and fix transcripts.
3. **Names.** Types, functions, files and properties used in later tasks match their first definition. A function called `clearLayers` in task 3 and `clearFullLayers` in task 7 is a bug.
4. **Order.** No task needs something that a later task creates.
5. **Review focus.** Every line has a test in the task that owns it.
6. **Proportion.** A plan several times longer than its spec, or one that is mostly code blocks, is a transcript. Replace bodies with signatures, test names and assertions, and check each step is still unambiguous.
7. **Safety.** The plan never tells the implementer to delete, reset, force-push, deploy, publish or overwrite the user's uncommitted work unless the user asked for that. Mark any such step "needs the user's confirmation when reached".

Fix problems inline. If you find a requirement with no task, add the task.

## Save and hand off

Save the plan where the project keeps plans. If there is no convention, use `docs/plans/YYYY-MM-DD-<feature>.md`. Tell the user the path and ask them to read it. Do not commit it unless asked.

Offer the execution options. The plan can be carried out step by step in the current session (executing-plans), or independent tasks can go to separate workers with a review between each (see dispatching-parallel-agents for how to brief them). If the host has its own plan-approval step, that approval is the go-ahead, so do not ask again.

Keep the plan current. When execution changes it, update the file and note why, so a fresh session can resume from the checkboxes.
