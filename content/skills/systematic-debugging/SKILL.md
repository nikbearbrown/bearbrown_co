---
name: systematic-debugging
description: Find the root cause of a bug before changing any code. Use whenever something is already broken or behaving unexpectedly - a failing or flaky test, crash, exception, stack trace, regression, build break, performance problem or integration failure - when the user says "debug this", "why is this failing", "I can't reproduce it" or "it only fails sometimes", and especially when guessing at a fix is tempting. Covers building a repeatable reproduction, ranking causes by what they predict, one-change tests, and a regression test at the right seam. Not for writing new features or reviewing code that works.
license: MIT
---

# Systematic debugging

When something breaks, the fastest-feeling move is to edit the line where the error appears and run it again. That usually fixes where the problem shows up, not where it starts. The symptom goes quiet, the cause stays, and it comes back somewhere harder to see.

## The rule

```
NO FIX WITHOUT A ROOT CAUSE YOU CAN EXPLAIN
```

If you cannot say "this fails because X, and here is the evidence", you are not ready to propose a fix. Finish phase 1 first. A fix you cannot explain is a guess, and a guess adds a variable instead of removing the broken one.

The process matters most when it feels least affordable: under time pressure, when one quick fix looks obvious, after a fix did not work, and when you do not fully understand the problem. "I don't understand X yet" is the right state to be in before phase 1. Say it. "It is a simple bug" is not an exception, because simple bugs have causes too and the process is quick for them.

## Keep secrets out of what you show and log

Debugging reads configuration, environment values, requests and logs, and secrets live in all of them. Never print, log or paste a key, token, password, connection string or private key, in your own output or in a log line you add. Name the variable, not its value. When a repro needs credentials, have it read them from the environment. If the redacted output is not enough to diagnose the problem, say so and ask the user for another way in, rather than pasting the real value.

## Four phases

Finish each one before starting the next.

### Phase 1: find the cause

Do this before touching any code.

1. **Read the error properly.** The whole message and stack trace, line numbers, file paths, error codes. Errors often name the cause outright.
2. **Build a repeatable reproduction.** This is the step most debugging sessions get wrong. Get one command, one you have actually run, that fails on demand. A good one:
   - drives the real code path, not a look-alike,
   - fails with the user's exact symptom, not merely "it errors", so you can later prove the fix removed that failure and not a nearby one,
   - gives the same verdict every run, and runs fast and without a person at the keyboard.

   Pick the cheapest honest form: a failing test at the right seam, a scripted request, the command-line tool run against a saved input, a replayed trace or log, a small harness around the suspect code, or a script that shows a person one instruction at a time and records what they see, which they run in their own terminal and paste back. If it only fails sometimes, raise the rate rather than chase a clean repro: loop the trigger, run it in parallel, add load, narrow the timing window. Pin what you can: seed randomness, fix the clock, isolate files and network.

   Then **shrink it.** Remove inputs, callers, configuration and data one at a time, running it after each cut, until everything left is needed to fail. The smallest failing case is the best regression test and often names the cause.

   If you cannot build a repeatable reproduction, stop. Do not theorise. List what you tried and ask the user for what would help: an environment where it fails, a redacted artifact (a log, a request capture, a dump, a timestamped recording), or permission to add temporary instrumentation.
3. **Check what changed.** Recent commits and diffs, new dependencies, config or environment differences. "It worked before" means something changed. When you know a good state and a bad one (a commit, a data set, a version), bisect between them: automate "set up at state X, run the repro, record pass or fail" so a bisect tool can drive it, or run old and new side by side and compare their output.
4. **Instrument the boundaries of a multi-part system.** For a chain such as CI, build, sign, or request, service, database, do not guess which part is at fault. At each boundary log what goes in and what comes out (redacted, see above), and check that config and environment values arrived intact. Run it once and let the output show where it breaks. Then investigate that part.
   - Prefer a debugger or an interactive session over logs. Add targeted logs only where they separate your candidate causes. Never log everything and search it.
   - Give every debug line you add one unique prefix, so removing them is one search.
   - Line up timestamps before blaming a log line: an error outside the failing step's time window is context, not the cause.
   - If you change anything temporarily to gather evidence (a log level, a flag, an environment variable), write down its original value first and restore exactly that, not a default. Ask before touching shared or production systems.
5. **Trace the bad value backward.** When the error is deep in a call stack, ask where the bad value came from and what called this code with it. Keep going up until you reach the origin, and fix it there, not where it blew up. If you cannot trace it by reading, add a temporary log or a stack trace at the point where the bad value first appears.
6. **For a slow or resource-hungry bug, measure first.** Logs are usually the wrong tool. Take a baseline with a timing harness, profiler or query plan, then bisect on that measurement. Measure first, fix second.

Phase 1 is done when you can state what is failing and why, with evidence.

### Phase 2: compare with what works

1. **Find a working example** of something similar in the same codebase.
2. **Read the reference completely** if you are following a pattern. Do not skim and do not adapt from memory.
3. **List every difference** between working and broken, however small. Do not decide "that cannot matter".
4. **Understand the dependencies:** what settings, config, environment and assumptions does the code need?

### Phase 3: rank causes, then test one

