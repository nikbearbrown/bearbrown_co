---
name: using-git-worktrees
description: Set up an isolated git worktree for a task - detect whether you are already in one, use the host's own worktree feature if it has one, otherwise run git worktree add into an ignored location, install dependencies and confirm a clean test baseline before any change. Use when starting a feature or plan that should not disturb the user's current checkout, when running parallel agents on separate branches, or when the user says "use a worktree", "isolate this work", "separate checkout" or "don't touch my branch". Not for finishing, merging or removing a worktree (see finishing-a-development-branch) or for a small edit that can safely stay in place.
license: MIT
---

# Using git worktrees

A worktree is a second checkout of the same repository, in its own directory, on its own branch. Work done there cannot disturb the user's current files, and several agents can each hold a different branch at once. This skill covers starting one safely. Ending one is a separate decision that belongs to the user.

The order is: detect, decide, create, set up, check the baseline, report. Do not create anything before the first two.

## 1. Detect existing isolation

Check whether you are already inside a linked worktree. A second one nested inside the first is almost never what anyone wants.

```bash
git_dir=$(cd "$(git rev-parse --git-dir)" && pwd -P)
common_dir=$(cd "$(git rev-parse --git-common-dir)" && pwd -P)
git branch --show-current
git rev-parse --show-superproject-working-tree
```

- If `git_dir` differs from `common_dir`, you are in a linked worktree. Do not create another. Skip to step 4 and say so: "Already in a worktree at `<path>` on branch `<name>`." If the branch name is empty the head is detached, and a branch will be needed before this work can be pushed.
- If the last command prints a path, you are inside a submodule, which is a separate repository and not a worktree. Treat it as an ordinary checkout.
- If the two directories match, this is a normal checkout. Continue.

## 2. Decide whether to isolate

- Follow what the user or the project's instructions already say about worktrees: whether to use one, and where.
- If the user asked for isolation, or their instructions declare it as practice, go ahead.
- Otherwise ask one short question before making a directory and a branch in their repository: "Want me to set up a separate worktree so your current branch stays untouched?" If they say no, work in place and skip to step 4.
- A small, self-contained edit usually does not need a worktree. Say so and let the user choose.

## 3. Create the worktree

### 3a. The host's own feature comes first

If the environment gives you a way to create a worktree (a tool, a command or a flag), use it. It manages placement, branch creation and cleanup, and a worktree made behind its back is state the host cannot see. When it returns, confirm three things before touching code: the path, the branch name, and the commit it started from. Some tools start from the remote's default branch instead of your current commit, which leaves unpushed local commits behind. Check the starting commit rather than assume it.

If the code you will change lives in a repository nested inside an outer one (an umbrella folder holding several independent repositories), find the root of the repository that owns that code, `git -C <code-dir> rev-parse --show-toplevel`, and create the worktree from that one. After creation, confirm the worktree belongs to it: `git -C <worktree> rev-parse --git-common-dir` must match the same command run in the target repository. If it does not, stop editing, report what you found, and leave the stray worktree alone. Do not delete it; it may hold changes.

### 3b. Plain git, when there is no host feature

Pick the location in this order:

1. A location the user or the project instructions declare.
2. A directory the repository already uses at its root: `.worktrees/`, then `worktrees/`.
3. Otherwise `.worktrees/` at the repository root, or a sibling directory beside the repository. A sibling is outside the project and needs no ignore check, but some sandboxes will not let you write there.

**A directory inside the repository must be ignored before you create anything in it.** Otherwise the new checkout shows up as untracked, and `git add -A` stages it as an embedded repository, with a warning. Check with a trailing slash:

```bash
git check-ignore -q -- ".worktrees/"
```

The slash matters. With a directory-only ignore rule such as `.worktrees/` and no such directory yet, the check without the slash reports "not ignored" even though the rule is there.

If the location is not ignored, add it to the repository's local exclude file, `$(git rev-parse --git-common-dir)/info/exclude`. That changes nothing that is tracked and nothing that has to be committed. Edit `.gitignore` instead, and tell the user you did, only if the team should share the rule. Do not commit a change for the user without their say-so.

Create the worktree from an explicit starting point, usually the commit you are on or a base the user names:

```bash
git worktree add -b <branch> <path> <start-point>
cd <path>
```

If the branch or path already exists, stop and report it. Do not reuse a directory you did not create. A branch can be checked out in only one worktree at a time. If git refuses for permission reasons, a sandbox is probably blocking it: tell the user, and work in place only if they agree.

## 4. Set up the project

Use the commands the project documents. If it documents none, infer from the files present: `package.json`, `Cargo.toml`, `pyproject.toml`, `requirements.txt`, `go.mod`. A fresh worktree holds only tracked files, so installed dependencies and ignored files such as `.env` are not there. Do not copy secrets or credentials in from the main checkout unless the user says to.

For Python, install into an active virtual environment, never the global interpreter. If none is active, ask first.

## 5. Check the baseline

Run the project's tests before changing anything. A clean baseline is what lets you tell your own breakage from the project's.

- Green: record the count and continue.
- Red: report the failing tests by name and ask whether to proceed or investigate. Keep the list, so a later failure can be compared against it.
- No tests exist: say so, which is different from passing.

## 6. Report

```
Worktree ready at <absolute path>
Branch <name>, started from <commit or branch>
Baseline: <N> tests, <M> failing (<names, if any>)
Created by me in this session: yes
```

Keep that last line accurate. The next stage, deciding what to do with the branch and whether to remove the directory, must not treat a worktree as yours unless you made it.

## What this skill does not do by itself

- It does not remove a worktree, delete a branch, run `git worktree prune`, or use `--force`. Those belong to the end of the task and wait for the user.
- It does not reset, stash or clean the user's checkout to make room.
- It does not commit anything on the user's behalf.

## Parallel agents

Give each agent its own worktree and its own branch, and name the branch for the task. Each one needs its own dependencies. They share one repository, so branches and commits show up in all of them.

## Common mistakes

| Mistake | Why it hurts |
|---|---|
| Making a worktree without checking whether you are in one | Nested checkouts, and confusion about which branch is which. |
| Skipping the ignore check | The worktree is staged into the user's repository as an embedded repository. |
| Checking the ignore rule without the trailing slash | A correct rule looks missing before the directory exists, and you edit files you did not need to. |
| Using `git worktree add` when the host has its own feature | The host cannot see or clean up what it did not create. |
| Trusting the new worktree's starting commit | It may not be the commit you meant. |
| Starting work on a red baseline without saying so | Every later failure becomes ambiguous. |
