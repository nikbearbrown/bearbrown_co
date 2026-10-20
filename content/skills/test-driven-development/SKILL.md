---
name: test-driven-development
description: Drive a feature, bug fix, refactor or behavior change with strict red-green-refactor - write one failing test, watch it fail for the right reason, write the least code that passes, then clean up while green. Use before writing any implementation code, when fixing a bug, or when the user says "TDD", "test first" or "red-green-refactor", or asks why a passing test proves nothing.
license: MIT
---

# Test-driven development

Write the test first. Watch it fail. Write the least code that makes it pass. Clean up while it stays green.

**Why the failure matters.** A test you never saw fail is a test you never saw work. It may assert nothing, call the wrong function, sit in a file the runner skips, or pass because of a typo. Watching it go red is the only evidence that it can detect the absence of the thing you are about to build, and detecting absence is the whole job.

## The rule

```
NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST
```

Wrote code before the test? Set it aside and start from the test. Do not keep it open as a reference, adapt it while writing the test, or glance at it to remember its shape. Code written first fixes the shape you already imagined, and the test then gets written to fit it. That is how a suite ends up asserting what the code does instead of what the feature needs. The rewrite is short, because you still remember the problem. What you lose is only the bias.

Delete only code you wrote yourself in this session. Never delete, reset or overwrite the user's own work to recreate the right order. If their implementation already exists, add the missing test and show it failing against the original behavior in an isolated copy or a change you can reverse, and restore their code afterwards. If you cannot show a red, say so plainly: "no test-first evidence for this change". Do not claim it.

**Applies to:** new features, bug fixes, refactors, any change in behavior.
**Ask the user before skipping for:** throwaway prototypes, generated code, pure configuration.

Never skip silently. "Just this once", "the test is obvious", "I'll add tests right after" and "it is too small to test" are the thoughts this rule exists to catch. The last one is how most untested code enters a repository.

## The cycle

### 1. Red: one failing test

Write one test for one behavior. Name it so the failure output alone says what broke: `retries a failed operation three times`, not `retry works`. If the name needs "and", split it.

Test real code. A test built on mocks proves that your mocks were called, which is a fact about the test and not about the system. Mock only what you genuinely cannot run: the network, a paid API, the clock. Never mock code you own and could simply call.

Before you write it, say which change to production code would make this test fail. If you cannot name one, the test is not ready.

Good: calls the real function, one behavior, the name states it.

```typescript
test('retries a failed operation three times', async () => {
  let attempts = 0;
  const operation = () => {
    attempts++;
    if (attempts < 3) throw new Error('fail');
    return 'success';
  };

  const result = await retryOperation(operation);

  expect(result).toBe('success');
  expect(attempts).toBe(3);
});
```

Bad: vague name, and it checks the mock rather than the behavior.

```typescript
test('retry works', async () => {
  const mock = jest.fn()
    .mockRejectedValueOnce(new Error())
    .mockRejectedValueOnce(new Error())
    .mockResolvedValueOnce('success');
  await retryOperation(mock);
  expect(mock).toHaveBeenCalledTimes(3);
});
```

### 2. Verify red: run it and read the output

Mandatory. Run the test, then ask: **did it fail for the right reason?**

- Right: an assertion fails, or the function you are about to write is not defined.
- Wrong: a typo, an unresolved import, a missing fixture, a syntax error. These tell you nothing about the feature. Fix the test and run it again. You are not at red yet.
- The test passes: it is testing behavior that already exists. Fix the test.

Make one change and run the test, so the failure message always has one cause. If you made two changes before running, you no longer know which one it is reacting to.

### 3. Green: the least code that passes

Write the smallest code that turns the test green. Not the general version, not the configurable version, not the version that handles what the next test will cover. Minimal keeps every line traceable to a test that demanded it.

Good: just enough to pass.

```typescript
async function retryOperation<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < 3; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 2) throw e;
    }
  }
  throw new Error('unreachable');
}
```

Bad: options nobody asked for.

```typescript
async function retryOperation<T>(
  fn: () => Promise<T>,
  options?: { maxRetries?: number; backoff?: 'linear' | 'exponential'; onRetry?: (attempt: number) => void }
): Promise<T> { /* speculative */ }
```

Then run the **whole** suite, not just the new test. A local green with regressions elsewhere is a red. The output should be clean: no errors, no warnings.

If the test fails, fix the code, not the test. The one exception is a test that is itself wrong. Go back to red, say why it was wrong, and rewrite it. Never edit a test only to make it pass.

### 4. Check the green is real (the revert check)

For any test you did not watch go red, or when a green arrives suspiciously early:

1. Revert the implementation. The test must go red.
2. Restore it. The test must go green.

A test that stays green with the implementation removed is testing nothing.

### 5. Refactor: only while green

