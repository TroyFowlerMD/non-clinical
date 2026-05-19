<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# 2026-05-11 - Psych Scheduler Column Toggles + Backup Call Buttons + Auto-Deselect

## Context
Troy reported that the Carter and Ondreyka buttons on the My Schedule page were non-functional and asked for equivalent buttons for the remaining core psych staff (Anderson, Fowler, Smith, Cooley), plus Working Providers / Total Staff buttons on the Backup Call page, plus verification of column auto-deselect on provider switch.

## Root Cause
The `carter` and `ondreyka` chips were wired into `schedToggleCol()` correctly via `PICKER_ORDER`, but `schedCell()` referenced an undefined `poolCell(...)` function. Toggling either chip on threw a ReferenceError that broke the entire My Schedule table render. This had been silently broken since the col-toggle chip system landed.

Also noticed a pre-existing typo in `PICKER_ORDER`: the entry `'thinRun'` did not match the `'streak'` column id, so the Thin Run chip never rendered. Fixed.

## Changes (commit 28f6343)
**My Schedule (`SCHED_COLS_ALL`, `schedCell`, `PICKER_ORDER`):**
- Added column entries + `schedCell` cases for Anderson, Fowler, Smith, Cooley using `providerCell(...)`.
- Replaced broken `poolCell(...)` calls for Carter and Ondreyka with `providerCell(...)`.
- Added all four new IDs to `PICKER_ORDER` and corrected `'thinRun'` to `'streak'`.

**Backup Call page (`view-backup`, `renderBackup`):**
- Added a `col-panel` chip group above the table with two toggles: Working Providers, Total Staff Core+Temp. Styled identically to My Schedule chips. Default off.
- New module-level state `bkpShowProviders` / `bkpShowStaffTotal`, plus `bkpToggleCol()` and `renderBkpColPicker()`.
- `renderBackup()` now conditionally injects the two columns into the header and each row.

**Provider switcher (`onProviderChange`):**
- Confirmed: the previous implementation did not auto-deselect the matching column chip on switch (would have produced duplicate column data with the My Assignment column). Implemented: on switch, splice the chip whose id matches `prov.toLowerCase()` out of `schedActiveCols`, then re-render the picker and dashboard.

## Preserved Verbatim
`parseTSVRobust()` and `parseAndLoad()` untouched.

## Verification
- `node` syntax check on the inlined script block passes (73 KB, no parse errors).
- File grew from 125,956 bytes (2436 lines) to 129,265 bytes (2497 lines).
- Pushed `db3fa89..28f6343` to `main`; GitHub Pages will redeploy automatically.

## Live
[https://troyfowlermd.github.io/non-clinical/psych-scheduler.html](https://troyfowlermd.github.io/non-clinical/psych-scheduler.html)

## Repo
[https://github.com/TroyFowlerMD/non-clinical/commit/28f6343](https://github.com/TroyFowlerMD/non-clinical/commit/28f6343)

## 2026-05-19 Follow-up
- Added a separate My Schedule table-control button: "Show only PTO feasible".
- The button filters rows to the selected provider's current `ptoRisk === 'Feasible'`, excluding caution, not feasible, and weekend rows.
- This is a row filter, not another visible table column, and it preserves the existing column-toggle system.
