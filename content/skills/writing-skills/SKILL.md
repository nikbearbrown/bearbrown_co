---
name: writing-skills
description: Write, edit or review an agent skill (a SKILL.md file) so it triggers when it should and changes what the agent does. Covers deciding whether guidance belongs in a skill at all, the description, the body, testing against a no-skill baseline, tuning triggers, and editing an existing skill safely. Use when the user says "write a skill", "make this a skill", "turn this workflow into a SKILL.md", "my skill never triggers", "improve or review this skill", or asks how to word a skill description. Not for project instruction files, one-off prompts, or performing the task a skill describes.
license: MIT
---

# Writing skills

A skill is a folder with a `SKILL.md` (a `name`, a `description`, a body) and optional supporting files. The host keeps every skill's name and description in view and reads the body only after it decides the skill applies. So the description decides whether the skill is used, the body decides whether it works, and every line of both costs context on every run.

**How far to trust this advice.** It is distilled from public skill-writing guides. Most of it is the authors' experience, not published measurements. Where a rule rests on one anecdote, or on a claim about how one host behaves, it is marked "reported". Treat those as defaults and test your own skill (section 5).

## 1. Decide whether it should be a skill

| The guidance is | It belongs in |
|---|---|
| A method, check or body of knowledge the agent lacks by default, reused across tasks or projects | a skill |
| True only in one repository (paths, branch rules, ticket prefixes, CI job names) | that project's instruction file |
| Needed on every turn | standing instructions, not something that must be triggered |
| A rule that must hold even if the agent ignores it, or that a tool can check | a validator, script, hook or test |
| A one-off task, or the story of how you solved something once | nothing durable |

Portability test: does the text stay true in another repository? Concrete paths, names and prefixes say no.

If a capable agent already does the job correctly without the guidance, there is nothing to write. Section 5 shows how to find out.

## 2. Start from real uses

Collect a handful of requests people would actually type that should trigger the skill, and a few near-misses that share its words but should not. If the conversation already contains the workflow ("turn this into a skill"), mine it first: the steps taken, the corrections the user made, the formats seen. Ask the user only about the gaps, a few questions at a time.

## 3. Write the description

The description is the main trigger. Rules:

- Third person, at most 1,024 characters. It says what the skill does and when to use it.
- Name the outcome in a clause, not the procedure. A description that lists the skill's steps can stand in for the body: the agent reads the summary, feels it has the rule, and never opens the file. Reported: one anecdote in one guide, repeated by copies and one other guide, no data. Cheap to avoid, so avoid it.
- Include the words a person would type, and the situation as well as the task ("a test fails", "the build is red"). Three guides report under-triggering as the common failure. Give each distinct trigger once; stacking synonyms for one branch only spends context.
- Add a "not for" clause where a neighbouring skill or task invites confusion.
- Lead with the main case. Hosts may shorten long descriptions or cap the total listing (reported, by two guides, for one host), and the tail is what gets cut.
- "When to use" belongs here, not in the body. The body is not read until the skill is chosen.

Weak: `Helps with release notes.`
Narrates steps: `Lists merged pull requests, groups them by label, then writes a paragraph per group.`
Better: `Draft release notes from merged changes, grouped by user-visible impact. Use when the user says "write release notes", "what changed since the last tag" or "summarize this release". Not for per-commit changelogs or deciding what to ship.`

## 4. Write the body

