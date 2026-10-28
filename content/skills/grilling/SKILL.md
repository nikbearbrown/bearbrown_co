---
name: grilling
description: Interview the user relentlessly about a plan, design, decision or idea until every branch of the decision tree is resolved and nothing is silently assumed, before anything is built. Each decision is put to the user with a recommended answer; facts are looked up, never asked. Use when the user says "grill me", "stress-test this plan", "poke holes in this", "what am I missing", "challenge my design" or "interview me about this", or hands over a request too vague to start on. Also covers grilling a plan against a project's glossary and decision records ("grill with docs"). Not for reviewing code, not for turning an agreed plan into a document, and not for one quick clarifying question on an otherwise clear task.
license: MIT
---

# Grilling

A plan is only as good as the questions nobody asked. Grilling is a deliberate, heavier-than-usual interview that walks every decision in a plan until you and the user understand the same thing, and nothing important is left assumed. The aim is a plan someone with no context could carry out without coming back with questions.

Start when the user asks for it. If a request is plainly too vague to act on, offer it once in a sentence; do not impose a long interview unasked. If a grilling is already running, continue it rather than starting again.

## The two rules

**Facts are yours; decisions are the user's.**

- A fact is anything the environment can tell you: what the code does, what a config says, what the docs or history show, how a tool behaves, whether the thing the plan proposes already exists in the project or publicly (which can change the decision). Look it up. Do not spend the user's attention on it. If the lookup is slow, hand it to a helper if you have one, and keep asking about everything that does not depend on the result.
- A decision is intent, priority, constraint, taste, risk appetite, or something that exists outside this machine. Put each one to the user and wait for the answer. Do not answer it yourself and move on.

**Do not act on the plan until the user confirms the shared understanding.** That confirmation covers the design only. It is not permission for an irreversible step; those still need their own yes.

## The tree and the order of questions

Treat the plan as a tree: each decision branches into the decisions that hang off it. Ask only questions whose prerequisites are already settled. A question whose answer depends on one still open waits for a later turn.

Versions of this method differ on pacing: some ask one question at a time, others put every currently askable question in one numbered round. Both are defensible. A workable default:

- Ask one question per turn when the decisions are weighty or tangled, and wait for the answer.
- When several questions are independent and small, put a few together, numbered, and wait for all the answers. A question that could have been in the last round but was held back is a dribble; fold it in.
- Never ask a wall of questions. It gets one answer and a closed laptop.

## Every question

1. **Check that it is a real fork.** Name the two plans the answer chooses between. If the plan comes out the same either way, do not ask. Pick a default, record it, and move on. Do not spend questions on naming and cosmetics.
2. **Say why it matters,** in a clause: what changes depending on the answer.
3. **Give your recommended answer** and a one-line reason, so that "yes" is a complete reply. Make the recommendation a real position. When what you found contradicts the user's approach, lead with the evidence and recommend the correction.
4. **Make vague words concrete.** "Fast", "simple", "secure" and "soon" get a number or an observable inside your recommendation: "fast enough means search returns in under two seconds. Right number?"

A host's pick-list tool is fine for asking if it has one. Otherwise plain text:

```
Q3 - Retry policy: should failed uploads retry on their own, or stop and ask?
     Why it matters: automatic retries need an idempotent endpoint.
     Recommended: retry up to three times, then stop and ask. The endpoint
     already deduplicates by upload id (I checked the handler).
```

## Keep track of what you know

Say where each fact came from: the user said it, you checked it in a named place (a file, a command, a document they gave you), or you are assuming it, with what changes if the assumption is wrong. Training memory and "the docs say" without a read are assumptions. When the user states something a source contradicts, show both and let them choose. Do not quietly comply and do not quietly override.

## What to probe

Plans usually break in one of these places:

- **Goal.** Where would two reasonable people build different things? What does "done" look like, concretely?
- **Acceptance.** Can someone check that it is done, or is it an aspiration?
- **Boundaries.** What is tempting to touch that should stay untouched? What is explicitly out of scope?
- **Alternatives.** What was ruled out, and why? What was not considered?
- **Assumptions.** Which load-bearing ones are guesses?
- **Contradictions.** Do the goal, the data, the method, the time and the money agree with each other?
- **Landmines.** Irreversible actions on real data, other systems or scripts that depend on what will change, differences between this environment and the target, credentials or approvals that do not exist yet, interfaces that must not move, scale far beyond the test data, regulated or personal data, and code that looks odd but is deliberate. Also check whether the named means serves the real end.

Invent concrete scenarios that probe edge cases, and make the user be precise about the boundary.

**Danger rule.** Any destructive or irreversible step gets its own confirmation question that names the irreversibility, and the plan gets a backup, dry run or rollback step.

## Guard against agreeing too easily

Once scope and shape stop moving, spend one question inviting the user to prove you wrong: state the two or three riskiest assumptions, then aim at the one that would hurt most. "The claim most likely to sink this plan is X. Does it hold?" A confirmed landmine must visibly change the plan, and you follow it all the way down, not patch it with a sentence. Repeat the checkpoint after any answer that makes you rebuild the plan.

## Handling answers

- **"You decide", or a bare "yes" to a batch.** Take your recommended answers and mark them as your choices, so the user can see which decisions were theirs and which were delegated.
- **They reject your recommendation.** Accept it. Do not argue it again unless new evidence appears.
- **An answer conflicts with an earlier one.** Show the smallest conflict and ask which stands.
- **They ask you something.** Answer plainly first, then continue.
- **They end the session.** Stop at once and list what is unresolved. Do not invent answers to close it.

## Knowing when to stop

You are done when no open fork remains whose wrong answer would be expensive and every assumption you rely on has been stated and confirmed or corrected. Stop asking when the next question would cost more to ask than the mistake would cost to fix; default and record everything still open. Two answers in a row that do not shrink the open set mean churn: checkpoint or close.

Close by playing it back: the decisions with the reason for each, the defaults you chose for the user, and what is still open. Ask whether that matches their understanding. Write it to a file only if they want one.

## When the project keeps a glossary or decision records

If the repository has a glossary file or decision records (for example `CONTEXT.md` and `docs/adr/`), also:

- **Challenge terms against the glossary.** "Your glossary defines cancellation as X, but you seem to mean Y. Which is it?"
- **Sharpen fuzzy words.** When a term is overloaded, propose one canonical word. "Account" might mean the customer or the user.
- **Cross-check against the code.** If the user says how something works and the code disagrees, say so and ask which is right.
- **Record as you go,** with the user's agreement, instead of at the end. A resolved term goes in the glossary, which holds terms and nothing about implementation. Create these files only when there is something to put in them.
- **Offer a decision record sparingly,** only when the choice is hard to reverse, would surprise a future reader, and came from a real trade-off with real alternatives.

## Common mistakes

| Mistake | Fix |
|---|---|
| Asking what the code could tell you | Look it up |
| Asking a question whose answer changes nothing | Default it and record it |
| Questions with no recommendation | Always recommend, with the reason |
| Stacking questions that depend on each other | Ask the prerequisite first |
| Letting "yes" settle everything silently | Mark which answers were delegated to you |
| Treating plan approval as permission to do anything | Irreversible steps still need their own yes |
| Interviewing past the point of use | Stop when the next fork costs less to fix than to ask |
