# Worklog

This file records completed Codex work sessions for Non-Clinical Tools. Append new entries during the shutdown routine so future sessions can resume without prior chat context.

---

### 2026-05-21 - Codex desktop - Psych Scheduler text size and provider-column order
- Completed: Changed the Psych Scheduler default text-size control from 20px to 17px.
- Completed: Updated My Schedule column ordering so the selected-provider assignment column returns immediately after Day / Date, and individual provider schedule columns stay grouped beside it instead of moving after Working Providers.
- Completed: Adjusted the cloned sticky dashboard header to copy the real table header's effective zoomed font, padding, and line-height so the locked header no longer visibly shrinks.
- In progress: External feedback Apps Script redeployment and live Google Sheet default-startup preservation remain open.
- Blockers/notes: Local preview browser verification loaded the live Google Sheet successfully and confirmed desktop plus 375px mobile sticky-header sizing.

### 2026-05-21 - Codex desktop - Psych Scheduler dashboard sticky header repair
- Completed: Replaced the dashboard table's unreliable CSS sticky header with a lightweight cloned header that sits outside the horizontal-scroll wrapper and syncs to the real table widths/scroll position.
- Completed: Added a dashboard-only lightweight sync loop so the cloned header follows layout changes even when browser scroll events are inconsistent.
- Completed: Accounted for the app's CSS zoom when syncing horizontal scroll so the cloned header stays aligned on mobile.
- Completed: Kept the My Schedule table in the normal `.main` page scroll and limited the sticky behavior to the dashboard table.
- In progress: External feedback Apps Script redeployment and live Google Sheet default-startup preservation remain open.
- Blockers/notes: Local browser loading of the modified file was blocked by the browser security policy for local/data URLs; verification used static checks before publish and live GitHub Pages checks after push.

### 2026-05-21 - Codex desktop - Psych Scheduler mobile provider divergence check
- Completed: Verified the current live Psych Scheduler page at default desktop width and at a 375px mobile viewport; both rendered the same working-provider list and neither included known medical-staff columns.
- Completed: Parsed the live Google Sheet response with the app parser and confirmed the current detected psych boundaries exclude the medical-staff columns.
- In progress: External feedback Apps Script redeployment and live Google Sheet default-startup preservation remain open.
- Blockers/notes: No runtime code change was needed because the mobile-vs-desktop divergence was not reproducible in the current deployed page; this appears to have been stale task state.

### 2026-05-20 - Codex desktop - Psych Scheduler experimental command center
- Completed: Created `psych-scheduler-experimental.html` as a separate single-file clone of production `psych-scheduler.html`, preserving live Google Sheet startup plus paste/Excel fallback ingestion and leaving production unchanged.
- Completed: Added seven experimental mode defaults, manual column controls, analytics summary cards, and a canvas-based staffing risk timeline with weekday minimum, below-minimum, and temp-reliance logic.
- Completed: Added a clearly labeled experimental hub link in `index.html` and documented the separation in `docs/psych-scheduler.md`, `TASKS.md`, and `DECISIONS.md`.
- In progress: External feedback Apps Script redeployment and the pre-existing mobile-vs-desktop divergence task remain open.
- Blockers/notes: Direct `file://` browser verification is blocked by the in-app browser URL policy, so local verification used a 127.0.0.1 preview server. No census values were invented; census-adjusted risk remains future-ready placeholder copy.

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


### 2026-05-21 - Codex CLI - Psych Scheduler sticky table header timing fix
- Completed: Updated `psych-scheduler.html` so the dashboard table header uses native `position: sticky` on `thead th` with `top: 0`, letting the full page scroll normally until the header row reaches the top of the viewport.
- Completed: Removed the custom sticky watcher/toggle logic that pinned headers based on the table wrapper position, which could make the header lock early and leave unused space above it.
- In progress: Existing mobile-vs-desktop filtering divergence and live Google Sheet default-startup tasks remain open.
- Blockers/notes: Live Google Sheet/App Script integration was not re-verified in this UI/CSS-only change.

### 2026-05-21 - Codex CLI - Clarified Codex Cloud PR activation workflow
- Completed: Updated `AGENTS.md` with a Codex Cloud publish preference section that defaults to PR creation plus squash-merge on GitHub for activating changes on `main`.
- Completed: Documented manual single-file upload/commit as fallback only when PR push is unavailable in the current workspace.
- In progress: Existing Psych Scheduler mobile-vs-desktop divergence and live Google Sheet default-startup tasks remain open.
- Blockers/notes: This was a workflow-instructions update only; no Psych Scheduler runtime code changed.

### 2026-05-21 - Codex CLI - Sticky header fallback reintroduced with corrected trigger
- Completed: Updated `psych-scheduler.html` to reintroduce a lightweight sticky watcher that enables header sticky mode only when the dashboard table header row (`thead`) reaches the top edge of the `.main` scroll viewport.
- Completed: Scoped sticky CSS to `#dash-table.sticky-ready thead th` so the header does not lock early and still preserves normal full-page scrolling behavior until trigger.
- In progress: Existing mobile-vs-desktop filtering divergence and live Google Sheet default-startup tasks remain open.
- Blockers/notes: Runtime browser validation could not be executed in this CLI-only session; behavior should be verified in the deployed/static browser context.

### 2026-05-22 - Codex desktop - Beginner-friendly repo communication preference
- Completed: Expanded `AGENTS.md` Owner Communication guidance so future Codex sessions explain Git, GitHub, GitHub Desktop, Codex workspace behavior, local-vs-remote state, commits, pushes, pulls, branches, and deployments with extra beginner-friendly context.
- Completed: Documented that explanations should define concepts, distinguish local files from pushed/deployed changes, and use exact paths/button names when Dr. Fowler is operating tools manually.
- In progress: Existing Psych Scheduler product tasks remain unchanged.
- Blockers/notes: Instruction-only change; no app runtime code changed.

### 2026-05-22 - Codex desktop - Workflow streamlining preference
- Completed: Updated repo instructions so future Codex sessions proactively surface opportunities to streamline Dr. Fowler's workflow, including expected benefit, risk/cost, and smallest safe next step.
- In progress: Existing Psych Scheduler product tasks remain unchanged.
- Blockers/notes: Instruction-only change; no app runtime code changed.

### 2026-05-22 - Codex desktop - Cross-computer workstation setup guide
- Completed: Added `docs/windows-codex-github-workstation-setup.md` with step-by-step instructions for mirroring this computer's Codex Desktop and GitHub Desktop setup on another Windows computer.
- Completed: Added `scripts/setup-codex-projects.ps1`, a conservative helper that configures Git Credential Manager, clones missing active repos into `Documents\Codex\Projects`, pulls clean existing repos, and skips dirty repos instead of overwriting work.
- Completed: Verified the script with `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-codex-projects.ps1 -DryRun`.
- In progress: Existing Psych Scheduler product tasks remain unchanged.
- Blockers/notes: This was a workflow setup/documentation change only; no app runtime code changed.