- **Add only what the agent lacks.** Assume it is capable. For each sentence ask whether the agent would do the right thing without it; delete the whole sentence if so, rather than trimming words.
- **Match specificity to fragility.** Principles and heuristics where many approaches work. Exact steps or a bundled script where the task is error-prone or order matters.
- **Explain why.** A reason lets the agent handle cases the rule did not foresee. Capital-letter MUST and NEVER are a flag that the reason is missing; keep emphasis for real hard limits.
- **Choose the form by the failure you saw.** The agent breaks a rule it knows, under pressure: state the rule, forbid the specific workarounds, and add a table of excuses with their rebuttals plus a short list of red flags. The output has the wrong shape: describe what the output is, its parts in order, instead of listing prohibitions (reported: prohibitions on shape get negotiated away). A required element is missing: put a required slot for it in the template. Behavior depends on a condition: write the condition on something observable. Whichever form you pick, state what to do, and pair any prohibition with the alternative.
- **End each step with a checkable completion criterion**, such as "every changed file is accounted for", so the agent can tell done from nearly done. If a sharper criterion does not stop the agent rushing a step, move the later steps into a separate file or skill so they are out of view.
- **Say each thing once.** Duplicated rules drift apart. When editing, remove contradictions; do not stack an override on an obsolete rule.
- **Examples.** Make examples complete and realistic. One or two usually suffice; add more only when testing shows the agent generalizing wrongly, and make them differ from each other. Sources disagree on how many, so this is unsettled.
- **Length.** The published Agent Skills specification recommends keeping the body under about 500 lines (fewer than about 5,000 tokens). Move long reference material to separate files, link each by plain relative path (not syntax that loads the file automatically) with a line saying when to read it, and keep links one level deep.
- **Scripts.** Bundle one when every run would otherwise rewrite the same code, and run it before shipping. Name the interpreter in the instructions (`bash scripts/check.sh`), since packaging may drop the executable bit (reported).
- **Self-contained.** Depend on no other skill, unshipped file, plugin prefix or one host's tool names. Say "the user" and "the agent". Leave out README, changelog and setup notes.
- **No numbers without a basis.** A statistic, timing or success rate needs a source or a measurement you can state. Otherwise state the qualitative point or drop it.
- **Safe by default.** A skill must not surprise the user: no hidden actions, no exfiltration, no skipping confirmation for irreversible steps. Anything destructive (deleting, overwriting, force-pushing, publishing) happens only on the user's explicit request, and the skill says so. Never write "delete it and start over" about work the user owns.

## 5. Test it

A validator shows a skill is well-formed; only a run shows it changes behavior.

1. **Baseline.** Give a fresh agent, with no access to the skill, a realistic task that tempts the failure. Record what it does and the reasons it gives, verbatim. If it already behaves well, stop: there is no skill to write.
2. **Write the smallest guidance** aimed at what you saw, not at hypothetical cases.
3. **Rerun the same task with the skill.** Run each variant more than once; one sample misleads. Widely differing results mean the wording does not yet bind.
4. **Close what leaks.** For a discipline skill, combine pressures in the scenario (a deadline, hours of sunk work, a senior saying skip it, fatigue), give concrete options and a forced choice, and ask "what do you do?". Each new excuse gets a row in the table and a line in the red flags. Test a technique on a new case; test a reference by whether the right entry is found and used.
5. **Test the triggers.** Write realistic prompts, some that should trigger the skill and some near-misses that should not. Tune the description on part of them and check it on the rest, so you do not fit it to the prompts you tuned on. A trivial one-step request may not trigger any skill; use substantive prompts (reported, one guide).
6. **Read transcripts, not only outputs.** If the skill makes the agent waste effort, cut that part. If every run rewrites the same helper, bundle it. Generalize from the feedback instead of patching for the specific examples.

For style and taste skills, have the user read the outputs.

**Report only what you ran.** Reading a skill through is not a test, and imagining a scenario is not running it. If you cannot start a fresh agent, say the skill is untested and offer the user the baseline task to run.

## 6. Editing an existing skill

- Read it, and whatever calls or names it, before changing anything.
- Keep a copy of the current version first. It is your baseline and your way back. Do not delete or overwrite the user's version without asking.
- Keep the name and folder unless the user asks to rename; a rename breaks everything that refers to it.
- Re-run the baseline on the part you changed. Guidance written for weaker models may no longer be needed, so after a model change test whether removing lines helps before adding any (reported, one guide).
- Installing, publishing or changing global configuration is a separate step that needs the user's say.

## 7. Diagnosing a misbehaving skill

| Symptom | Likely cause |
|---|---|
| Never fires | Description lacks the user's own words, is abstract, or buries the main case |
| Fires on the wrong tasks | Terms too broad; no "not for" clause |
| Fires, but the body is skipped | Description narrates the procedure |
| A step is rushed | Vague completion criterion |
| A known rule is dropped under pressure | Soft wording, no reason, no rebuttal for the excuse |
| Output has the wrong shape | Prohibitions where a recipe is needed |
| Long, partly ignored | Dead lines the agent obeys anyway; reference material that belongs in a separate file |
| Rules disagree | Layers of edits; consolidate |

## Before you ship

- [ ] `name` equals the folder: lowercase letters, digits and single hyphens, at most 64 characters, no leading or trailing hyphen.
- [ ] `description` is at most 1,024 characters and has what, when, the typed phrases and a "not for".
- [ ] No link, skill or file is referenced that is not in the folder.
- [ ] Every number and claim has a stated basis or is gone.
- [ ] Destructive steps run only on the user's explicit request.
- [ ] Tested against a baseline, or marked untested.
