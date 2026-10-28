---
name: to-spec
description: Turn what has already been discussed into a written spec or product requirements document (PRD) that a person or an agent can build from: problem, solution, user stories, implementation and testing decisions, out of scope, open questions. Synthesises the conversation and the codebase instead of starting a new interview. Use when the user says "write this up as a spec", "turn this into a PRD", "write the product requirements", "document what we agreed", "to-spec" or "make a spec the agent can build from" once a plan is settled. Saves a Markdown file; publishes to an issue tracker only when asked. Not for exploring an idea that is still open (grill it first), not for splitting a spec into tasks, and not for a one-line ticket.
license: MIT
---

# To spec

A spec is the written record of what is going to be built and why, for a reader who was not in the conversation. This skill writes it from what is already known. It is synthesis, not discovery.

## Principles

1. **Write down what was decided; mark what was not.** Do not invent a requirement, a number, a deadline or a decision. Anything unknown goes under open questions.
2. **Do not start a second interview.** If a gap would change the spec materially, ask about that gap only, briefly. If it can be stated honestly as an open question, state it and carry on. If the idea itself is still unsettled, say so and suggest grilling the plan first.
3. **One spec per effort.** Before writing, look for an existing spec or issue for the same outcome. If one exists, update it instead of creating a second.
4. **Specs are for a reader with no context.** Use the project's own vocabulary and respect its recorded decisions. Do not explain things only the author knows.

## Process

1. **Gather.** Collect the decisions made in the conversation. Read enough of the repository to use its real names: its glossary or decision records if it has them, how its tests are run, and any existing specs or issues on this subject. Explore only what the spec needs.
2. **Choose the test seams.** A seam is a public interface where behaviour can be observed without reaching inside. Decide where the feature will be tested, preferring in order:
   1. an existing end-to-end or behavioural contract,
   2. an existing public boundary or integration test,
   3. a focused unit test of a public interface,
   4. a new lower-level harness, only when none of the above can prove the requirement.

   Use the highest seam that works. Fewer seams across the codebase is better. Show the user the chosen seams and check they match their expectations before you write.
3. **Draft** using the template below.
4. **Check the draft.** Every requirement can be tested. Every actor and every material failure or edge case has a story. Each factual claim traces to the conversation or to something you read. No padding. Terms are used consistently.
5. **Save or publish** (next section), then report.

## Saving and publishing

- **Default: a Markdown file.** Put it in the project's existing specs or plans folder if it has one. Otherwise use `specs/<short-name>.md` at the repository root, and tell the user the path. Export to another format only if asked.
- **Publishing to an issue tracker happens only when the user asks.** Then: take the tracker and repository from the project's own configuration or Git remote, search for an existing issue on the same outcome, and show the final draft before creating anything. Wait for a clear yes. Create exactly one issue, read it back to check the title and every section arrived, and report the link.
- **Do not add readiness or triage labels, create child tickets, branches or pull requests, or mark anything "ready for an agent"** unless the user asked for that.
- Report: the path or link, the open questions, and anything you assumed.

## Template

Omit a section only if it genuinely has nothing in it. Do not fill sections with generic text.

**Problem statement.** The problem from the user's point of view: who has it, what it costs them today.

**Solution.** The solution from the user's point of view, in a few sentences.

**User stories.** A numbered list, each in the form "As a (actor), I want (capability), so that (benefit)", with an id such as US-1 so other documents can refer to it. Cover every actor and every material failure or edge state. Length follows the feature; ten sharp stories beat forty padded ones.

**Acceptance criteria.** Observable and checkable: what appears, what is saved, what response comes back. One check per line. Include at least one failure path where the feature has one (empty input, no permission, missing item, duplicate request). Use a number where a number is needed, and only a number the user gave or you measured. "Fast" and "intuitive" cannot be checked.

**Implementation decisions.** The decisions already made: modules to build or change, their interfaces, schema changes, API contracts, architectural choices, and constraints. Separate a constraint (something external forces it) from a choice (something could be swapped without breaking a promise to the user). Record decisions, not a task breakdown. Do not include file paths, line numbers or code, because they go stale quickly. One exception: a snippet from a prototype that pins a decision down better than prose can (a state machine, a schema, a type shape). Keep only the decision-bearing part and say it came from a prototype.

**Testing decisions.** What a good test looks like here (it checks external behaviour, not implementation details), the seams chosen, which modules are tested, and comparable tests already in the codebase to copy from. Note gaps you could not cover.

**Out of scope.** What this work will deliberately not do. Naming the tempting extras prevents them creeping in.

**Open questions and assumptions.** For each: what is unknown, who can settle it, what you assumed meanwhile, and what it would cost to reverse if the assumption is wrong. Anything that blocks a requirement should say which one.

**For a stakeholder audience** (a PRD for product or business readers), add only what the conversation actually supports: personas, success measures with a stated way to measure them, dependencies, risks and a rough timeline. Do not invent metrics or dates to complete the set. Do not impose a technology choice the user did not make; record the project's real stack or the user's decision.

Priorities are the user's call. If they have given some, record them. Do not invent a priority split or a quota for the top tier.

## Example

A conversation settled on letting accountants export an invoice list as a spreadsheet. The spec would open:

```
# Invoice list export

## Problem statement
Accountants who reconcile invoices copy rows from the invoice list into a
spreadsheet by hand. It is slow and they transpose figures.

## User stories
US-1. As an accountant, I want to export the filtered invoice list as CSV,
so that I can reconcile it without retyping.
US-2. As an accountant, I want the export to match what I filtered, so that
I do not reconcile invoices I excluded.
US-3. As a user without export permission, I want to be told I cannot export,
so that I do not think the button is broken.

## Acceptance criteria
- Choosing Export downloads a CSV with one row per invoice in the current filter.
- Totals in the file equal the totals shown on screen.
- A user without permission gets a refusal and no file is created.
- With zero matching invoices the file has a header row only.

## Open questions
- Maximum rows per export is not decided. Assumed: no limit for now. If
  wrong, add a limit and a message (small change, one story).
```

## Common mistakes

| Mistake | Fix |
|---|---|
| Asking a fresh round of questions | Synthesise, list gaps as open questions |
| Filling in numbers, dates or metrics | Only what the user gave or you measured |
| A huge story list that repeats itself | One story per actor and material case |
| Paths and code in the spec | Name modules and interfaces; keep paths out |
| Publishing straight to the tracker | Save a file; publish only when asked |
| Creating a second spec for the same effort | Find and update the existing one |
| Vague criteria ("works well") | Observable, one check per line |