Remove duplication, improve names, extract helpers. Run the tests after each change. If they go red, the refactor changed behavior: revert and take smaller steps. Do not add behavior and do not mix a behavior fix into a refactor. Do them as separate passes.

### 6. Repeat

Take the next behavior to a new failing test. Do not write a second test until the first has finished its full cycle.

## When a failing test is the wrong tool

A failing test drives changed behavior. Two other cases need a different proof, and inventing a failure for them is theater.

- **A refactor that must not change behavior.** Establish passing coverage of the current behavior first (characterization tests if none exist), refactor, and keep it green. Do not manufacture a red.
- **Docs, formatting, and config that does not affect behavior.** Use the check that fits: a diff, a parser or schema validation, a render, a link check. A config change that does affect runtime behavior still needs a behavioral check.

Say which case you are in before you start.

## Bug fixes start with the test

A bug fix begins with a test that reproduces the bug and fails because the bug exists. That one test is the proof the bug was real, the proof the fix works, and the guard against it coming back. Fixing first and adding the test afterwards forfeits all three, because you never saw the test fail and so never confirmed it can detect the bug. When the cause is unknown, find it first (see `systematic-debugging`), then take over here once you can make it fail on demand.

## Working from the outside in

For a feature with several layers, start with one high-level test that describes the behavior as the user sees it, and let each failure choose your next move. When a failure points to a layer that has behavior of its own (an endpoint, a function, a query), drop down and write a failing test at that layer before building it. Drive that test through the cycle. When it goes green, go back up and rerun the test above it. Stop when the top-level test is green and nothing is left waiting.

Things with no behavior of their own, such as a route line, an empty class that clears a "not defined" error, or trivial markup, need no test of their own. Add them only because a failing test one layer up demanded them. When in doubt, write the test.

## Excuses you will hear yourself make

| Excuse | Reality |
|---|---|
| "Too simple to test" | Simple code breaks, and the test takes thirty seconds. |
| "I'll test after" | A test written after passes immediately, which proves nothing. You never saw it catch anything. |
| "Tests after achieve the same goal" | Tests-after answer "what does this do?". Tests-first answer "what should this do?". After the fact you check the cases you remembered, not the ones you would have found. |
| "I already tested it by hand" | Manual testing leaves no record, cannot be rerun, and skips cases under pressure. "It worked when I tried it" is not coverage. |
| "Deleting hours of work is wasteful" | That time is spent either way. The real choice is rewriting with confidence or keeping code you cannot trust. The waste is the second one. |
| "Keep it as reference" | You will adapt it, and that is testing after. |
| "I need to explore first" | Fine. Treat the exploration as a spike, throw it away, then start with a test. A spike is a sketch, never the shipped diff. |
| "The test is hard to write" | Hard to test means hard to use. Simplify the interface. |
| "TDD slows me down" | Finding bugs before the commit is faster than finding them in production. |
| "This is different because..." | It is not. |

## Stop and start over if you notice

- Code exists before its test, or a test was added "later".
- The test passed on the first run and you never saw it fail.
- You cannot say why the test failed.
- A test was edited to force a pass.
- You are keeping code-first work "as reference".
- You are arguing that this case is the exception.

Every one of these means the same thing: set the code-first work aside, return to red, and run the test to confirm it fails.

## When stuck

| Problem | What to try |
|---|---|
| Do not know how to test it | Write the API you wish existed, then write the assertion first. |
| The test is too complicated | The design is too complicated. Simplify the interface. |
| You have to mock everything | The code is too tightly coupled. Inject the dependency. |
| The setup is huge | Extract helpers. Still huge? Simplify the design. |

## Before you say it is done

Claim completion only with fresh evidence from this turn:

| Claim | What actually proves it |
|---|---|
| "The tests pass" | You ran the full suite after your last edit and read the count. |
| "The build is fine" | The build command exited 0. A clean linter is not a build. |
| "This is done" | The behavior was exercised, not only type-checked. |
| "The fix works" | A test that failed before the fix and passes after. |
| "Nothing else broke" | The full suite, not the file you touched. A task that names one test file limits what you deliver, not what you verify. |

Checklist:

- [ ] Every new function or method has a test.
- [ ] You watched each test fail before implementing, and each failed for the right reason.
- [ ] Each implementation is the minimum that passes.
- [ ] The full suite passes with clean output.
- [ ] Tests use real code, with mocks only where unavoidable.
- [ ] Edge cases and error paths are covered.

Report every failure the full run shows, including ones you did not cause, by name. A red test you watched scroll past and did not mention makes your report false by omission. Cannot tick every box? You skipped a step. Go back to it.

## Delegated work

If you hand implementation to another agent or tool, the rule binds it too. An implementer that returns code without a test it watched fail has not finished, and its claim is unverified until you run the suite yourself.
