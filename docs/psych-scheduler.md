<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# Psych Scheduler

## Snapshot
Personal non-clinical scheduling tool for the psych team at JFK ADATC. Pulls the medical staff schedule from a Google Sheet via Apps Script or falls back to Excel TSV paste. Presents psych-only views: daily staffing, backup call risk, PTO evaluator, provider profile switcher (Patil, German, Anderson, Fowler, Carter, Ondreyka, Smith, Cooley), calendar, and date-range filter. Contained in the `TroyFowlerMD/non-clinical` repo alongside other non-clinical personal tools. This repo/hub is linked from the TroyMD personal dashboard.

## Current Status
Current deployed production file is `psych-scheduler.html` on `main`. Core v3.1 scheduling features remain intact: live Google Sheets pull, TSV/Excel paste fallback, provider profile switcher, date-range filter, PTO/backup call risk views, mobile nav (hamburger/overlay), XLSX ingestion, theme toggle, and font-size controls. Maintenance layer: sidebar `Send Feedback` now submits to the shared Vercel endpoint at `https://non-clinical-lac.vercel.app/api/feedback`, which creates private issues in `TroyFowlerMD/non-clinical-feedback`.

Shared directory layer: production `psych-scheduler.html` now includes a full Directory view backed by generated data from `data/schedule-directory.json`. The same canonical contact source also feeds the JFK Med Staff Schedule Vercel app, with `scripts/sync-schedule-directory.mjs` regenerating both apps' inline directory blocks and keeping the JFK alias HTML files synced to canonical `vercel-jfk/index.html`.

Experimental command-center clone: `psych-scheduler-experimental.html` is a separate single-file clone that keeps the same live Google Sheet default and fallback ingestion while adding mode-specific table defaults, staffing-risk analytics cards, and a canvas-based risk timeline. This file is intentionally separate from production until Dr. Fowler explicitly chooses to promote any experimental behavior.

**My Schedule column system now covers all six core providers:** Anderson, Fowler, Carter, Ondreyka, Smith, Cooley each have a column-toggle chip rendering via `providerCell()`. Pre-existing Carter/Ondreyka chips were silently broken (referenced an undefined `poolCell()`) and are now functional. **Backup Call page** has its own column-toggle chip group for `Working Providers` and `Total Staff Core+Temp`, default off. **Provider switcher** auto-deselects the active column chip matching the newly selected provider to prevent duplicate data with the My Assignment column.

**Mobile/desktop provider-list divergence investigated 2026-05-21:** current live desktop rendering and 375px mobile rendering both use the same working-provider output and do not include known medical-staff columns such as Griffith, Millonas, Kuetemeyer, Nolan, Moore, King, Edwards, Ramirez, Poetter, Dill, DeBell, McKay, Wolf, or Cruz. The older open bug appears stale rather than currently reproducible.

## 2026-05-22 Mobile My Schedule and FT Phone Request Note
The production My Schedule view now pins the `Day / Date` column during mobile horizontal scrolling, starts mobile browsers at 16px text while preserving the 17px desktop default, and renders the `FT Phone` column as matched provider names instead of a Fowler-only Yes/blank flag. The selected provider is highlighted in that column when they are the FT Phone assignee; other assignees remain normal text.

## 2026-06-10 Shared Feedback Inbox Note
Psych Scheduler now shares the same feedback intake path as the JFK Med Staff Schedule app. Both apps submit to `vercel-jfk/api/feedback.js`, which applies exact-origin checks, a honeypot field, payload limits, simple IP rate limiting, and submission-ID dedupe before creating a private GitHub issue. On failure, the modal keeps the user's typed text in place and shows a retry message instead of falsely claiming success.

## 2026-05-20 Feedback and PTO Column Note
This note is now historical. The older Apps Script + FormSubmit feedback confirmation flow has been retired in favor of the shared GitHub Issues inbox described above.

The My Schedule "Show only PTO feasible" filter now switches the visible columns to the PTO review set: selected provider, call, trainees, total staff/core+temp, working providers, and PTO feasible. Turning the filter off restores the user's prior columns.

## 2026-05-20 Experimental Command Center Clone
Created `psych-scheduler-experimental.html` from the current production app without changing production `psych-scheduler.html`. The experimental clone adds seven mode buttons near table controls: My Schedule, PTO Planner, Critical Coverage, Hospital Coverage, Staffing Trends, Call Burden, and Provider Balance.

Each mode applies a default column set while leaving the column picker available. PTO Planner defaults to selected provider assignment, call, trainees, total staff/core+temp, working providers, and PTO feasible; it does not show the selected provider's own separate name column.

The experimental page adds eight analytics cards and a full-width canvas staffing-risk timeline. Staffing risk uses the current schedule counts only: weekday minimum is 4 usable psych providers, weekends/holidays keep their separate lower threshold, temp reliance is flagged when the threshold is reached only because temp/PRN providers are included, and no fake census values are invented.

