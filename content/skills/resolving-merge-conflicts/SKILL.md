---
name: resolving-merge-conflicts
description: Resolve an in-progress git merge, rebase or cherry-pick conflict - find out what each side was trying to do, resolve each hunk without inventing behaviour, run the project's checks, then finish the operation. Use when git reports CONFLICT, files contain conflict markers, git status says "unmerged paths" or "rebase in progress", or the user says "fix the merge conflicts", "resolve this rebase" or "sort out the conflict". It never pushes, force-pushes or aborts on its own. Not for avoiding conflicts, choosing a branching strategy, or undoing a finished merge.
license: MIT
---

# Resolving merge conflicts

A conflict means two changes touched the same lines and git cannot decide between them. Both changes had a reason. The job is to keep the reasons, not to make the markers go away.

## 1. See the state

```bash
git status
git diff --name-only --diff-filter=U
```

Find out which operation is running (merge, rebase or cherry-pick), which branch is being brought in, and which files are unmerged. For each file, look at the commits on each side that touch it: `git log --merge --oneline -- <file>` while a merge is in progress.

Before you touch anything, check whether `git status` shows uncommitted changes that are not part of the conflict. Git's own manual warns that `git merge --abort` may be unable to restore uncommitted changes that were present at the start, particularly if they were edited afterwards. If there are changes that are not part of this conflict, tell the user.

## 2. Find the intent of each side

For every conflicting hunk, work out why each change was made. Read the commit messages on both sides, the pull request or ticket they point to, and any plan or spec the project keeps. A comment in the code is a clue, not proof.

If you cannot establish what one side was for, ask the user instead of guessing. A wrong guess here compiles, passes review and breaks something later.

When the markers show only the two sides, show the common ancestor too: `git checkout --conflict=diff3 -- <file>` rewrites the file with three sections, ours, the base, and theirs. Seeing what both sides started from usually makes the intent plain.

## 3. Resolve each hunk

- **Keep both intents** when they can coexist. Often that is combining two edits, or applying one change to the other's new shape.
- **When they cannot coexist**, take the one that fits the stated goal of the merge, and note the trade-off in the commit message and your report. Say what was lost.
- **Do not invent behaviour.** If the only resolution would be new logic neither side wrote, stop. That is a decision for the user, who may need to talk to whoever wrote the other change.
- **Check which side is which.** In a merge, "ours" is the branch you are on. In a rebase it is reversed: "ours" is the branch you are rebasing onto, and "theirs" is the commit being replayed, which is usually your own work. A blanket `git checkout --ours <file>` or `--theirs` that discards one whole side is only right when that side is meant to go entirely.
- **Generated and lock files.** Do not hand-merge them. Resolve the source files, then regenerate with the project's own tool.
- **Deleted on one side, edited on the other, renamed, or binary.** These need a decision, not a text edit. Say which choice you made and why.
- **Remove every marker.** After editing, run `git diff --check`. It flags leftover `<<<<<<<`, `=======` and `>>>>>>>` lines.

## 4. Run the checks

Find the project's automated checks, usually a type check, then the tests, then formatting. Run them and fix whatever the merge broke. If a test was already failing before the operation, report it by name; do not claim the merge is clean.

In a rebase the tree is only partly replayed until the last commit, so run the full checks when the rebase finishes. Whatever you could not run, say so.

## 5. Finish the operation

Stage the files you resolved by name, not with `git add -A`, which can sweep in untracked files that have nothing to do with the merge. Look at `git status` to confirm nothing unmerged remains. Then conclude:

- Merge: `git commit`. Keep the message git prepared and add a line for any trade-off from step 3. If the host has no editor, pass the message with `-m`.
- Cherry-pick: `git cherry-pick --continue`.
- Rebase: `git rebase --continue`. Expect to repeat steps 1 to 5 for each later commit that conflicts, until git reports the rebase is done.

Stop there. Do not push. A rebase rewrites the branch's history, so publishing it needs a force-push, and that happens only if the user explicitly asks, naming the branch.

## About aborting

`git merge --abort` and `git rebase --abort` put the repository back as it was before the operation began. They are the user's way out, and they are also destructive: they throw away every resolution made so far, and they can lose uncommitted changes.

- Do not abort on your own because the conflict is hard or the work is going badly.
- Do not start over with `git reset --hard`, `git checkout .` or `git clean` to "get a fresh start".
- If resolving would mean inventing behaviour, or the conflict shows that two lines of work were never independent, stop with the conflict still in place. Explain it, and offer the abort as one of the options.
- Run an abort only when the user asks for one.

## Report

When done, say what was in conflict, how each hunk was resolved and why, what the checks showed, and the state of the repository now: operation finished, nothing pushed.
