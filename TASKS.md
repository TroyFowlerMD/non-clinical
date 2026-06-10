# Tasks - non-clinical

## Status Key
- [ ] Not started
- [~] In progress
- [x] Complete
- [!] Blocked - include reason in parentheses

## Active Tasks
- [~] Keep Psych Scheduler default startup tied to the live Google Sheet while preserving paste/Excel fallback behavior.
- [~] Keep `docs/schedule-app-canonical-routes.md` current whenever schedule-app URLs, hosts, or repo ownership change.

## Upcoming
- [ ] Consider future `non-clinical` professional section organization if more professional utilities are added.
- [ ] Re-test public non-clinical hub links after future dashboard or repo-routing changes.
- [ ] If the JFK Med Staff Schedule Vercel hostname changes later, update the canonical registry, live entrypoints, and legacy forwarder in one publish.

## Completed (last 30 days)
- [x] Repointed Psych Scheduler and non-clinical hub med-staff entrypoints to `https://non-clinical-lac.vercel.app/`, replaced the old GitHub Pages med-staff page with a forwarder, and added a canonical schedule-route registry.
- [x] Implemented GitHub issue #15 compact Psych Scheduler mobile schedule header with sidebar last-updated timestamp and Reset page behavior.
- [x] Added `#IT` as the Psych Scheduler Feedback-tab triage command so Codex reports active requests and proposes actions.
- [x] Resolved active Psych Scheduler feedback requests for mobile My Schedule date-column pinning, 16px mobile default text, and all-provider FT Phone display.
- [x] Confirmed and polished Psych Scheduler production data-source display so live Sheet, pasted data, and Excel uploads show distinct source states with a 7-day stale Sheet warning.
- [x] Added other-computer bootstrap support for Psych Scheduler Apps Script editing, clasp login, feedback admin token verification, and request status updates.
- [x] Cloned the Psych Scheduler Apps Script bridge into the repo with clasp tooling, redeployed the existing web app to version 10, and verified Feedback tab logging plus email confirmation.
- [x] Reduced Psych Scheduler's default text size to 17px and kept My Schedule individual-provider columns grouped immediately after the selected-provider assignment column.
- [x] Repaired Psych Scheduler My Schedule scrolling behavior so the dashboard table header sticks at the top of the app viewport after the real header reaches it, while preserving horizontal table scrolling.
- [x] Investigated Psych Scheduler mobile vs. desktop provider-list divergence; current live desktop and 375px mobile rendering both exclude known medical-staff columns, so the stale open bug is no longer reproducible.
- [x] Created `psych-scheduler-experimental.html` as a separate experimental Psych Scheduler command-center clone with mode defaults, analytics cards, and a staffing-risk canvas timeline.
- [x] Tightened Psych Scheduler feedback success handling so unconfirmed logger submissions no longer show a green success message.
- [x] Updated the My Schedule PTO-only filter to switch into a PTO-focused column set and restore prior columns when turned off.
- [x] Softened POA logistics language and added device-local checklist persistence plus print/PDF support.
- [x] Created `personal/poa-logistics-guide.html` as a mobile-friendly Power of Attorney logistics checklist.
- [x] Created `personal/poa-guide.html` as a mobile-friendly plain-English Power of Attorney guide.
- [x] Repaired Psych Scheduler feedback submission so the modal has a maintenance-log fallback when email submission fails.
- [x] Added a My Schedule "Show only PTO feasible" filter button that hides dates where PTO is not feasible for the selected provider.
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
