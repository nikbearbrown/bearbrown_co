---
name: finishing-a-development-branch
description: Wrap up finished work on a git branch - verify the tests, check for uncommitted changes, confirm the base branch, then present the integration choices (merge locally, push and open a pull request, keep as is) and carry out only the one the user picks. Use when implementation is done and the user asks "what now", "finish this branch", "merge this", "open a PR", "wrap this up" or "clean up the worktree". Merges, pushes, deletions and worktree removal each need the user's say-so; discarding work happens only on an explicit request. Not for starting isolated work (see using-git-worktrees), resolving conflicts, or reviewing code.
license: MIT
---

# Finishing a development branch

The work is written. What happens to it next, whether it is merged, published, parked or thrown away, is the user's decision. Your job is to make that decision easy and safe, then carry out exactly what they pick.

Nothing in this skill merges, pushes, deletes a branch, removes a worktree or discards work until the user has chosen that specific action. A choice of one action does not authorize another: "merge it" is not permission to delete the branch, and "open a PR" is not permission to remove the worktree.

## 1. Look before you act

Start read-only.

```bash
git status --porcelain
git branch --show-current
git rev-parse --show-toplevel
```

Also record whether this is a linked worktree: compare `git rev-parse --git-dir` with `git rev-parse --git-common-dir` (each resolved to an absolute path). Capture the worktree path now, while you are still inside it. After you change directory, the same command returns the main checkout instead.

**Uncommitted changes.** Merging or pushing a branch leaves them behind. Show the list and ask what to do: commit them to this branch, or leave them. If you did not make them, say so and stop for instructions. Do not stash, `git clean`, commit or discard them to get a tidy tree.

**Your own debugging leftovers.** Remove temporary logging, prints and switches that you added, and only those. If you are unsure whether something is yours, ask. Do this before the final test run so the run covers the code that will ship.

## 2. Verify

Run the project's full test suite on the tree you are about to integrate, after your last edit. Read the result. A green run earlier in the session proves only the tree it ran on.

- If tests fail, report the failures and stop. The choices come after a green run.
- If failures were already there before your work, name them and ask whether to proceed. Do not skip over them.
- If the project has no tests, say that plainly. It is not the same as passing.

## 3. Confirm the base branch

The base is the branch this work was cut from. Take it from the plan, the conversation or the branch's upstream. If you cannot establish it, ask: "This branch split from `<your best guess>`. Is that right?" Do not guess from `git merge-base HEAD main`; it prints a commit id, not a branch name, and returns an answer even for a branch that is not the base. Merging into the wrong base is expensive to undo.

## 4. Present the choices

Offer these three and wait. Do not choose for the user, and do not add a discard option unprompted.

```
Implementation is complete and the tests pass. What would you like to do?

1. Merge into <base> locally (nothing is pushed or deleted)
2. Push the branch and open a pull request
3. Keep the branch as it is, and I will handle it later
```

If the head is detached, a local merge makes no sense. Offer only: push as a new branch and open a pull request, or keep as is.

## 5. Carry out the choice

### Option 1: merge locally

Do this from the main checkout, not from inside a linked worktree. The base is usually checked out there already, and git refuses to check out a branch that another worktree holds.

1. Note the base branch's current commit, so the merge can be undone: `git rev-parse <base>`. Say it in your report.
2. Check out the base. If it tracks a remote branch, update it with `git pull --ff-only`. If the checkout or the pull fails, stop and report. Never merge from the wrong branch because a checkout failed.
3. `git merge <feature-branch>`. On conflicts, stop and bring in the user. Do not resolve silently and do not abort silently. If the user asks you to resolve them, see resolving-merge-conflicts.
4. Run the tests on the merged result.
5. If they fail, stop. Leave the branch and worktree in place and report. The merge exists only in the local base. Undoing it means moving the base back to the commit from step 1, which is a reset, so it happens only if the user asks.
6. If they pass, report, then ask about cleanup (section 6). Do not push the base branch: that is a separate request.

