<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# Hotfix 2: Excel Ingestion In Psych Scheduler Now Actually Works

## What Was Broken
1. Handler referenced `scheduleData` - not a real variable in this codebase. Real global is `DATA`.
2. Handler called `showParseResult(...)` - not a real function. Real helper is `showResult(el, type, msg)`.
3. `XLSX.utils.sheet_to_csv(sheet, {FS:'\t'})` was emitting commas in this SheetJS version, so `parseTSVRobust()` (which only splits on `\t`/`\n`) collapsed every row to a single cell.
4. Drop zone handled `dragover` but not `dragenter`, and there was no window-level guard, so the browser's default file-open behavior reasserted on missed drops.

## Symptom Matrix (Before Hotfix 2)
| Path | Visible behavior | Real cause |
|---|---|---|
| Drag-drop | Card appeared, nothing happened on drop | drop event never reached our handler (no dragenter preventDefault) |
| Browse file | File picker opened, page silent after selection | parseRawData returned an empty array because every row was one comma-jammed cell; then `scheduleData.length` threw ReferenceError, silently caught |

## What's Fixed
- New helper `__sheetToTSV()` reads the AoA via `sheet_to_json({header:1, raw:false, defval:''})` and joins with literal `\t` / `\n`, quoting any cell that contains tab / newline / quote.
- Handler now routes through the existing `parseAndLoad()`, which assigns to `DATA`, calls `onDataLoaded()`, and reports via `showResult()` - the exact same path the paste flow uses.
- Added `ondragenter` to the drop zone.
- Added window-level `dragenter` / `dragover` / `drop` preventDefault guards in the DOMContentLoaded handler so missed drops don't navigate the page away.
- All user-facing reporting goes through new helper `__excelReport()` which calls the real `showResult()`.

## Verification
Dry-run in Node against a synthetic workbook with:
- Non-`Sheet1` tab name (`Sched-Export 5.11`) - index-0 selection chose it correctly
- Multiline-embedded-newline cell - quoted + recovered by `parseTSVRobust`
- Embedded double-quote in cell - escaped + recovered
- 4 date rows expected - 4 parsed

Post-commit grep confirms: 0 references to `scheduleData`, 0 references to `showParseResult`, both file paths use `files[0]`, `__sheetToTSV` defined, `ondragenter` on zone, window-level drag guard installed.

## Commits
- `58eda12` - feat (introduced bugs)
- `601fcde` - hotfix 1 (FileList to File only)
- `f6b9a78` - [hotfix 2 - actual fix](https://github.com/TroyFowlerMD/non-clinical/commit/f6b9a7834db5b6af22be4df9586dde4244c8d8ff)

## Lesson - Add to Preferences & Patterns
When a user-provided spec contains code that references global symbols or helper functions, **verify those symbols actually exist in the target file during Step 1** before committing. Specifically grep for:
- Every global variable referenced (e.g. `scheduleData` vs real `DATA`)
- Every helper function called (e.g. `showParseResult` vs real `showResult`)
- Any library API option whose support is version-dependent (e.g. `XLSX.utils.sheet_to_csv` `FS` option)

If any of these don't resolve, flag during Step 1 verification and reconcile with the user before writing.
