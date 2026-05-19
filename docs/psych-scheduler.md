<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# Psych Scheduler

## Snapshot
Personal non-clinical scheduling tool for the psych team at JFK ADATC. Pulls the medical staff schedule from a Google Sheet via Apps Script or falls back to Excel TSV paste. Presents psych-only views: daily staffing, backup call risk, PTO evaluator, provider profile switcher (Patil, German, Anderson, Fowler, Carter, Ondreyka, Smith, Cooley), calendar, and date-range filter. Contained in the `TroyFowlerMD/non-clinical` repo alongside other non-clinical personal tools. This repo/hub is linked from the TroyMD personal dashboard.

## Current Status
Current deployed file is `psych-scheduler.html` on `main` at commit `28f6343`. Core v3.1 scheduling features remain intact: live Google Sheets pull, TSV/Excel paste fallback, provider profile switcher, date-range filter, PTO/backup call risk views, mobile nav (hamburger/overlay), XLSX ingestion, theme toggle, and font-size controls. Maintenance layer: sidebar `Send Feedback` modal dual-submits maintenance requests through FormSubmit email and the Apps Script JSON logger to the maintenance-request Google Sheet.

**My Schedule column system now covers all six core providers:** Anderson, Fowler, Carter, Ondreyka, Smith, Cooley each have a column-toggle chip rendering via `providerCell()`. Pre-existing Carter/Ondreyka chips were silently broken (referenced an undefined `poolCell()`) and are now functional. **Backup Call page** has its own column-toggle chip group for `Working Providers` and `Total Staff Core+Temp`, default off. **Provider switcher** auto-deselects the active column chip matching the newly selected provider to prevent duplicate data with the My Assignment column.

**Known open bug remains:** mobile vs. desktop divergence - desktop correctly ignores non-psych staff; mobile still includes them. Suspected stale cache or render-path divergence.

## 2026-05-14 Consolidation Note
No direct Psych Scheduler code changes were made during the broader repo-consolidation pass. The surrounding repo context **did** change locally:
- `non-clinical` was cloned locally and its hub page was reorganized to better reflect a likely future `professional` / `personal` split
- `my-dashboard` was confirmed as the real active public hub repo, distinct from the minimal `troyfowlermd.github.io` root repo
- the Google Sheets backend was re-confirmed as `Medical Staff Schedule ANALYSIS SHEET`, tab `Sheet1`

These surrounding repo/hub updates are still local only and have not been committed or pushed yet.

## Architecture Map
**Layer structure:**
- **UI:** Single self-contained HTML file. No server, no build tools, no framework, no localStorage (sandboxed-iframe constraint). All state in memory. External dependency: Google Fonts (Inter + JetBrains Mono).
- **Apps Script bridge:** Deployed Google Apps Script Web App at URL hardcoded as `DRIVE_EXEC_URL` in the HTML. Returns JSON `{headers, rows, sheetName, fetchedAt, rowCount}`. Deployment access set to "Anyone" to resolve CORS on `fetch()`.
- **Google Sheets backend:** Source spreadsheet `Medical Staff Schedule ANALYSIS SHEET`, tab `Sheet1`, columns A-AD. Stable Sheet ID enables auto-update on re-upload.
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
- Apps Script CORS resolved by deployment access set to "Anyone" - do not change without simultaneously replacing the access model.
- `DRIVE_EXEC_URL` is hardcoded in the HTML; update it whenever Apps Script is redeployed to a new URL.
- Preserve `parseTSVRobust()` and `parseAndLoad()` verbatim during surgical patches - these were fragile historically.

## Open Questions / Decisions Pending
- **Mobile/desktop divergence** - desktop ignores non-psych staff correctly; mobile still includes them. Root cause not confirmed (stale cache vs. render-path divergence). Needs investigation.
- **Parser hardening** - ongoing concern for full-sheet variation and stale-data edge cases.
- **Stale-data badge / data-source polish** - `Live.Sheet1` vs Pasted badge and stale-data timestamp were v3 polish items; confirm current state.
- **Apps Script redeployment cadence** - no documented policy for when/how to redeploy when Sheet structure changes.

## Reversals & Lessons
- **Paste-only to live Google Sheet** - original tool was paste-only; Apps Script Web App added in v2-16. API key alternative rejected to avoid public key exposure in client-side HTML.
- **Per-provider flag fields to unified pcFlags/bkpFlags** - data model consolidated from per-provider named fields to unified `pcFlags` and `bkpFlags` objects.
- **Exception Flags view removed** - replaced by integrated PTO/Backup risk views.
- **parseTSVRobust() preservation rule** - introduced after a surgical patch accidentally broke paste recognition; now treated as untouchable verbatim during patches.

## External References
- Repo: [TroyFowlerMD/non-clinical](https://github.com/TroyFowlerMD/non-clinical)
- Live: [psych-scheduler.html](https://troyfowlermd.github.io/non-clinical/psych-scheduler.html)
- Google Sheet: `Medical Staff Schedule ANALYSIS SHEET`, tab `Sheet1`, cols A-AD

Apps Script deployment URL (`DRIVE_EXEC_URL`) is sensitive. Do not paste it into this page.