## 2026-05-14 Consolidation Note
No direct Psych Scheduler code changes were made during the broader repo-consolidation pass. The surrounding repo context **did** change locally:
- `non-clinical` was cloned locally and its hub page was reorganized to better reflect a likely future `professional` / `personal` split
- `my-dashboard` was confirmed as the real active public hub repo, distinct from the minimal `troyfowlermd.github.io` root repo
- the Google Sheets backend was re-confirmed as `Medical Staff Schedule ANALYSIS SHEET`, tab `Sheet1`

These surrounding repo/hub updates are still local only and have not been committed or pushed yet.

## Architecture Map
**Layer structure:**
- **UI:** Single self-contained HTML file. No server, no build tools, no framework, no localStorage (sandboxed-iframe constraint). All state in memory. External dependency: Google Fonts (Inter + JetBrains Mono).
- **Shared directory source:** `data/schedule-directory.json` is the single editable contact/directory source for Psych Scheduler and JFK Med Staff Schedule. `scripts/sync-schedule-directory.mjs` rewrites generated blocks inside both apps; neither app fetches directory JSON at runtime.
- **Apps Script bridge:** Deployed Google Apps Script Web App at URL hardcoded as `DRIVE_EXEC_URL` in the HTML. Returns JSON `{headers, rows, sheetName, fetchedAt, rowCount}` for `Sheet1`. Feedback logging to the old `Feedback` tab is retired.
- **Shared feedback endpoint:** `vercel-jfk/api/feedback.js` accepts Psych Scheduler and JFK Med Staff Schedule feedback, then creates private issues in `TroyFowlerMD/non-clinical-feedback`.
- **Google Sheets backend:** Source spreadsheet `Medical Staff Schedule ANALYSIS SHEET`, tab `Sheet1`, columns A-AD. `Sheet1` remains the schedule source. The old `Feedback` tab is no longer the operational request inbox.
- **Fallback ingestion:** Excel TSV paste via `parseTSVRobust()` (quoted-field, multiline Excel cells).

**Parser:**
- `parseTSVRobust()` - robust quoted-field/multiline TSV parser
- `buildColMap()` + `INFRA_MATCHERS` - name-based column detection
- Parser ignores columns left of `Med Staff Overnight Coverage`; right of that is the psych section
- Pharmacy On Call to Residents/Fellowships = permanent staff; right of Residents/Fellowships = temp; Patil/German treated as temp

**Versioning convention:** `psych-scheduler-<major>-<iter>.html` during development; deployment strips suffix to `psych-scheduler.html`.

**Provider profile switcher (v3):** `CORE_PROVIDERS` = Patil, German, Anderson, Fowler, Carter, Ondreyka, Smith, Cooley. Recomputes PTO risk excluding selected provider + post-call peers.

## Code Conventions
- Versioned filename during dev: `psych-scheduler-<major>-<iter>.html`; deployed copy always `psych-scheduler.html` (suffix stripped).
- No localStorage; all state in memory - sandboxed-iframe constraint. Do not introduce localStorage without replacing the access model.
- Apps Script CORS resolved by deployment access set to "Anyone" for schedule-data reads - do not change without simultaneously replacing the access model.
- `DRIVE_EXEC_URL` is hardcoded in the HTML; update it whenever Apps Script is redeployed to a new URL.
- Feedback submission should use `FEEDBACK_API_URL = 'https://non-clinical-lac.vercel.app/api/feedback'`; do not restore FormSubmit or the old Apps Script feedback POST path as an active intake without an explicit decision update.
- Preserve `parseTSVRobust()` and `parseAndLoad()` verbatim during surgical patches - these were fragile historically.

## Open Questions / Decisions Pending
- **Parser hardening** - ongoing concern for full-sheet variation and stale-data edge cases.
- **Stale-data badge / data-source polish** - `Live.Sheet1` vs Pasted badge and stale-data timestamp were v3 polish items; confirm current state.
- **Apps Script redeployment cadence** - no documented policy for when/how to redeploy when Sheet structure changes.
- **Private feedback repo / Vercel secret verification** - if `TroyFowlerMD/non-clinical-feedback` access or the Vercel feedback env vars are missing, live end-to-end issue creation stays blocked until those external prerequisites are confirmed.

## Reversals & Lessons
- **Paste-only to live Google Sheet** - original tool was paste-only; Apps Script Web App added in v2-16. API key alternative rejected to avoid public key exposure in client-side HTML.
- **Per-provider flag fields to unified pcFlags/bkpFlags** - data model consolidated from per-provider named fields to unified `pcFlags` and `bkpFlags` objects.
- **Exception Flags view removed** - replaced by integrated PTO/Backup risk views.
- **parseTSVRobust() preservation rule** - introduced after a surgical patch accidentally broke paste recognition; now treated as untouchable verbatim during patches.

## External References
- Repo: [TroyFowlerMD/non-clinical](https://github.com/TroyFowlerMD/non-clinical)
- Live: [psych-scheduler.html](https://troyfowlermd.github.io/non-clinical/psych-scheduler.html)
- Google Sheet: `Medical Staff Schedule ANALYSIS SHEET`, tab `Sheet1`, cols A-AD

Apps Script deployment URL (`DRIVE_EXEC_URL`) and the private feedback PAT remain sensitive. Do not paste either into this page.