### Option 2: push and open a pull request

Pushing publishes the branch, which is what the user chose. Use `git push -u origin <branch>`. From a detached head, name the remote branch: `git push origin HEAD:refs/heads/<new-branch>`.

Open the pull request with the forge's own command-line tool if one is available, or the creation link most forges print after a push. Follow the repository's template and conventions. Write the description from the real commits and the real test results: what changed, why, how a reviewer can check it, and any decision that was not obvious. Do not state a check that was not run. Report the URL.

Never force-push. A rejected push means the remote has moved: find out why. Force-push only if the user explicitly asks for it, naming the branch. Keep the worktree: review feedback gets fixed there.

### Option 3: keep as is

Report the branch name, the worktree path if any, and the state of the tests. Change nothing.

### If the user asks to discard the work

This path exists only for an explicit request to throw the work away. "Looks done" or "yeah, get rid of it" about something else is not one. Before anything is deleted, show exactly what will be lost:

```
This will permanently delete:
- Branch <name>
- Commits: <list with hashes>
- Worktree at <path>, including uncommitted files: <list>

Type "discard" to confirm.
```

Wait for that word. Anything else cancels, and the user can ask again. Then clean up (section 6), and force-delete the branch with `git branch -D <name>` only after the worktree is gone. Afterward the commits may be reachable from no reflog. They normally stay in the object store until git garbage-collects unreachable objects, and `git branch <name> <hash>` restores one while it is still there. Keep the hashes in your report and promise no particular window.

## 6. Clean up, only with permission

After a local merge, ask before you remove anything: "Merged and the tests pass. Remove the worktree at `<path>` and delete the branch `<name>`? I will do neither unless you say so." Do each only on a yes. A confirmed discard has already covered the items its confirmation listed, and nothing beyond them.

Rules for removal:

- **Only a worktree you created.** A directory name such as `.worktrees/` does not prove ownership. If you did not make it, or the host manages it, leave it in place, and use the host's own exit feature only in a mode that keeps it.
- **Run it from outside the worktree**, in the main checkout, using the path you captured.
- **Use `git worktree remove <path>` without `--force`.** It refuses when there are modified or untracked files, which means files that exist nowhere else. Show them and ask: commit them to the branch first, move them somewhere safe, or lose them. Use `--force` only with the user's say-so for those exact files.
- **Ignored files go silently.** Git deletes ignored files, such as a `.env` or a local database, along with the worktree and gives no warning. Run `git status --porcelain --ignored` first and show what would vanish.
- **Order matters.** Remove the worktree, then delete the branch. Git refuses to delete a branch a worktree still has checked out.
- **Use the safe delete, `git branch -d`, for a merged branch.** It refuses an unmerged one. `-D` is for confirmed discards only.
- **Do not run `git worktree prune` as part of cleanup.** `remove` clears its own record, and pruning also drops the records of other worktrees whose folders are merely missing right now.
- **Do not delete remote branches.** That is its own request.

## Never, unless the user explicitly asks

Force-push. `git reset --hard`. Merge with a failing or unrun test suite. Merge while the working tree has uncommitted changes. Skip hooks with `--no-verify`. Delete a branch, a worktree or a remote branch. Stash, clean or discard changes you did not make.

## When you want to skip a step

| The thought | The answer |
|---|---|
| "They obviously want it merged." | Present the choices and wait. |
| "The tests passed earlier." | Run them on the tree you are integrating. |
| "The base is obviously main." | Confirm it. |
| "The PR is up, so I can remove the worktree." | Feedback gets fixed there. Keep it until the work lands. |
| "That other worktree looks stale." | It is not yours. Leave it. |
| "Removal was refused, so I will force it." | The refusal is the safeguard. Show the files and ask. |
| "The merged result fails, but it is probably flaky." | Stop. Leave everything in place. |
