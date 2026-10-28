---
name: improve-codebase-architecture
description: Survey an existing codebase for architectural friction and turn it into a short, ranked list of deepening candidates (shallow modules, pass-through layers, scattered knowledge, leaked ordering or error rules, code that is hard to test through its interface), then work through the one the user picks. Read-only until the user chooses. Use when the user asks to "improve the architecture", "find refactoring opportunities", "make this codebase easier to test or navigate", "where is this too tangled", or when the same scattered code keeps being changed. Not for designing a new module from scratch (see codebase-design), reviewing a diff, or carrying out the refactor itself.
license: MIT
---

# Improve codebase architecture

Find where the current structure causes friction and propose **deepening opportunities**: refactors that turn shallow modules into deep ones, so the code is easier to test and easier for a person or an agent to navigate.

This is an investigation. It reads the code and the history and reports. It does not edit, move or delete anything, and it ends with a chosen and designed candidate, not a finished refactor. Implementing is a separate request.

## Terms used in every suggestion

Use these precisely; do not drift into "component", "service", "API" or "boundary".

- **Module**: anything with an interface and an implementation, at any scale.
- **Interface**: everything a caller must know, including ordering, errors, configuration and performance, not just the signature.
- **Depth**: behaviour exercised per unit of interface learned. **Shallow** means the interface is nearly as complex as the implementation.
- **Seam**: a place where behaviour can change without editing that place; where an interface lives.
- **Adapter**: a concrete thing satisfying an interface at a seam.
- **Leverage**: what callers gain from depth. **Locality**: change, bugs and knowledge concentrated in one place.

For the project's own domain concepts, use the project's words. If it has a glossary, read it before you look, so your names for modules match its language and give good seams their names. Read any decision records (ADRs) in the area too; they hold decisions you should not re-litigate lightly. If neither exists, carry on without remark.

## 1. Scope before you scan

Deepening a module pays off when future changes to it get easier, so weight recently changed code. Decide where to look before you look:

- If the user named a direction (a module, a subsystem, a pain point), take it and skip the rest of this step.
- Otherwise read the commit history (a read-only listing such as the one-line log) back a good stretch, and find the hot spots: files and areas that keep coming up. Let those pull your attention first. If changes are scattered with no clear hot spot, widen the net.

## 2. Explore

If you can delegate, a read-only worker can walk the codebase; otherwise do it yourself. Do not follow a rigid checklist. Explore, and note where *you* feel friction:

- Where does understanding one concept mean bouncing between many small modules?
- Where are modules shallow?
- Where were pure functions extracted only for testability while the real bugs hide in how they are called (no locality)?
- Where do tightly coupled modules leak across their seams, or the same ordering, error or policy rules get repeated by every caller?
- What is untested, or hard to test through its current interface?

Apply the **deletion test** to anything you suspect is shallow: would deleting it concentrate complexity, or only move it? "Concentrates" is the signal you want. Before recommending a new seam, classify what the cluster depends on (in-process, locally substitutable, remote but owned, or truly external). A seam is real only if something varies across it.

Separate **observed cost** (a thing that actually slows changes or hides bugs, with evidence) from **speculative opportunity** (it merely looks improvable). Report both, but label them.

## 3. Present candidates

Default to a compact Markdown list in the reply. Rank candidates; each one gets:

- **Files and modules** involved, with the evidence (specific files, change history, tests that are hard to write).
- **Problem**: why the current structure causes friction.
- **Direction**: what would change, in plain language. Do not commit to a final interface yet.
- **Benefits**: in terms of leverage, locality, and how the tests would improve.
- **Cost and risk**: migration effort, compatibility, what might break.
- **Strength**: `Strong`, `Worth exploring` or `Speculative`.
- **Sketch**: a small before and after of the relationships, in text, when it clarifies.

Include "leave it as it is" as a real option for any candidate where the friction is mild. An investigation may conclude that no refactor is justified; say so rather than manufacturing work.

If a candidate contradicts an existing ADR, mention it only when the friction is real enough to justify reopening it, and mark it plainly ("contradicts ADR-0007, but worth reopening because..."). Do not list every refactor an ADR happens to forbid.

End with one **top recommendation** and why you would tackle it first. Then ask: "Which of these would you like to explore?" Do not propose interfaces before the user picks.

A visual report is optional. If the user wants one, write a self-contained page outside the repository, in the system temporary directory, so nothing lands in the project, and give the user its absolute path. Do not start a server or open a browser unless they ask.

## 4. Work through the chosen candidate

Once the user picks, settle it by conversation:

- Ask **one question at a time**, with your recommended answer, and wait for the reply before the next. Look up facts yourself in the code. The decisions belong to the user.
- Cover the constraints, the dependencies and their category, the shape of the deepened module, what sits behind the seam, and which existing tests survive and which are replaced.
- If alternative interfaces are still on the table, design at least two radically different ones and compare them on depth, locality and seam placement before recommending one.
- Keep the domain language current as decisions form. If you name the deepened module after a concept missing from the glossary, propose the entry. If the user sharpens a fuzzy term, record it. Say what you changed.
- If the user **rejects** a candidate for a load-bearing reason that a future reviewer would need in order to avoid suggesting it again, offer to record it as an ADR: "Want me to record this so future architecture reviews don't re-suggest it?" Skip ephemeral reasons ("not worth it right now") and self-evident ones. Write the ADR only if they agree.

Finish with the chosen candidate, the decisions made, and the open questions. Do not start the refactor.

## Common mistakes

| Mistake | Instead |
|---|---|
| Scanning everything for anything improvable | Start from the user's pain point or from where change is landing |
| Treating every thin wrapper as shallow | Run the deletion test first |
| Proposing a seam with only one implementation and no real variation | Show what varies, or do not add it |
| Listing every refactor an ADR forbids | Surface a conflict only when the friction justifies reopening it |
| Proposing interfaces before the user chooses | Present candidates, then ask |
| Turning the investigation into edits | Report, get a choice, design, and stop |
| Presenting guesses as findings | Label speculative candidates and give evidence for the rest |
