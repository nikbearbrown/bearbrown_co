---
name: prototype
description: Build a throwaway prototype that answers one design question before the real build - whether a state model or piece of logic holds up on awkward cases, what a screen could look like, or whether a library, API or approach behaves the way you need. Use when the user says "prototype this", "spike it", "mock it up", "let me try it before we build it", "does this state model hold up", "what should this look like", "try both approaches", or when a plan has an open question that is cheaper to run than to argue about. Writes the question down first, builds the smallest runnable thing, keeps the answer and lets the code go. Not for production code, a feature whose design is already decided, writing a spec, or fixing a bug.
license: MIT
---

# Prototype

A prototype is throwaway code that answers one question. The code is disposable. The answer is what you keep.

Used well, it replaces an argument or a long spec with something the user can run and poke. Used badly, it quietly turns into the first draft of production code, with all the shortcuts still in it.

## 1. Write the question first

Before any code, write one sentence: what is being decided, and which answer would change the plan. If the request or plan already contains the question, quote it as it stands.

- No question, no prototype. If the design is settled, build the feature properly with tests first (see `test-driven-development`).
- Two questions are two prototypes. A prototype that answers a neighbouring question still runs, so nobody notices it was wasted.
- Note the limits: what the prototype may touch, and what observation would count as an answer.

If the question changes shape part-way (a new constraint, a different library, a different data shape), start again from the new question. A prototype patched across two questions answers neither reliably.

## 2. Pick the kind of probe

| The question is | Build |
|---|---|
| "Does this logic or state model hold up?" | A logic probe |
| "What should this look like?" | A set of UI variants |
| "Does this library, API or approach behave as we need?" or "is X or Y better?" | A feasibility probe |

The kinds produce very different artifacts, and choosing wrongly wastes the whole prototype. If the question is ambiguous, ask the user. If they cannot be reached, choose from the surrounding code (a backend module means logic, a page or component means UI, a third-party dependency or a speed question means feasibility) and write the assumption at the top of the prototype.

### Logic probe

Split what you build in two:

- **Pure core.** The state model or logic the question is about, with no database, network client or framework wiring. This is the part you are learning about.
- **Throwaway shell.** Whatever lets someone drive the core and watch it. Name it as throwaway.

For a non-developer, make the shell a single self-contained file they can open with a double-click: a control for each action, plus a few guided walkthroughs (tabs or steps) that push the model through the cases that are hard to reason about on paper. For a developer, a small interactive terminal program is enough. After every action, show the full relevant state.

Run the scenarios yourself first and record what the state actually did. The answer is what happened, not whether it looks right. When a scenario ends in a situation whose answer changes what the product does, ask the user about that concrete case ("a refund after the invoice closed: allowed?") and not "does this look right?". Record their answer.

### UI variants

Build several radically different variations of the same screen: different structure and interaction, not colour tweaks. Put them behind one switch on one route or entry point (a URL query parameter such as `?variant=b`, a flag, or a setting) and add a visible switcher so the user can flip between them. Use realistic content, and show the relevant state when the variant changes. The user chooses; you do not.

### Feasibility probe

Write a small script or test that exercises the real library, API or approach on realistic input and prints what it observed. Include the awkward cases: bad input, large input, slow or failing dependencies. When comparing approaches, put every variant behind one switch in the same build and run them under identical conditions (same input, same machine, same measurement). Separate scripts drift apart and quietly contaminate the comparison.

## 3. Rules for every prototype

1. **Disposable and labelled.** The name or a comment says it is a prototype. Put it near the code it concerns so the context is obvious, in a path that cannot be mistaken for production, and follow the project's existing conventions instead of inventing a top-level structure.
2. **One command to run.** Use the project's task runner or a plain `python path`, `make name`, `cargo run --bin name`. Starting it should need no thought.
3. **No persistence by default.** State lives in memory. If persistence is the question, use a scratch store named so that it is obviously safe to wipe.
4. **Skip the polish.** No test suite, no error handling beyond what keeps it running, no abstractions. The only checks worth writing are the small assertions, measurements or visible observations that produce the answer.
5. **Stay inside the limits.** No production routes, real credentials, real user data, or writes to shared or production systems. Use fixtures or a scratch copy. If it needs more than that, ask first.
6. **Surface the state.** After each action, or each variant switch, show what changed.
7. **Be honest about what it cannot show.** List every mock and simplification and say which conclusions they do not support. Keep any failure that changes the conclusion instead of tidying it away.

## 4. Finish: keep the answer, not the code

1. **Report** the question, how to run it, what you observed (failures included), the verdict, and its limits.
2. **Record the answer** where the next reader will look: the issue, spec, plan or decision log, or the commit message. One line is enough: the question, the verdict, the reason. If there is no such place, put a notes file next to the prototype. If the user is not around to give the verdict, leave a clearly marked placeholder for it.
3. **Hand over behaviours, not code.** The cases the prototype validated become the list of tests or acceptance checks for the real build, which starts fresh and test first. The prototype may be read as a reference. It is not cleaned up and shipped.
4. **Dispose of it, with the user's say-so.** Offer two options: delete it, or keep it on a throwaway branch that is never merged, if they want the prototype itself as a record. Delete only the files you created for it, and only after the answer is recorded and the user agrees. Never delete anything that is not part of the prototype. Do not push or merge the branch unless asked, and stage the prototype's files by path, never everything at once.

A failed premise is a result. If the prototype shows the idea does not work, say so with the evidence and stop. Do not invent implementation work to rescue it.

## Example

The user says: "We're adding refunds. I'm not sure the order states hold up."

- **Question:** "Can the order model (placed, paid, shipped, refunded) reach a state where a refund is issued twice, or stock is restocked for an item that never shipped?"
- **Kind:** logic. The core is one function that takes a state and an event and returns the next state. The shell is one HTML file with a button per event, the full state shown after every click, and three walkthroughs: refund twice, refund after a partial shipment, cancel while payment is pending.
- **Run:** the partial-shipment walkthrough restocks an item that never left the warehouse, so the model has a hole. The pending-payment walkthrough ends in a state whose right answer is a policy decision, so the agent asks: "If a customer cancels while payment is pending, is that a refund or just a void?"
- **Finish:** the answers are recorded in the plan, the three walkthroughs become three failing tests for the real implementation, and the agent asks whether to delete the prototype or keep it on a branch.

## Signs it is drifting

- You are adding tests, abstractions or error handling.
- It is answering a second question.
- You are polishing the look of a probe that only needs to work.
- Someone proposes shipping it. The answer ships. Rebuild the code.
- "It runs" is being treated as the result. The result is what it showed.