1. **List the candidate causes and rank them.** For each, write what it predicts: "if X is the cause, changing Y removes the bug and changing Z makes it worse." A cause with no prediction is a hunch. Show the ranked list to the user if they are around. They often know what changed or what is already ruled out. If they are away, go with your own ranking.
2. **Test the top one with the smallest change** that could prove it wrong. One variable at a time. Never fix several things at once.
3. **Check the result.** It worked: go to phase 4. It did not: strike that cause and move to the next. Do not add more fixes on top of the failed one.
4. **If you do not know, say so** and research or ask. Do not pretend.

### Phase 4: fix the cause

1. **Write a failing test that reproduces the bug**, at a seam where it fails the way it fails in real use. A test on a shallow seam (one caller, when the bug needs several) passes for the wrong reason and gives false confidence. If no seam reproduces it correctly, that is a finding about the design, so report it. Your minimised repro from phase 1 is usually the starting point. The `test-driven-development` skill covers the cycle. Have the test before the fix.
2. **List every caller of the defective code** before fixing, and fix where they meet, so sibling callers are not left broken. Do not stop at the path the report names. Keep the fix in the narrowest layer responsible, and leave unrelated behavior and the user's in-progress edits alone.
3. **Make one fix** for the cause you found. No "while I'm here" cleanups and no bundled refactoring.
4. **Verify.** The test passes, nothing else broke, and the original problem is gone. Run the original, un-shrunk reproduction and the whole suite, and check the exact symptom you recorded.
5. **If the fix did not work, stop and count.** Fewer than three attempts: go back to phase 1 with what you just learned. Three or more: do not try a fourth. Question the design, below.
6. **Finish cleanly.** Remove the debug lines and throwaway harnesses you added, only those, and restore anything you changed temporarily. State the confirmed cause in the commit or pull request message. After the fix lands, ask what would have prevented the bug (a test, a type, a check at a boundary) and recommend it. Do not start it unasked.

If you were handed this work by another agent or a person, report back as blocked with your evidence instead of trying a fourth fix yourself, so the one who owns the decision can make it.

## Three failed fixes means look at the design

Suspect the architecture when each fix reveals a new shared-state or coupling problem somewhere else, when fixes would need a large refactor, or when each fix creates new symptoms elsewhere. That is not a failed hypothesis. It is a design that keeps producing the bug. Stop patching, ask whether the pattern is sound or whether you are continuing out of inertia, and raise it with the user before another fix.

## Techniques for particular situations

**Bad data arriving from far away.** After you find the origin, also validate at the layers between the origin and the failure, so the same bad value is rejected early next time instead of travelling.

**Flaky or timing-dependent tests.** Do not guess at a delay. Wait for the actual condition: poll until the thing you need is true, with a timeout and a clear failure message. An arbitrary sleep hides the race instead of fixing it.

**One test breaks another.** The first test is leaving state behind. Bisect: run the suspect pair, then halve the set of tests that run before the failing one until the polluter is alone. Fix the state it leaks.

## When you cannot finish

Two honest endings exist, and either is better than a guess.

- **Inconclusive.** Every safe observation you could make failed to separate the candidate causes. Say which observations you made, what is still missing, and what would resume the work.
- **Blocked.** The only way to reproduce it would be unsafe, destructive, or possible only in production. Do not force it. Write down the missing evidence and what you need to proceed.

If a symptom you thought was fixed returns, run one observation that could disprove the earlier diagnosis before accepting it again. If the user asks only why something happens, stop after the cause, its evidence, and where it is safe to fix it, and do not edit code.

Sometimes a thorough investigation shows the problem really is environmental, timing-dependent or external. Then you have completed the process, and that is a legitimate result. Write down what you checked and ruled out, handle it properly (a retry, a timeout, a clear error message, waiting on the condition), and add logging so a recurrence leaves evidence. Be honest, though: most "there is no root cause" conclusions are really "I stopped investigating too early". Check that you traced the data flow before you reach for this.

## Stop and go back to phase 1 if you catch yourself thinking

- "Quick fix for now, investigate later."
- "Let me just try changing X and see."
- "I'll make several changes and run the tests."
- "I'll skip the test and check it by hand."
- "It's probably X." Said from the symptom alone.
- "I do not fully understand it, but this might work."
- "I'll theorise about it, since I can't reproduce it." A theory is not a cause.
- Listing fixes before you have traced the data.
- "One more attempt", after two failed ones.

Other people's questions are signals too. "Is that actually happening?" means you assumed without checking. "Will that show us where it breaks?" means gather evidence first. "Stop guessing" means you are proposing fixes without understanding. "Are we stuck?" means the current approach is not working, so change it instead of repeating it.

## Quick reference

| Phase | What you do | Done when |
|---|---|---|
| 1. Find the cause | Read the error, build and shrink a repro, check changes, instrument boundaries, trace backward | You can say what fails and why, with evidence |
| 2. Compare | Find working examples, list every difference | You know what differs |
| 3. Rank and test | Rank causes by prediction, test one with the smallest change | It is confirmed, or you move to the next |
| 4. Fix | Failing test at the right seam, list callers, one fix, verify, clean up | The bug is gone, the suite is green, and your debug traces are removed |
