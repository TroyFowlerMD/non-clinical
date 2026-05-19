# Tasks - non-clinical

## Status Key
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked - include reason in parentheses

## Active Tasks
- [~] Investigate Psych Scheduler mobile vs. desktop divergence: desktop correctly ignores non-psych staff, mobile still includes them. Status is ambiguous in Notion, but it is explicitly called a known open bug.
- [~] Keep Psych Scheduler default startup tied to the live Google Sheet while preserving paste/Excel fallback behavior.

## Upcoming
- [ ] Confirm Psych Scheduler stale-data badge / data-source polish, including `Live.Sheet1` vs pasted-state display.
- [ ] Document Apps Script redeployment cadence for Psych Scheduler when Sheet structure or deployment URL changes.
- [ ] Consider future `non-clinical` organization into `personal/` and `professional/` sections or repos.
- [ ] Re-test public non-clinical hub links after future dashboard or repo-routing changes.

## Completed (last 30 days)
- [x] Added Psych Scheduler Excel drag-and-drop ingestion via SheetJS.
- [x] Fixed Excel ingestion FileList-to-File bug.
- [x] Reworked Excel ingestion so it routes through existing `parseAndLoad()` and real app globals.
- [x] Added Psych Scheduler feedback logging modal with dual-submit behavior.
- [x] Fixed Psych Scheduler post-call staffing count bug by excluding post-call cells from working-provider lists.
- [x] Added My Schedule provider column toggles and Backup Call optional columns.
- [x] Consolidated duplicate Psych Scheduler Notion project pages.

## Backlog
- [ ] Re-diagnose post-call classification logic before any future global reclassification attempt; previous attempt broke the page and was reverted.
- [ ] Continue parser hardening for full-sheet variation and stale-data edge cases.
- [ ] Audit whether Asana/maintenance-request tracking still matches the current GitHub source of truth.
