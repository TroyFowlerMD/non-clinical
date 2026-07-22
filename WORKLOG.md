# Worklog

This file records completed Codex work sessions for Non-Clinical Tools. Append new entries during the shutdown routine so future sessions can resume without prior chat context.

---

### 2026-07-22 - Codex desktop - Dr. Troy's Killer Burgers PWA
- Completed: Built `dr-troys-killer-burgers/` as a bilingual TypeScript/static recipe PWA with persisted English/Spanish language, scale, custom amount, chile, and print settings; full/half/quarter/custom scaling; selected-chile ingredient rendering; substitution notes; print-only recipe sheets with a locally generated canonical QR code; scoped manifest/service worker; generated WebP/AVIF hero variants and PWA icons from the supplied artwork; and Vercel project configuration.
- Completed: Verified `npm.cmd run check`, `npm.cmd run verify:browser`, and `npm.cmd audit --audit-level=high`; browser verification covered phone/tablet/desktop screenshots, language persistence, chile persistence, print PDF canonical URL/no-localhost checks, and offline reload.
- In progress: Production Vercel deployment for the preferred `drtroyskillerburgers` slug remains pending.
- Blockers/notes: The local Vercel CLI reports an invalid stored token, and the connected Vercel deploy tool has no root-directory/project-slug argument, so it was not safe to deploy the existing `non-clinical` project as a substitute. `https://drtroyskillerburgers.vercel.app/` currently returns HTTP 404.

### 2026-07-02 - Codex desktop - Protected Psych Scheduler theme polish
- Completed: Cloned the missing `TroyFowlerMD/protected-schedules` source repo into `C:\Users\troyf\Documents\Codex\Projects\protected-schedules` after confirming `non-clinical/psych-scheduler.html` is only a forwarder to the protected Vercel route.
- Completed: Locally updated protected `psych-scheduler.html` so the Light theme is less bright, Light date inputs stay white/readable, the former Slate theme is labeled Dark, and the Dark/sidebar contrast is improved; the previous darkest theme is labeled Midnight.
- In progress: Changes are local in the protected source repo and need owner approval before commit/push because pushing updates the live protected schedule host.
- Blockers/notes: `npm.cmd run check` and inline script parse passed in `protected-schedules`. The repo directory sync also removed stale generated Phillips phone entries from protected generated blocks to match canonical `data/schedule-directory.json`.

### 2026-06-28 - Codex desktop - Sourdough workflow app
- Completed: Added `personal/sourdough-workflow.html` as a self-contained mobile-first sourdough workflow app with baker's math inputs, gram and approximate-volume outputs, starter contribution/effective hydration math, collapsible guidance, light/dark mode, and three print modes.
- Completed: Linked the new sourdough workflow from the public non-clinical hub `index.html`.
- In progress: Existing Psych Scheduler live Google Sheet startup and schedule-route guardrail tasks remain unchanged.
- Blockers/notes: Local in-app browser preview was blocked by `ERR_BLOCKED_BY_CLIENT`, so verification used Edge headless/CDP against the local file for mobile rendering, calculator interaction, default-collapsed directions, print-dialog availability, and overflow checks.

### 2026-06-10 - Codex desktop - Feedback migration status cleanup and experimental Psych alignment
- Completed: Confirmed `psych-scheduler-experimental.html` had been the one remaining stale feedback path, migrated it to the shared Vercel endpoint, and verified raw GitHub plus the live GitHub Pages experimental page now match the shared private-GitHub-Issues flow.
- Completed: Updated `TASKS.md`, `WORKLOG.md`, and `DECISIONS.md` so current schedule-app feedback status no longer describes live activation or `#IT` triage as if the old Google Sheet/FormSubmit inbox were still current.
- In progress: The live Google Sheet default-startup preservation task remains open as an ongoing guardrail.
- Blockers/notes: This cleanup pass was documentation/status work only; no new shared-feedback runtime implementation remained pending after the experimental page alignment.

