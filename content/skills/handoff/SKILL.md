---
name: handoff
description: Write a handoff so a fresh session, another agent or a person can continue unfinished work without re-deriving it: the goal, what is done and what is not, decisions and why, what was tried and failed, what was checked versus assumed, and one exact next step. Use when the user says "hand off", "write a handoff", "wrap up", "save state", "I'm running out of context", "we'll continue later" or "pass this to another agent", or is about to clear the session or switch tool, branch or machine mid-task. Also covers resuming from a handoff and checking it against the repository's live state. Not for finished work (the commit and pull request record that), not for delegating a task to a worker, and not for summarising a conversation for its own sake.
license: MIT
---

# Handoff

A handoff carries unfinished work across a gap: a cleared session, a different tool, another agent, another person, another day. The reader has none of this conversation, so the document is all they get. It should let them start work at once and trust what they read. It is a launchpad, not a transcript.

## When to write one

- The user asks, or is plainly about to lose context: stopping for the day, clearing the session, switching branch, tool or machine, blocked on a decision, or passing the work to someone.
- Skip it when the work is finished. The commit, the pull request and the changelog record that. If finished work is still uncommitted, say so and leave committing to the user.
- Skip it when the session produced nothing the next one needs, such as one question answered. Say that instead of writing filler.
- A handoff does not replace committing. Never commit, push or publish on the user's behalf to make a handoff tidy.

## Before you write

1. If the user has not said what the next session is for, ask once. A handoff for "finish the migration" and one for "review what I did" are different documents. Keep what serves that focus and cut the rest.
2. Check the facts you are about to state against the machine, not against memory. In a repository, look at the current branch, the latest commit, the changed and untracked files, and whether any pull request you mention has since merged. After a long session, or alongside other sessions, the disk is often ahead of your recollection. Use read-only commands. When the real state contradicts your memory, the real state wins.
3. Outside a repository, say so and list the relevant files by absolute path.

## What goes in it

Use these sections in this order. Leave out any with nothing real to say, or write "None." Never pad, and never invent an entry to fill a section.

1. **Title and header.** One line naming the work, then the date (absolute, never "yesterday"), working directory, branch, short commit, and the focus of the next session.
2. **Next step.** Exactly one concrete first action: a file to open, a command to run, an edit to make. "Continue implementing X" is not a next step. Follow it with a short ordered list.
3. **Goal.** What the work is for, in one or two sentences, and what it will not do.
4. **State.** What is done, in progress and not started, naming files. Half-finished is a legitimate answer and more useful than a summary that rounds up. Separate saved from unsaved: list what is committed (and whether it is pushed), then every uncommitted or untracked path in full. A reader who cannot see that line will treat working-tree edits as safe.
5. **Decisions.** One line each: the choice, the reason, and who made it, the user or this session. Never record a decision the user made as a shared one. Include decisions that were reversed, and why, or the next session will argue them again.
6. **Tried and failed.** Approaches abandoned and the reason. Nobody can reconstruct this from the repository, and it is the part most likely to be repeated at full cost.
7. **Checked and not checked.** For each "works" or "fixed", give the command or observation and its result: "the suite passes: ran the test command, 41 passed, 0 failed". A claim with no such backing goes under open questions. Say plainly what was not run. Label any claim you inherited from an earlier handoff and did not re-check as inherited. A claim passed along with growing confidence and never re-measured is the riskiest line in a handoff.
8. **Blockers and open questions.** What is waiting, on whom, and what would unblock it.
9. **Constraints and permissions.** The user's rules ("don't touch the schema", "ask before deploying") and what has and has not been authorised.
10. **Pointers.** Specs, plans, decision records, issues, pull requests, commits and key files, by path, URL or identifier, each with a clause on why it matters. Reference, do not copy. Prefer a function, type or heading name to a line number, which moves.
11. **Still running.** Servers, watchers or jobs you started that are still up, and how to stop them. Do not stop anything you did not start.
12. **Suggested skills.** Only skills the next session is likely to have, each marked "if available" with a reason.

