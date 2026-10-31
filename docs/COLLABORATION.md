# Working Together

## Branch Workflow

`main` is production-only and is never an active coding worktree. Both owners and agents start implementation from the latest `origin/develop`, using a dedicated task branch/worktree. Do not commit directly to `main` or `develop`.

1. Check the current worktree with `git status --short` and `git branch --show-current`. Preserve unrelated uncommitted changes.
2. Fetch `origin/develop` and create a new branch from that ref, for example `git worktree add -b task/short-description /tmp/superheads-task origin/develop`. Work only in that task branch/worktree.
3. Validate and push the task branch; open a PR targeting `develop`. Do not merge a stale board snapshot over newer develop changes.
4. After the develop PR passes GitHub build/tests and staging is verified at `dev.superheads.co.uk`, create a separate PR from `develop` to `main`. Production promotion requires explicit owner/release approval and production environment protection.
5. Never switch, reset, or discard the user's active `main` worktree to begin a task. If the opened workspace is on `main`, stop editing and create a separate develop-based worktree first.

This branch discipline is independent of task claiming. Automated claims remain paused; inspect the board and coordinate with owners conversationally.

## Work Board: Automated Claims Paused

The roadmap is [TODO on GitHub's develop branch](https://github.com/tambo/superheads.co.uk/blob/develop/docs/TODO.md), backed by [data/work-items.json](../data/work-items.json). A local copy, chat history or main-branch copy can be stale. At the user's request, the Manage Work Board Actions workflow and mandatory claims are paused. Do not open a claim UI or block explicitly requested work waiting for a claim.

Review active owners and coordinate with the human if work may overlap. The user currently owns `SH-004` DreamHost activation, so ask before making overlapping hosting changes. Keep status and handoff notes accurate by agreement. Task `SH-016` records the deferred decision to revisit automated claims; re-enable them only when requested.

## Agents And Fresh Sessions

For substantial coding work, inspect the latest develop board without altering the working branch:

```bash
git fetch origin develop
git show origin/develop:docs/TODO.md
```

Mention relevant active owners to the human and ask about possible overlap. Follow explicit requests without waiting for an Actions claim. Update handoff notes before ending a session; never mark unfinished or untested work done. Do not turn a specific request into silent ownership of unrelated roadmap items.

Agents without project-instruction support require this guide to be supplied explicitly. Instructions are guidance, not an unbreakable lock.

## Friend's Setup And Access

Use [MAC-SETUP.md](MAC-SETUP.md) and double-click [Setup Superheads.command](../Setup%20Superheads.command). Invite her own GitHub account as a repository collaborator with suitable write access so she can clone, branch and open PRs. Repository access is separate from legal ownership; agree ownership, credits and decision rights together. Copilot access uses her own account and entitlement.

Daily development does not require DreamHost credentials: GitHub CI handles deployment. Keep production secrets restricted, set production environment approval, and agree who can release. If direct hosting access is needed, use separately approved access and her own separate key; never share private keys or shell configuration. Do not give broad shared-hosting access solely to enable editing this site.

## Suggested Next Work

Finish dev activation (`SH-004`), then agree editorial scope (`SH-005`) and source/rights review (`SH-006`). Technical work can proceed on console refinement (`SH-007`) and a display-content contract (`SH-008`) after the owners agree priorities. Portfolio/Info (`SH-012`) is a useful editorial stream. Media, lab and favourites follow their prerequisites; game work and final release checks come later. Priorities are proposals to revise together, not a promise to implement every roadmap item.

## Revisit Automation Later

If simultaneous contributions make informal coordination inadequate, discuss task identity, ownership handoff, branch protection, race handling and automation permissions before reintroducing a claim action. The former workflow was coordination only, not a security lock.
