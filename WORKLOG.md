# Worklog

This file records completed Codex work sessions for Non-Clinical Tools. Append new entries during the shutdown routine so future sessions can resume without prior chat context.

---

### 2026-05-20 - Codex desktop - Psych Scheduler feedback confirmation and PTO columns
- Completed: Updated `psych-scheduler.html` so feedback shows green success only after confirmed email delivery through the feedback Apps Script response or the FormSubmit fallback; unconfirmed backup logging now shows a warning and keeps the typed fields in place.
- Completed: Updated the My Schedule "Show only PTO feasible" filter so it switches to the PTO review columns and restores the user's prior columns when turned off.
- Completed: Added `docs/psych-scheduler-feedback-apps-script-contract.md` with the required feedback Apps Script `doPost` email/log response contract.
- In progress: The external feedback Apps Script still needs redeployment to send email and return `emailed: true`.
- Blockers/notes: Local browser verification was blocked by the in-app browser URL policy for localhost/file URLs. Direct Apps Script POST returned HTTP 200 with `{"status":"ok"}` but did not provide `emailed: true`; direct FormSubmit test returned HTTP 522.

### 2026-05-19 - Codex desktop - POA logistics wording and print persistence
- Completed: Softened the POA logistics guide language so it does not frame the helper as doing everything or mention mobility limitations directly.
- Completed: Added device-local checkbox persistence, a Print / PDF button, and print-specific CSS for a cleaner PDF layout.
- In progress: Existing Psych Scheduler mobile-vs-desktop divergence and live Google Sheet startup tasks remain open.
- Blockers/notes: Browser-generated PDFs preserve checked items visually and usually preserve hyperlinks; checkbox interactivity in the PDF depends on the PDF viewer.

### 2026-05-19 - Codex desktop - Personal POA logistics checklist
- Completed: Added `personal/poa-logistics-guide.html`, a self-contained mobile-friendly checklist for setting up POA documents, with first-priority tasks, in-person versus remote tracks, local offices, official links, and concise scripts.
- Completed: Cross-linked the existing POA explainer to the new logistics checklist.
- In progress: Existing Psych Scheduler mobile-vs-desktop divergence and live Google Sheet startup tasks remain open.
- Blockers/notes: Publish verification should confirm the new logistics guide URL after push.

### 2026-05-19 - Codex desktop - Personal POA guide page
- Completed: Added `personal/poa-guide.html`, a self-contained mobile-friendly Power of Attorney guide with topic cards, balanced expandable details, Light/Medium/Dark theme controls, and text-size controls.
- Completed: Recorded the new `personal/` page organization in TASKS.md and DECISIONS.md.
- In progress: Existing Psych Scheduler mobile-vs-desktop divergence and live Google Sheet startup tasks remain open.
- Blockers/notes: Publish verification should confirm the new GitHub Pages URL after push.

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

