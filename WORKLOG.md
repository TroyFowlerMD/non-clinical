# Worklog

This file records completed Codex work sessions for Non-Clinical Tools. Append new entries during the shutdown routine so future sessions can resume without prior chat context.

---

### 2026-05-19 - Codex desktop - Psych Scheduler feedback and PTO-feasible filter
- Completed: Restored the feedback modal to a dual-path submission model: FormSubmit email plus the maintenance-request Apps Script logger, with the logger sent in a no-CORS-compatible way so FormSubmit failure does not strand the request.
- Completed: Added a My Schedule "Show only PTO feasible" table-control button that filters the selected provider's schedule to rows where `ptoRisk === 'Feasible'`.
- Completed: Verified JavaScript syntax with the bundled Node REPL, loaded the app locally from the live Google Sheet, confirmed the PTO filter changes the current table count from 112 dates to 6 dates, confirmed the new button is visible at a 375px viewport, and submitted one Codex-labeled feedback test that produced the success message.
- In progress: Existing active mobile-vs-desktop divergence task remains open.
- Blockers/notes: `AGENTS.md` already had an uncommitted edit before this work began, so commit/push was not performed automatically.

## Entry Format

    ### YYYY-MM-DD - [machine/profile] - [session summary]
    - Completed: ...
    - In progress: ...
    - Blockers/notes: ...

### 2026-05-19 - Codex desktop - Repository maintenance sweep
- Completed: Fast-forward pulled `origin/main` and confirmed the working tree was clean before maintenance logging.
- Completed: Smoke-checked the live Psych Scheduler URL; it returned HTTP 200 with expected schedule/provider text.
- Completed: Ran a local relative href/src scan. The only findings were expected GitHub Pages base-path and dynamic SMS references, not missing static assets.
- In progress: Existing stale-data badge/source-display, Apps Script redeployment cadence, repo organization, and public link retest tasks remain open in TASKS.md.
- Blockers/notes: No app code changed during this maintenance sweep; TASKS.md and DECISIONS.md were not changed.

