<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# Excel Drag-and-Drop Ingestion Added To Psych Scheduler

## What Changed
- Added SheetJS (`xlsx@0.18.5`) via CDN in `<head>`
- New UI: drag-and-drop zone + **Browse file** button in the Paste & Parse view
- Added `handleExcelDrop()` and `handleExcelFile()` to the script block
- Sheet selected by **index 0**, not by name - handles tab name mismatch between Excel staff schedule and Google Sheet
- All three ingestion paths (paste, Drive, Excel) now converge on `parseRawData()`
- No changes to parsing logic required

## Files Touched
- `psych-scheduler.html` (4 edits in a single commit)

## Commit
- `58eda12` on `main` - feat: add Excel drag-and-drop ingestion (SheetJS, index-0 sheet)
- [View commit](https://github.com/TroyFowlerMD/non-clinical/commit/58eda1273702d9bbd9b512053071fc0fb4e53bf4)

## Deploy
- [psych-scheduler.html (live)](https://troyfowlermd.github.io/non-clinical/psych-scheduler.html)

## Notes for Next Session
Pre-implementation file was at post-revert known-good state (`288b1ea`), itself a revert of `33bd501` (post-call classification fix). The Excel ingestion change is orthogonal to the post-call regression - that work is still tracked in Asana task `1214699709015530` and not addressed here.
