# Project: Non-Clinical Tools

## Identity
- GitHub is the source of truth for this project: TroyFowlerMD/non-clinical.
- Notion is no longer the operating source of truth for this repo. Historical Notion content has been migrated into docs/ and the repo memory files.
- Durable documentation lives in docs/, AGENTS.md, TASKS.md, WORKLOG.md, and DECISIONS.md.
- Work in this repo in place. Do not move folders, clone over this repo, or rewrite history unless Dr. Fowler explicitly asks.
- Default branch: main.
- Live/public target: https://troyfowlermd.github.io/non-clinical/psych-scheduler.html.

## Project Overview
- Non-clinical TroyMD tools and personal/professional utility pages.
- Main active app is Psych Scheduler, a single-file static scheduling tool for JFK ADATC psych-team staffing.
- Psych Scheduler loads schedule data from a live Google Sheet by default and keeps paste, Excel, and upload-style fallback ingestion available.

## Project Structure
- psych-scheduler.html - main single-file static app
- docs/ - Psych Scheduler and non-clinical project documentation
- scripts/setup-codex-projects.ps1 - Windows helper for setting up Codex/GitHub project folders on another computer
- Google Apps Script and Google Sheets - external live data/maintenance request dependencies

## Documentation Map
- docs/consolidated-duplicate-psych-scheduler-project-page.md
- docs/excel-drag-and-drop-ingestion-added-to-psych-scheduler.md
- docs/excel-ingestion-filelist-file-hotfix.md
- docs/excel-ingestion-hotfix-2.md
- docs/psych-scheduler.md
- docs/psych-scheduler-column-toggles-backup-call-buttons-auto-deselect.md
- docs/psych-scheduler-feedback-apps-script-contract.md
- docs/psych-scheduler-feedback-logging-added.md
- docs/psych-scheduler-it-request-inbox.md
- docs/psych-scheduler-post-call-staffing-bug-fixed.md
- docs/reverted-post-call-classification-fix.md
- docs/windows-codex-github-workstation-setup.md

## Required Startup Routine
1. Run git status --short --branch in the repo root and confirm the branch sync state with origin.
2. If there are staged, modified, or untracked files, stop and report exactly what is present before editing. Summarize whether the changes appear intentional, stale, unexpected, or in need of user review. Treat those changes as user or prior-Codex work; do not discard, overwrite, pull over, or auto-clean them without explicit approval.
3. If the working tree is clean and network access is available, run git pull --ff-only before starting work. Do not merge, rebase, or force update unless explicitly approved.
4. Read AGENTS.md, TASKS.md, WORKLOG.md, DECISIONS.md, and any task-relevant files in docs/.
5. Report the current branch, repo status, active task, blockers, and proposed next action.
6. Wait for approval before editing unless the user has already given explicit implementation approval.

## Required Shutdown Routine
1. Update WORKLOG.md with what changed, what remains, and any blockers.
2. Update TASKS.md if task status changed.
3. Update DECISIONS.md if an architectural, workflow, safety, or publishing decision was made.
4. Run the relevant tests/checks, or explain why they were not run.
5. Run git status --short --branch and summarize the exact staged, modified, and untracked files, including whether any remaining local changes appear intentional, stale, unexpected, or in need of user review.
6. By default, after approved work is complete and relevant checks have passed, commit and push automatically unless Dr. Fowler explicitly says not to push yet. Stop and ask before committing or pushing if the changes are unclear, checks fail, deployment/config/secrets are involved, or the repo appears production-sensitive.
7. End every shutdown with an explicit "Shutdown Receipt" section. Do not end with a generic "Done" only.
8. The Shutdown Receipt must visibly report:
   - WORKLOG.md: updated or not updated, with a one-line summary.
   - TASKS.md: updated or not updated, with any task status changes.
   - DECISIONS.md: updated or not updated, with a one-line summary.
   - Tests/checks: commands run, or why none were run.
   - Commit: hash and commit message if a commit was made, or "not committed" with the reason.
   - Push: pushed successfully, failed with reason, or not pushed with the reason.
   - Final git status: exact final status result.

## Worklog Entry Format
Append entries to WORKLOG.md using this shape:

    ### YYYY-MM-DD - [machine/profile] - [session summary]
    - Completed: ...
    - In progress: ...
    - Blockers/notes: ...

