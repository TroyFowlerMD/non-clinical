# Decisions

This file records durable architectural, workflow, safety, and publishing decisions for Non-Clinical Tools. Each entry should include Context, Decision, Rationale, and Consequences.

---

### 2026-05-21 - Keep My Schedule Provider Assignments In A Left-Side Block
Context: My Schedule users can remove and re-add the selected-provider assignment column and individual provider schedule columns. Re-added columns could move to the far right, away from the day/date and selected-provider context.
Decision: Normalize My Schedule column order after toggle, all-provider toggle, drag/drop, reset, PTO-only restore, and provider-profile changes so Day / Date stays first, the selected-provider assignment column stays second when enabled, and individual provider schedule columns stay immediately after it.
Rationale: This keeps the assignment columns visually grouped where providers compare schedules, while leaving Working Providers as a separate summary column.
Consequences: Future My Schedule column changes should route through the shared ordering helper and verify sticky header alignment after re-render.

### 2026-05-21 - Use A Cloned Header For Dashboard Sticky Scrolling
Context: The My Schedule dashboard table needs horizontal table scrolling and a header that appears only when the real table header reaches the top of the `.main` scroll viewport. Native `position: sticky` was unreliable because the horizontal overflow wrapper became the nearest scroll container and the header still scrolled away.
Decision: Keep the real dashboard table in normal page flow, render its header normally, and show a lightweight fixed cloned header only while the real header has crossed the top of `.main`. Sync the clone to the real table's column widths and horizontal scroll position using dashboard-only scroll/resize listeners plus a lightweight active-dashboard layout sync loop.
Rationale: This preserves the single-file app and horizontal scrolling while avoiding the browser sticky/overflow conflict that caused repeated failed fixes.
Consequences: Future My Schedule column/header changes should verify the cloned header remains aligned after table re-render, horizontal scroll, desktop width, and mobile width.

### 2026-05-20 - Keep Staffing Command Center Work In A Separate Experimental Page
Context: The production Psych Scheduler page is the live staffing tool and needed to remain stable while a more ambitious analytics interface was requested.
Decision: Clone production into `psych-scheduler-experimental.html` and keep experimental mode defaults, staffing-risk summary cards, and canvas timeline work there instead of redesigning `psych-scheduler.html`.
Rationale: A separate static page lets the owner test richer operational analytics against the same live Google Sheet and fallback ingestion paths without putting the production scheduler at risk.
Consequences: Production remains available at `psych-scheduler.html`; future command-center changes should land in the experimental file until explicitly promoted.

### 2026-05-20 - Feedback Success Requires Confirmed Email Delivery
Context: The Psych Scheduler feedback modal could show a green success message when only an unconfirmed no-CORS logger request completed, while the owner did not receive email.
Decision: Treat the feedback Apps Script as the primary owned email/log path and require JSON confirmation with `emailed: true` before showing full success. Keep FormSubmit only as a confirmed email fallback, and reserve the no-CORS Apps Script request for warning-state backup logging.
Rationale: A static GitHub Pages app cannot prove an opaque no-CORS request sent email, so the UI should not clear the form or claim success from that path alone.
Consequences: The deployed feedback Apps Script must send the email and return the documented response contract in `docs/psych-scheduler-feedback-apps-script-contract.md`; otherwise users will see a warning or depend on FormSubmit availability.

### 2026-05-11 - Preserve Psych Scheduler Parser During Surgical Patches
Context: Several Psych Scheduler fixes touched UI, columns, and ingestion paths, while parser regressions had previously broken paste recognition.
Decision: Preserve `parseTSVRobust()` and `parseAndLoad()` verbatim during surgical patches unless the task explicitly targets parsing.
Rationale: These functions are fragile and shared by paste, Drive, and Excel ingestion paths.
Consequences: Future patches should route new ingestion behavior through existing parser/loading helpers rather than rewriting parser internals.

### 2026-05-11 - Excel Ingestion Uses Existing App Loading Path
Context: Initial Excel ingestion code referenced missing globals/helpers and emitted comma-delimited output that did not work with the TSV parser.
Decision: Convert the first workbook sheet to TSV manually and route through `parseAndLoad()`.
Rationale: This reuses the same `DATA` assignment, `onDataLoaded()`, and visible result reporting used by the paste flow.
Consequences: New file-ingestion work should verify referenced globals and helper functions against the current single-file app before commit.

### 2026-05-11 - Post-Call Exclusion Belongs In Working-Provider Lists
Context: A global post-call reclassification attempt broke the deployed page and had to be reverted.
Decision: Exclude post-call cells at `workingCore` / `workingTemp` list construction or an equivalent availability helper, not by changing global classification or parser behavior.
Rationale: The targeted fix solved staffing counts without disrupting broader classification behavior.
Consequences: Future post-call changes should avoid broad parser/classifier rewrites unless fully tested.