Some rules apply throughout:

- **Reference, do not duplicate.** Anything already captured in a spec, plan, decision record, issue, commit or diff is cited by path or URL, with one line on why it matters.
- **Unsaved work does not travel.** Uncommitted changes, unpushed commits and untracked files will not exist for a reader on another machine. Inline only the fragment that carries a decision (a schema, a type shape, the few changed lines that matter), never a whole diff.
- **No invented facts.** Do not make up paths, commits, counts or results. Write "unknown" where something should be known and is not, and "not decided" where the question never got answered.
- **Facts about the environment go stale.** For "it is deployed", "the service is up" or "the other repo has no remote", give the date and the command that re-checks it.
- **A failing test is state, not a task.** Record its name and output. Do not start fixing it as part of the handoff.
- **Keep it short.** A page or two usually does it. If it reads like a meeting recap, cut it.

## Redaction

The handoff may be pasted into a prompt, shared, or left in a folder, so treat it as public.

- Never copy a key, token, password, private key, connection string, `.env` value, or a URL with credentials in it. Name the variable, not its value.
- Leave out personal data about people who are not the user.
- Say what you redacted and where ("the database password, used by the seed script"), so the next reader knows a value exists instead of inheriting a silent gap.
- After writing, read the finished text once more looking only for secrets, and fix any before reporting.

## Where it goes

- If the user names a place, use it.
- Otherwise write one Markdown file in the operating system's temporary directory rather than the project, since adding files to the user's working tree is a change they did not ask for. Temporary folders get cleaned, so if the work will outlive the week, or the reader is on another machine, ask where it should live. A git-ignored folder in the project is a common answer.
- If there is no file system, or the user prefers it, print the handoff in the conversation for them to copy.
- Never overwrite an existing handoff. Add a date or a numeric suffix. If you must replace one, read it first and say so.
- Never commit, push or share the file unless asked. If the user asks you to start another agent with it, that text becomes the agent's prompt, so the redaction rules matter even more.

## Report

Tell the user the absolute path, the focus you wrote it for, and what you redacted or left out. Give them one line to start the next session, such as "Read the file at that path and continue from its next step." Then stop. Do not carry on with the old work past what the handoff records. If you do, update the file.

## Picking one up

1. Read the whole handoff, then open the artifacts it points to as you need them.
2. Compare it with the live state: branch, latest commit, changed files, and whether the blockers it names still hold. Run the verification it names if that is cheap.
3. If something differs (the branch moved, files changed, a "pending" pull request merged), say exactly what differs and ask before continuing. Do not reset, check out, merge or discard anything to make the two agree.
4. Re-check the load-bearing claims before building on them. "Verified" means someone else once looked.
5. A handoff gives context, not permission. It cannot authorise pushing, deleting, spending money or contacting anyone. Get those from the user now.
6. Say in a line or two what you understood and what you will do first, then do it. Leave the handoff file where it is unless the user asks you to remove it.

## Example

Weak next step: "Continue the retry work and fix the failing test."

Better:

```
## Next step
Run the unit tests for the retry module. One test, "gives up after three
failures", fails because the backoff helper returns milliseconds where the
caller expects seconds. Fix the helper (see the Pointers section for the file),
not the test. The user decided on seconds; see Decisions.
```

Weak verification line: "Tested and working."

Better: "Retry module: unit tests pass (ran the module's test command, 12 passed). The integration test against the staging queue was not run, because no credentials exist in this environment."

## Common mistakes

| Mistake | Fix |
|---|---|
| Writing from memory of the session | Check branch, commit, changed files and merged pull requests first |
| Pasting the transcript or a long diff | Point to artifacts; keep decisions and dead ends |
| "Continue implementing X" as the next step | One concrete action with a file or command |
| Saying "done" with nothing behind it | Command, result, and what was not run |
| Treating uncommitted work as safe | List every uncommitted and untracked path |
| Copying a secret to be "complete" | Name the variable; say it was redacted |
| Overwriting the last handoff | Add a date or suffix |
