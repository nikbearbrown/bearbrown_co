---
name: domain-modeling
description: Build and sharpen a project's shared domain language while a design is being made - challenge vague or overloaded terms, break them with edge-case scenarios, check them against the code, and write resolved terms into a glossary and hard-to-reverse decisions into ADRs as they settle. Use when the user is pinning down terminology or a "ubiquitous language", asks "what should we call this", says two words mean the same thing or one word means two things, or wants a glossary, CONTEXT or GLOSSARY file, or an ADR written or updated. Not for designing entities, schemas or aggregates (see domain-model-design), not for merely reading an existing glossary, and not for documenting how code works.
license: MIT
---

# Domain modeling: sharpen the project's language

Two words for one concept, or one word for two concepts, is how a codebase and the people working on it drift apart. This skill is the active discipline of fixing that while a design is being made: challenge vague terms, break them with edge cases, check them against the code, and write the result down the moment it settles.

Reading an existing glossary to learn the vocabulary is not this skill; any task can do that in one line. Use this skill when the model itself is changing: a term is being defined, renamed, split, or disputed.

## What it produces

- A **glossary**: the project's own terms, one canonical word per concept.
- **ADRs** (architecture decision records), but only for the few decisions that deserve one.
- A short list of **open ambiguities** that were found and not yet resolved.

## Where things live

Follow the project's existing convention for glossary and decision records if it has one. If it has none, use:

- `GLOSSARY.md` at the repository root.
- `docs/adr/0001-short-title.md`, numbered in order, for decisions.

Many projects call the glossary `CONTEXT.md`. If the repository already does, keep that name. For a new file, a name like `GLOSSARY.md` avoids confusion with any files that give an AI agent instructions or background.

If the repository has several real contexts (separate teams or deployable parts whose words differ), keep a root `GLOSSARY-MAP.md` that lists each context, where its glossary lives, and how the contexts relate. Each context keeps its glossary and its own ADRs beside its code; system-wide ADRs stay in `docs/adr/`. Work out which context the current topic belongs to, and ask if it is unclear.

**Create files lazily.** No glossary until the first term is resolved, no ADR folder until the first ADR is needed. An empty glossary is worse than none, because it looks maintained.

## During the conversation

1. **Challenge against the glossary.** When the user uses a term in a way that conflicts with its written definition, say so at once: "The glossary defines 'cancellation' as X, but you seem to mean Y. Which is it?"
2. **Sharpen fuzzy language.** When one word is doing several jobs, propose a separate canonical term for each concept: "You said 'account'. Do you mean the Customer or the User? Those are different things."
3. **Stress-test with scenarios.** Invent concrete edge cases that force a precise boundary between two concepts: "A customer returns one item from a three-item order. Is the order cancelled, partly cancelled, or something else?" A definition that cannot classify the edge case is still fuzzy.
4. **Check the code.** When the user says how something works, look at whether the code agrees, and raise any contradiction: "The code cancels whole orders, but you just said partial cancellation is possible. Which is right?" The code shows current behavior, not intended behavior. Do not assume it is correct, and do not assume the user's memory is.
5. **Write it down as it settles.** Update the glossary when a term is resolved, one term at a time. Batched updates tend never to happen.

When a term cannot be resolved yet, do not guess. Record it under **Open questions** with the question stated, so it is parked on purpose rather than forgotten.

## Glossary rules

- Only terms specific to this domain. General programming concepts do not belong, however heavily the project uses them.
- One or two sentences saying what the thing **is**. No implementation detail, no plans, no specs, no progress notes. The glossary is not a scratch pad or a place for design decisions.
- An **Avoid** line listing rejected synonyms, so the concept never travels under two names.
- When one word meant two things, split it into two named terms and retire the overloaded word, listing it under Avoid for both.
- Add a one-line domain example or a distinction from a neighboring term only when it prevents a likely misreading.

Entry shape:

```
**Order**: a customer's request to buy, from placement until it is fulfilled or cancelled. Holds one or more line items.
_Avoid_: purchase, basket (a basket is not yet an order).

**Cancellation**: the withdrawal of an entire order before it ships. Removing one line item is a *line removal*, not a cancellation.
_Avoid_: void, abort.

## Open questions
- Is a return after shipping a cancellation, a refund, or its own thing? (raised with the user, not decided)
```

## ADRs: offer them sparingly

Offer an ADR only when **all three** are true:

1. **Hard to reverse.** Changing your mind later costs something real.
2. **Surprising without context.** A future reader will wonder why it was done this way.
3. **The result of a real trade-off.** There were genuine alternatives and one was picked for specific reasons.

If any one is missing, skip it. An easy decision will simply be reversed, an unsurprising one needs no explanation, and a choice with no alternative records only that the obvious thing was done.

Offer first, then write it once the user agrees. Keep it short:

```
# 0007: Event-source the order write model
Status: accepted
Context and decision: one short paragraph. The forces, what was chosen, and why.
Alternatives and consequences: only where they carry information a future reader needs.
Reconsider if: the condition that would reopen this decision.
```

An accepted ADR is history. If the decision changes, write a new ADR that supersedes it and mark both; do not rewrite the old one. Link to the ADR from the spec or design note instead of copying its reasoning there.

## Writing safely

- The glossary and ADR folder are this skill's output, so write them as terms settle. Tell the user each time what you changed: "Added 'Cancellation' to GLOSSARY.md."
- Do not change or delete a definition the user or team has already settled without agreement on that specific change.
- Do not edit an accepted ADR.
- If the user only asked what a term means here, or whether it is used consistently, answer the question and do not create files.
- If the project keeps its docs somewhere unusual and you cannot tell where, ask. Do not invent a new layout.

## Not every change belongs here

Use this skill when the work introduces, renames, splits or disputes a domain term, or records a decision that meets the ADR bar. Ordinary code complexity, a new module that reuses existing vocabulary, and read-only use of an established glossary do not need it. If the work is deciding which entities exist, what they own, and which states are forbidden, that is structural modeling: use domain-model-design.

## Done when

- Every term resolved in the session is in the glossary with a definition and an Avoid list.
- Every ambiguity found is either resolved or listed under Open questions.
- Every decision that met the ADR bar was offered as one.
- The user has been told which files changed.

## Mistakes to avoid

| Mistake | Instead |
|---|---|
| Accepting a vague word because the meaning is "obvious" | Ask for the edge case and see whether the user and the code agree |
| Putting plans, field lists or how-it-works notes in the glossary | Keep it to what each term means; put the rest in specs or code comments |
| Writing an ADR for every choice | Apply the three tests; most choices fail one |
| Trusting the code over the user, or the user over the code | Surface the conflict and ask which is intended |
| Saving updates for the end | Write each term as it settles |
| Rewriting an old definition quietly | Propose the change and get agreement first |
