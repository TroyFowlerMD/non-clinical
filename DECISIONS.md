# Decisions

This file records durable architectural, workflow, safety, and publishing decisions for Non-Clinical Tools. Each entry should include Context, Decision, Rationale, and Consequences.

---

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
