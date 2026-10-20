---
name: receiving-code-review
description: Handle review feedback with technical rigor - verify each comment against the code before acting on it, ask about anything unclear, and push back with evidence when it is wrong. Use when review comments, a pull request review or reviewer findings arrive, before implementing any suggestion, and especially when feedback looks unclear or questionable. Not for writing a review.
license: MIT
---

# Receiving code review

A review comment is a claim to check, not an order to carry out. Check it against the code, decide, then act. Technical correctness matters more than social comfort, and neither blind agreement nor defensiveness gets you there.

## The sequence

1. **Read** all of the feedback before reacting to any of it.
2. **Understand.** Restate each item in your own words, or ask.
3. **Verify** it against the code as it is now. Confirm the file and line exist and match the claim. If the code changed since the review was written, check the finding against the current version, not the one the reviewer saw.
4. **Evaluate.** Is it right for this codebase, this stack, these requirements?
5. **Respond** with a plain technical answer or a reasoned objection.
6. **Implement** one item at a time and test each.

## Do not agree before you have verified

Do not open with agreement or praise ("You're absolutely right!", "Great point!") and do not announce you will implement something before checking it. That is performance, and it commits you to an answer you have not earned. Instead restate the requirement, ask a question, push back with a reason, or start working. Once you have checked and the reviewer is right, a short acknowledgment ("Fixed: the retry now stops at three") is fine. The change itself shows you heard.

## When something is unclear

Stop. Do not implement anything yet, because items are often related and a partial understanding gives a wrong implementation. You may continue with items that are independently clear and verified, but ask about the unclear ones before touching them.

```
Reviewer: "Fix items 1 to 6."
You understand 1, 2, 3 and 6, but not 4 and 5.

Wrong: implement 1, 2, 3 and 6 now, and ask about 4 and 5 later.
Right: "I understand 1, 2, 3 and 6. I need clarification on 4 and 5 before I change anything."
```

## Where the feedback came from

**The person you work for.** Trusted on intent, priorities and approved scope. Implement once you understand it, and ask if the scope is unclear. Technical claims still get verified against the code.

**An automated reviewer.** Its severity labels are its first guess at priority. Verify the impact before acting on them.

**An outside reviewer.** Before implementing, check that the suggestion:

1. is correct for this codebase,
2. does not break existing behavior,
3. does not remove something that exists for a reason,
4. works on every platform and version you support, and
5. comes from a reviewer who has the full context.

If it seems wrong, push back with the reason. If you cannot verify it, say so: "I can't verify this without X. Should I investigate, ask, or proceed?" If it conflicts with an earlier decision by the person you work for, stop and discuss it with them first.

## The "do it properly" check

When a reviewer asks you to build something out fully, search the codebase for real use of it first. If nothing uses it, ask whether to remove it instead ("Nothing calls this endpoint. Remove it, or is there usage I'm missing?"). If it is used, build it properly. Do not add features no one needs.

## Deciding what to do with each item

Sort every finding, and record the reason:

| Decision | When |
|---|---|
| **Accept** | Verified, in scope, and it improves the work |
| **Reject** | Factually wrong, out of scope, or conflicts with a requirement or an approved decision |
| **Defer** | Valid, but belongs in separate work |

A short table of finding, decision, evidence checked, and next step makes this easy to review. If accepting an item changes scope or risk, stop and re-plan before continuing.

## Order of work

1. Settle anything unclear first.
2. Fix blocking problems (breakage, security), then simple fixes (typos, imports), then complex ones (refactors, logic).
3. Test each fix on its own and check for regressions. If a fix breaks a test, revert it and think again.

## When to push back

Push back when the suggestion breaks existing behavior, the reviewer lacks context, it adds unused scope, it is wrong for this stack, legacy or compatibility needs exist, or it conflicts with a settled design decision.

Use technical reasoning, not defensiveness. Ask specific questions. Point at working tests or code. If it is an architectural question, involve the person who owns the design. If a finding conflicts with a decision that was explicitly approved, escalate it rather than overriding it. If you are uncomfortable pushing back, say that, then state the concern you saw.

## If you pushed back and were wrong

State it plainly and move on: "I checked X and it does Y, so you were right. Fixing it." No long apology, no defending the earlier answer.

## Common mistakes

| Mistake | Fix |
|---|---|
| Agreeing before checking | State the requirement, or verify first |
| Implementing blindly | Check it against the code |
| Batching fixes without tests | One item at a time, testing each |
| Assuming the reviewer is right | Check whether the change breaks something |
| Avoiding a pushback you should make | Correctness outweighs comfort |
| Implementing only the clear items | Clarify all items first |
| Proceeding on something you cannot verify | Say so and ask |

## Examples

**Blind agreement (bad).**
Reviewer: "Remove the legacy code."
"You're absolutely right! Removing it now."

**Verification (good).**
Reviewer: "Remove the legacy code."
"Checked: the build target is 10.15 or later, and this API needs 13 or later, so the legacy path is still needed for compatibility. The current implementation also has the wrong bundle ID. Should I fix it or drop support for versions before 13?"

**Unused feature (good).**
Reviewer: "Add proper metrics tracking with a database, date filters and CSV export."
"I searched the codebase and nothing calls this endpoint. Remove it, or is there usage I'm missing?"

## Report at the end

State what you addressed, what you deferred and why, the commands you ran and what they showed, and any risks that remain. When replying to inline comments on GitHub, reply in the comment thread, not as a new top-level comment.