### 2026-06-10 - Codex desktop - Shared GitHub Issues feedback migration
- Completed: Added `vercel-jfk/api/feedback.js` as the shared feedback endpoint for Psych Scheduler and JFK Med Staff Schedule, with exact-origin allowlisting, honeypot support, payload limits, simple IP rate limiting, submission-ID dedupe, GitHub issue creation, and consistent success/failure handling.
- Completed: Updated `psych-scheduler.html` and canonical `vercel-jfk/index.html` to submit feedback to the shared Vercel endpoint, warn users not to include patient details or passwords, preserve typed text on failure, and use one generated submission ID per attempt.
- Completed: Updated `AGENTS.md`, `README.md`, `DECISIONS.md`, `TASKS.md`, `docs/non-clinical-feedback-github-issues.md`, and `docs/psych-scheduler-it-request-inbox.md` so future `#IT` and scheduler-request triage use the private GitHub Issues inbox instead of the old Google Sheet/FormSubmit flow.
- Completed: Live end-to-end issue creation was later verified against the deployed Vercel project and private repo, and the experimental Psych page was aligned afterward so both live Psych pages now use the shared endpoint.
- Blockers/notes: Historical note: earlier in the rollout, private-repo access, PAT scope, and deployed Vercel env vars were the final verification dependencies. Those blockers are now cleared.

### 2026-06-10 - Codex desktop - Shared schedule directory source and Psych directory rollout
- Completed: Added `data/schedule-directory.json` as the canonical shared contact source and `scripts/sync-schedule-directory.mjs` to regenerate both app data blocks plus keep the two JFK alias HTML files synced to canonical `vercel-jfk/index.html`.
- Completed: Updated `psych-scheduler.html` to consume generated directory/contact data, added a full Directory view with shared provider/section content plus OTP/OBOT search, and added a mobile text/call contact sheet for directory entries.
- Completed: Switched the canonical JFK file to generated shared-directory blocks and wired future text/call overrides through `ACTION_PHONE_LOOKUP`.
- Completed: Historical status clarification: at the time of this directory rollout, shared GitHub Issues feedback migration remained the next schedule-app implementation project. That migration was completed later on 2026-06-10.
- Blockers/notes: Final verification should include `node scripts/sync-schedule-directory.mjs --check`, JavaScript syntax checks for both app script blocks, alias-file equality, and repo-wide stale-target searches before publish.

### 2026-06-09 - Codex desktop - Schedule route registry and med-staff forwarder cleanup
- Completed: Updated `psych-scheduler.html` and the public `index.html` hub card so current med-staff entrypoints now point directly to `https://non-clinical-lac.vercel.app/`.
- Completed: Replaced `jfk-med-staff-schedule-experimental-v2.html` with a thin legacy forwarder page and removed the stray `snippet_psych_scheduler_link.html` artifact.
- Completed: Added `docs/schedule-app-canonical-routes.md` as the canonical schedule-app routing registry and updated repo instructions to require registry-first checks for future route changes.
- In progress: The live Google Sheet default-startup preservation task remains open as an ongoing guardrail.
- Blockers/notes: Public verification should confirm the GitHub Pages Psych Scheduler page, the legacy forwarder page, the Vercel med-staff page, and the TroyMD dashboard card after push.

### 2026-05-22 - Codex desktop - Added `#IT` scheduler request command
- Completed: Added `#IT` and plain-language IT variants to `AGENTS.md` as aliases for opening the then-current Psych Scheduler Feedback tab and proposing actions.
- Completed: Updated `docs/psych-scheduler-it-request-inbox.md` with the expected active-request triage response shape.
- Completed: Recorded the command alias workflow decision in `DECISIONS.md`.
- In progress: The live Google Sheet default-startup preservation task remains open as an ongoing guardrail.
- Blockers/notes: This was documentation/instruction work only; no runtime app code or Apps Script deployment changed. Historical note: `#IT` now uses the private GitHub Issues inbox added on 2026-06-10 rather than the retired sheet-based request tab.

### 2026-05-22 - Codex desktop - Psych Scheduler mobile and FT Phone requests
- Completed: Updated production `psych-scheduler.html` so the My Schedule `Day / Date` column stays pinned during horizontal scrolling on mobile.
- Completed: Set the initial mobile default text size to 16px while keeping the desktop default at 17px.
- Completed: Updated the My Schedule `FT Phone` column to list all matched provider names and visually emphasize the currently selected provider when assigned.
- Completed: Kept `psych-scheduler-experimental.html` unchanged per production-only scope.
- In progress: The live Google Sheet default-startup preservation task remains open as an ongoing guardrail.
- Blockers/notes: No Apps Script redeploy was required; feedback request rows `PS-20260522-162705-6887e786` and `PS-20260522-163141-c8438d70` were the source requests for this work.