### 2026-05-11 - Keep One Canonical Psych Scheduler Project Page
Context: Notion had duplicate Psych Scheduler project pages.
Decision: Keep the newer detailed Psych Scheduler page active and convert the older duplicate to an archived redirect note.
Rationale: Avoids two active sources of truth while preserving old references.
Consequences: GitHub docs should now become the durable source of truth for this project context.

### 2026-05-14 - Default To Live Google Sheet With Fallback Ingestion
Context: Psych Scheduler evolved from paste-only to a live Google Sheets-backed workflow, while fallback ingestion remains important.
Decision: Use the live Google Sheet as the default entry source and keep paste/Excel fallback paths available.
Rationale: The live Sheet reduces manual loading while preserving resilience if the bridge fails or stale data is suspected.
Consequences: Startup/loading changes should preserve `loadFromDrive()` behavior and fallback UI rather than replacing the ingestion model.

### 2026-05-19 - Feedback Modal Keeps A Maintenance-Log Fallback
Context: The feedback modal was showing a user-facing failure when the current email-only FormSubmit path failed.
Decision: Keep feedback submission as a dual-path workflow: FormSubmit email plus the maintenance-request Apps Script logger. Send the Apps Script request in a no-CORS-compatible shape from the static GitHub Pages app.
Rationale: Psych Scheduler has no backend server, so the modal needs at least one browser-safe external path to accept maintenance requests.
Consequences: Future feedback changes should preserve an independent maintenance-log fallback and should be browser-tested from the static page context before publishing.

### 2026-05-19 - Keep Personal Educational Pages Under personal/
Context: The repo needed a public plain-English Power of Attorney guide that is non-clinical and family-facing.
Decision: Place standalone personal educational pages under `personal/`, starting with `personal/poa-guide.html`.
Rationale: This keeps personal/family utilities separate from the root-level app pages without splitting the single static GitHub Pages repo.
Consequences: Future personal pages should use the `personal/` path unless a larger reorganization is explicitly chosen.

### 2026-05-19 - Allow Local Checklist State For Personal Guides
Context: The POA logistics guide is a browser-only checklist and should not lose checked items on the same device.
Decision: Use browser localStorage only for non-sensitive checkbox completion state on personal checklist pages.
Rationale: This improves usability without sending data anywhere or storing names, account numbers, or form contents.
Consequences: Future checklist persistence should avoid storing sensitive details and should remain local to the user's device unless explicitly redesigned.

### 2026-05-21 - Prefer PR + Squash-Merge For Codex Cloud Activation
Context: Codex Cloud workspaces can have missing push/remote wiring, which can make direct push-based activation inconsistent and confusing for the owner.
Decision: Default Codex Cloud publishing to PR-based activation: Codex commits and opens a PR; Dr. Fowler squash-merges on GitHub to activate changes on `main`. Use manual single-file GitHub upload/commit only when PR push is unavailable.
Rationale: This keeps activation steps consistent, easy to explain, and aligned with GitHub as source of truth while preserving a practical fallback path.
Consequences: Future shutdown summaries should explicitly state whether activation is pending merge, merged, or manually committed in GitHub.

### 2026-05-22 - Explain Repo Work With Beginner Context
Context: Dr. Fowler is new to Git, GitHub, GitHub Desktop, Codex, and local-vs-remote repository workflows.
Decision: Codex should explain repo work with extra beginner-friendly context by default, including definitions, why each step matters, exact local paths/button names when useful, and a clear distinction between local files, local commits, pushed GitHub commits, pull requests, and deployed site changes.
Rationale: Better context reduces accidental duplicate clones, OneDrive/Git confusion, and uncertainty about whether work is local, synced, or live.
Consequences: Future repo instructions and shutdown summaries should favor plain outcome language and step-by-step guidance over unexplained Git shorthand.

### 2026-05-22 - Surface Workflow Streamlining Opportunities
Context: Dr. Fowler wants Codex to notice chances to make his coding, GitHub, GitHub Desktop, deployment, and cross-machine workflows smoother.
Decision: When Codex sees a practical workflow improvement, it should present the opportunity proactively with the expected benefit, any risk or cost, and the smallest safe next step.
Rationale: Small workflow improvements compound, especially while Dr. Fowler is learning Git and using Codex across multiple machines.
Consequences: Future sessions should separate optional workflow suggestions from required task work so recommendations help without derailing the current task.

### 2026-05-22 - Keep Cross-Computer Setup Guide In non-clinical
Context: Dr. Fowler uses Codex Desktop and GitHub Desktop across multiple Windows computers and wants a repeatable way to mirror local project setup without OneDrive.
Decision: Keep the workstation setup checklist and helper script in `TroyFowlerMD/non-clinical` under `docs/windows-codex-github-workstation-setup.md` and `scripts/setup-codex-projects.ps1`.
Rationale: `non-clinical` is a familiar durable repo that is already part of the shared active-project set and can bootstrap the rest of the repos on a new machine.
Consequences: On a new computer, clone `non-clinical` first, then use its setup guide/script to clone or update the other active repos under `Documents\Codex\Projects`.
