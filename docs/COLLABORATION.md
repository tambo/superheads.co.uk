# Working Together

## Choose And Reserve Work

The canonical task board is [TODO on GitHub's develop branch](https://github.com/tambo/superheads.co.uk/blob/develop/docs/TODO.md), backed by [data/work-items.json](../data/work-items.json). A local copy, chat history or main-branch copy can be stale. This rule applies equally to both human owners and every agent. A task showing `in-progress`, `blocked` or `review` is reserved; do not start it without agreement from its owner.

1. Open the latest remote board. Pick an unclaimed `todo` item with completed dependencies. Agree editorial direction together before larger changes.
2. Open [Manage Work Board](https://github.com/tambo/superheads.co.uk/actions/workflows/manage-work-board.yml), choose Run workflow, enter the task ID, choose `claim`, and add a short public note. Choose the default main branch for the workflow; the action always updates the latest `develop` board.
3. Wait for the run to succeed and refresh the develop board. Verify that your GitHub username is now its owner. A click, queued run, failed run or local edit is not a claim.
4. Create a task branch from updated `develop`, for example `task/SH-007-console-mobile`, and work only on that task. Open a pull request into `develop` when ready. Include task ID, checks and remaining gaps.
5. Run the action with `review` and the PR URL. Ask the other owner to review. After the PR is merged and acceptance checks pass, the task owner uses `done`. Promote tested develop changes to main through a separate reviewed pull request.

If work pauses, use `block` with a reason; it stays reserved. Add `note` updates with next steps, then `resume` when ready. Use `release` only when deliberately handing the task back to the unclaimed pool. Agree an owner handover first, then the old owner releases and the new owner claims. Do not silently steal old claims or expire them on a timer. Both owners should review active items together regularly. Task `SH-004` is reserved by tambo for hosting setup; avoid parallel hosting changes.

## Coordination Guarantees And Limits

The action reads the latest remote branch, validates ownership, commits board and TODO together, and uses a normal non-force push. Conflicting updates cause a rejected push or a refused claim; the claim is only valid after the success is visible remotely. No locks live only on someone's laptop. Changes made by this workflow's GITHUB_TOKEN do not trigger another push workflow, so task-only updates do not themselves deploy the site.

GitHub concurrency runs one board update at a time. GitHub may replace an older pending run when more requests queue; it does not guarantee an unlimited request queue. Always check the run and remote owner entry and retry a cancelled/failed request. Branch rules may also reject the bot push; do not disable protections casually. If repository rules require all changes through PRs, maintainers must configure an appropriate narrowly permitted automation mechanism before claims work.

This is coordination, not an unbreakable security lock: people with write access can manually edit the JSON or bypass guidance. Anyone proposing a manual board change must preserve current remote owners, regenerate TODO, and get agreement before overriding a claim. Stale task branches must not overwrite the current board when merging. Before merging, compare against remote develop and preserve its newest board state. Main receives board snapshots during promotion but is never the authoritative claim source.

## Agents And Fresh Sessions

At the start of every coding task, fetch remote develop and inspect its board without altering the working branch:

```bash
git fetch origin develop
git show origin/develop:docs/TODO.md
```

Name the task, owner and status to the human. If an agent cannot access Actions or dispatch a claim, ask its human to run the action and verify the resulting remote owner before editing. Agents work under their human's GitHub owner, not a pretend bot username. For an explicit ad-hoc request, add an item with acceptance criteria through a reviewed board change and claim it first. Do not turn a specific request into silent ownership of several roadmap items. Update handoff notes before ending a session; never mark unfinished or untested work done.

Agents without project-instruction support require this guide to be supplied explicitly. Neither instructions nor task automation guarantees arbitrary tools will comply.

## Friend's Setup And Access

Use [MAC-SETUP.md](MAC-SETUP.md) and double-click [Setup Superheads.command](../Setup%20Superheads.command). Invite her own GitHub account as a repository collaborator with suitable write access so she can clone, branch, open PRs and run the task action. Repository access is separate from legal ownership; agree ownership, credits and decision rights between yourselves. Copilot access uses her own account and entitlement.

Daily development does not require Dreamhost credentials: GitHub CI handles deployment. Keep production secrets restricted, set production environment approval, and agree whether both owners can release. If direct hosting access is needed, use separately approved access and her own separate key, never share private keys or the existing user's shell configuration. Do not give broad shared-hosting access solely to enable editing this site.

## Suggested Next Work

First test onboarding together (`SH-003`) and finish dev activation (`SH-004`). Then agree editorial scope (`SH-005`) and source/rights review (`SH-006`), which suit paired nontechnical work. Technical work can proceed in parallel on console refinement (`SH-007`) and a display-content contract (`SH-008`) once their dependencies are complete. Portfolio/Info (`SH-012`) is a useful editorial stream. Media, lab and favourites follow their defined prerequisites; game work and final release checks come later. Priorities are proposals for both owners to revise, not a promise to implement every item now.