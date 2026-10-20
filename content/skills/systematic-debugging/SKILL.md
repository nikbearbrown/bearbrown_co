---
name: systematic-debugging
description: Find the root cause of a bug before changing any code. Use whenever something is already broken or behaving unexpectedly - a failing or flaky test, crash, exception, stack trace, regression, build break, performance problem or integration failure - and especially when guessing at a fix is tempting. Not for writing new features or reviewing code that works.
license: MIT
---

# Systematic debugging

When something breaks, the fastest-feeling move is to edit the line where the error appears and run it again. That usually fixes where the problem shows up, not where it starts. The symptom goes quiet, the cause stays, and it comes back somewhere harder to see.

## The rule

```
NO FIX WITHOUT A ROOT CAUSE YOU CAN EXPLAIN
```

If you cannot say "this fails because X, and here is the evidence", you are not ready to propose a fix. Finish phase 1 first. A fix you cannot explain is a guess, and a guess adds a variable instead of removing the broken one.

The process matters most when it feels least affordable:

- **Under time pressure.** A wrong guess extends the outage and you still have to debug afterward.
- **When one quick fix looks obvious.** The obvious fix is often the symptom. Two minutes confirming the cause costs less than two minutes patching.
- **After a fix did not work.** A failed fix is data, not a reason to stack a second guess on it.
- **When you do not fully understand the problem.** "I don't understand X yet" is the right state to be in before phase 1. Say it. Do not paper over it.

"It is a simple bug" is not an exception. Simple bugs have causes too, and the process is quick when the bug really is simple.

## Four phases

Finish each one before starting the next.

### Phase 1: find the cause

Do this before touching any code.

1. **Read the error properly.** The whole message and stack trace, line numbers, file paths, error codes. Errors often name the cause outright.
2. **Reproduce it on demand.** What are the exact steps? Does it happen every time? If you cannot reproduce it, you cannot confirm a fix later, so gather more data instead of guessing.
3. **Check what changed.** Recent commits and diffs, new dependencies, config or environment differences. "It worked before" means something changed. Find it.
4. **Instrument the boundaries of a multi-part system.** For a chain such as CI, build, sign, or request, service, database, do not guess which part is at fault. At each boundary log what goes in and what comes out, and check that config and environment values arrived intact. Run it once and let the output show where it breaks. Then investigate that part.
5. **Trace the bad value backward.** When the error is deep in a call stack, ask where the bad value came from and what called this code with it. Keep going up until you reach the origin, and fix it there, not where it blew up. If you cannot trace it by reading, add a temporary log or a stack trace at the point where the bad value first appears.

Phase 1 is done when you can state what is failing and why, with evidence.

### Phase 2: compare with what works

1. **Find a working example** of something similar in the same codebase.
2. **Read the reference completely** if you are following a pattern. Do not skim and do not adapt from memory.
3. **List every difference** between working and broken, however small. Do not decide "that cannot matter".
4. **Understand the dependencies:** what settings, config, environment and assumptions does the code need?

### Phase 3: one hypothesis at a time

1. **State it.** "I think X is the cause because Y." Write it down. Be specific.
2. **Test it with the smallest change** that could prove it wrong. One variable at a time. Never fix several things at once.
3. **Check the result.** It worked: go to phase 4. It did not: form a new hypothesis. Do not add more fixes on top of the failed one.
4. **If you do not know, say so** and research or ask. Do not pretend.

### Phase 4: fix the cause

1. **Write a failing test that reproduces the bug**, the simplest one you can. Use an automated test if the project has a framework, and a small script if it does not. The `test-driven-development` skill covers how. Have this before the fix.
2. **Make one fix** for the cause you found. No "while I'm here" cleanups and no bundled refactoring.
3. **Verify.** The test passes, nothing else broke, and the original problem is actually gone. Run the whole suite and check the original symptom directly.
4. **If the fix did not work, stop and count.** Fewer than three attempts: go back to phase 1 with what you just learned. Three or more: do not try a fourth. Question the design, below.

If you were handed this work by another agent or a person, report back as blocked with your evidence instead of trying a fourth fix yourself, so the one who owns the decision can make it.

## Three failed fixes means look at the design

Suspect the architecture when each fix reveals a new shared-state or coupling problem somewhere else, when fixes would need a large refactor, or when each fix creates new symptoms elsewhere. That is not a failed hypothesis. It is a design that keeps producing the bug. Stop patching, ask whether the pattern is sound or whether you are continuing out of inertia, and raise it with the user before another fix.

## Techniques for particular situations

**Bad data arriving from far away.** After you find the origin, also validate at the layers between the origin and the failure, so the same bad value is rejected early next time instead of travelling. Fixing it at the source and checking it along the way together make the bug structurally hard to repeat.

**Flaky or timing-dependent tests.** Do not guess at a delay. Wait for the actual condition: poll until the thing you need is true, with a timeout and a clear failure message. An arbitrary sleep hides the race instead of fixing it.

**One test breaks another.** The first test is leaving state behind. Bisect: run the suspect pair, then halve the set of tests that run before the failing one until the polluter is alone. Fix the state it leaks.

## Stop and go back to phase 1 if you catch yourself thinking

- "Quick fix for now, investigate later."
- "Let me just try changing X and see."
- "I'll make several changes and run the tests."
- "I'll skip the test and check it by hand."
- "It's probably X." Said from the symptom alone.
- "I do not fully understand it, but this might work."
- Listing fixes before you have traced the data.
- "One more attempt", after two failed ones.

Other people's questions are signals too. "Is that actually happening?" means you assumed without checking. "Will that show us where it breaks?" means gather evidence first. "Stop guessing" means you are proposing fixes without understanding. "Are we stuck?" means the current approach is not working, so change it instead of repeating it.

## Excuses you will hear yourself make

| Excuse | Reality |
|---|---|
| "It is simple, no process needed" | Simple bugs have causes, and the process is fast for them. |
| "It is an emergency" | Guessing and re-guessing is slower than finding the cause. |
| "Try this first, then investigate" | The first fix sets the pattern. Start the right way. |
| "I will write the test after the fix works" | Untested fixes do not stick. Writing the test first proves it. |
| "Several fixes at once saves time" | You cannot tell which one worked, and you add new bugs. |
| "The reference is long, I will adapt the pattern" | Partial understanding produces bugs. Read all of it. |
| "I can see the problem" | Seeing a symptom is not understanding the cause. |
| "One more attempt" | After two failures, question the design. |

## When the investigation finds no single cause

Sometimes a thorough investigation shows the problem really is environmental, timing-dependent or external. Then you have completed the process, and that is a legitimate result. Write down what you checked and ruled out, handle it properly (a retry, a timeout, a clear error message, waiting on the condition), and add logging so a recurrence leaves evidence. Be honest, though: most "there is no root cause" conclusions are really "I stopped investigating too early". Check that you traced the data flow before you reach for this.

## Quick reference

| Phase | What you do | Done when |
|---|---|---|
| 1. Find the cause | Read the error, reproduce, check changes, instrument boundaries, trace backward | You can say what fails and why, with evidence |
| 2. Compare | Find working examples, list every difference | You know what differs |
| 3. Hypothesize | One theory, smallest test | It is confirmed, or you have a new theory |
| 4. Fix | Failing test, one fix, verify | The bug is gone and the suite is green |