## Command Aliases
- If Dr. Fowler says `start`, `#start`, `start <repo>`, or `#start <repo>` while working in this repo, immediately run the Required Startup Routine. Do not simply acknowledge or repeat the command.
- If Dr. Fowler says `done`, `#done`, `finish`, `shutdown`, `done <repo>`, or `#done <repo>` while working in this repo, immediately run the Required Shutdown Routine. Do not simply acknowledge or repeat the command.
- If Dr. Fowler says `#IT`, `IT`, `#it`, `check IT`, `scheduler IT`, or asks to check scheduler feedback/requests, immediately read `docs/psych-scheduler-it-request-inbox.md`, open the `Feedback` tab in `Medical Staff Schedule ANALYSIS SHEET`, report active non-test requests, and propose likely actions before asking for implementation approval. Do not ask which sheet to use.
- In a general or multi-repo chat, if the command names this repo, switch context to this repo before running the routine. If the target repo is ambiguous, ask one concise clarifying question.
- Treat `#start`, `#done`, and `#IT` as stronger visual command markers, but keep the plain-language variants supported.

## Cross-Machine Rules
- Never assume prior chat context is available. Reconstruct state from Git, TASKS.md, WORKLOG.md, DECISIONS.md, and docs/.
- Use git pull --ff-only only when the working tree is clean.
- Avoid destructive Git operations such as reset --hard, force pushes, history rewrites, or deleting untracked work unless explicitly approved.
- Keep generated context inside this repo's memory files and docs/ so another Windows account or computer can resume.
- Do not store secrets, tokens, credentials, private keys, or unnecessary sensitive data in repo docs.
- Preserve user or prior-Codex changes that are already in the working tree.

## Project-Specific Rules
- Preserve Psych Scheduler as a single self-contained HTML file unless explicitly asked to split it.
- Default Psych Scheduler startup should use the live Google Sheet; paste/drag-drop/upload remains fallback.
- Preserve parseTSVRobust() and parseAndLoad() during surgical UI or startup patches.
- All app state is in memory; do not introduce localStorage casually.
- Provider names are last-name-only strings and should not be renamed without explicit request.
- Validate referenced globals/helpers before shipping code, especially in user-provided snippets.
- Explain GitHub/deploy steps in beginner-friendly outcome language when talking to the repo owner.

## Verification Guidance
- For Psych Scheduler code changes, inspect psych-scheduler.html first and verify the specific affected workflow.
- If changing visible UI, check mobile-friendly behavior.
- If live Google Sheet or Apps Script access cannot be verified, state that clearly in WORKLOG.md and the shutdown summary.
- If Dr. Fowler asks to check Psych Scheduler feedback, IT requests, website requests, or active scheduler requests, or uses the `#IT` command, read `docs/psych-scheduler-it-request-inbox.md` first and use the `Feedback` tab in `Medical Staff Schedule ANALYSIS SHEET` as the request inbox.
- When a scheduler feedback request is completed or triaged, use the token-protected `updateFeedbackStatus` Apps Script operation documented in `docs/psych-scheduler-it-request-inbox.md`; do not leave completed work active in the sheet.
- If `.codex-local/psych-scheduler-feedback-admin-token.txt` is missing on a workstation, run `scripts/setup-psych-scheduler-appscript-access.ps1` and ask Dr. Fowler to provide/import the local token; never commit or print the token.
- For Psych Scheduler Apps Script work, use `scripts/clasp.cmd` from the repo root so Codex does not depend on Windows PATH finding the global `clasp` shim.

## Owner Communication

- The repo owner is new to Git, GitHub, GitHub Desktop, Codex, local-vs-remote repository concepts, commits, branches, remotes, pushes, pulls, and deployment workflows.
- When explaining repo work, include a little extra context by default: define the concept, explain why it matters, then give the specific instruction or recommendation.
- Use plain outcome language before technical terms. For example, say "this saves the change in local history" before or alongside "commit."
- Distinguish clearly between local files, local commits, pushed GitHub commits, pull requests, and live deployed website changes.
- Give step-by-step instructions with exact paths, button names, branch names, and GitHub URLs when the user is operating tools manually.
- Recommend the simplest safe option first, and name when an action is optional versus required.
- When a task reveals an opportunity to streamline Dr. Fowler's workflow, present it proactively with the expected benefit, any risk or cost, and the smallest safe next step. Keep workflow suggestions clearly separate from required task work.
- Avoid implying the live website changed unless changes were actually pushed and deployed.


## Codex Cloud Publish Preference

- When working in Codex Cloud, default to PR-based activation: commit changes, open a pull request, and have Dr. Fowler squash-merge on GitHub to activate the change on `main`.
- Use manual single-file GitHub upload/commit only as a fallback when PR push is unavailable in the current Codex workspace.
- During shutdown summaries, state clearly whether activation is pending PR merge, already merged, or manually committed on GitHub.

## Psych Scheduler Guardrails

Before editing psych-scheduler.html, inspect the existing parser, loading path, dashboard rendering, and theme variables. Keep changes narrow and preserve the single-file architecture unless the user explicitly asks for a split.