### 2026-05-22 - Codex desktop - Psych Scheduler data-source badge polish
- Completed: Updated production `psych-scheduler.html` so the data bar reports the active in-memory source as `Live.Sheet1`, `Pasted data`, or `Excel upload`.
- Completed: Added a 7-day stale warning for live Google Sheet timestamps while preserving paste, Excel, and Google Sheet fallback loading behavior.
- Completed: Kept `psych-scheduler-experimental.html` unchanged per production-only scope and left parser internals unchanged.
- In progress: The live Google Sheet default-startup preservation task remains open as an ongoing guardrail.
- Blockers/notes: The in-app browser blocked local localhost/file verification, so source-state behavior was verified with a Node harness plus a live Apps Script read; no Apps Script redeploy was required.

### 2026-05-22 - Codex desktop - Psych Scheduler IT request inbox and clasp setup
- Completed: Installed Node.js LTS and Google clasp, authenticated clasp as `troyfowlermd@gmail.com`, and cloned the Psych Scheduler Apps Script bridge into `apps-script/psych-scheduler-feedback/`.
- Completed: Updated the Apps Script bridge so it still serves `Sheet1` schedule reads and also logs feedback POSTs to a separate `Feedback` tab with email confirmation.
- Completed: Pointed `FEEDBACK_EXEC_URL` at the existing `DRIVE_EXEC_URL`, documented the future Codex IT request workflow, and added `scripts/clasp.cmd` / `scripts/clasp.ps1` wrappers for future Apps Script pushes.
- Completed: Pushed the Apps Script source and redeployed the existing live web app deployment to version 10 without changing the public URL.
- Completed: Added a token-protected `updateFeedbackStatus` Apps Script operation for future Codex triage/completion updates, generated the local ignored admin token, and marked the two Codex verification rows as `test`.
- Completed: Added other-computer setup helpers for Node.js/clasp/login/token verification, request status updates, and separate feedback-admin token provisioning; redeployed the Apps Script bridge to version 13 and generated an `other-computer` transfer token file under `.codex-local`.
- Completed: Sent Dr. Fowler a setup email for the other computer covering the GitHub Desktop/Codex bootstrap, Apps Script API/clasp login flow, and local token transfer; marked the email-generated feedback row as `test`.
- In progress: The live Google Sheet default-startup preservation task remains open as an ongoing guardrail.
- Blockers/notes: Live verification returned `Sheet1` with 947 rows, and a post-authorization feedback test returned `logged: true` and `emailed: true` with request ID `PS-20260522-161216-818010fb`. The setup-email request row was `PS-20260522-163833-ce767edb` and was closed as `test`.

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

### 2026-05-28 - Codex CLI - Added Psych Scheduler APK GitHub Actions workflow
- Completed: Added `.github/workflows/build-psych-apk.yml` to build a Capacitor Android debug APK from `psych-scheduler.html` with Psych Scheduler app ID/name and `INTERNET` permission enforcement in the manifest.
- In progress: Existing Psych Scheduler product tasks remain unchanged.
- Blockers/notes: `git pull --ff-only` could not run because local branch `work` has no upstream tracking configured in this Codex environment.

### 2026-06-06 - Codex CLI - Compact mobile schedule header
- Completed: Implemented GitHub issue #15 by replacing the separate Psych Scheduler source/update, upload, refresh, and display-control rows with one compact schedule toolbar containing the mobile menu button, date range, theme toggle, and text-size controls.
- Completed: Moved the last-updated timestamp into the sidebar near the upload latest schedule file workflow and renamed the dashboard column reset action to Reset page with date-range and column reset behavior.
- In progress: Existing live Google Sheet default-startup task remains open.
- Blockers/notes: Full headed browser screenshots at requested mobile widths could not be captured because this environment lacks an installed browser and Playwright's Chromium download was blocked by the network/proxy; jsdom interaction checks and JavaScript syntax checks passed.

### 2026-06-23 - Codex desktop - Dog Whistle Android APK scaffold and GitHub build
- Completed: Added `dog-whistle-android/` as a native Kotlin/Compose Android app with press-and-hold whistle playback, vibration and audible feedback options, a foreground playback service, and an experimental accessibility-service screen-off mode.
- Completed: Added `.github/workflows/build-dog-whistle-apk.yml`, fixed the Material theme dependency, pushed `main`, and verified a successful GitHub Actions run that uploaded the `dog-whistle-debug-apk` artifact for commit `4df18a7`.
- In progress: Real-device testing still needs to confirm speaker behavior at 19 kHz, vibration feel, and whether the accessibility volume-button mode behaves acceptably on the target phone.
- Blockers/notes: Stock Android still does not provide a true per-app above-device-max speaker override; the shipped build uses normal media max plus in-app whistle gain within platform limits.
