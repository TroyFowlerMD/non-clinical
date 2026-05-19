<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# 2026-05-11 - Psych Scheduler Feedback Logging Added

## Summary
Added a maintenance-request feedback layer to `psych-scheduler.html` in `TroyFowlerMD/non-clinical`. The app remains a single-file static GitHub Pages app with no backend, build tools, framework conversion, dependency changes, or extra files.

## Implementation
- Added a `Send Feedback` button to the existing sidebar footer.
- Added a modal form with required name and request/comment fields.
- Implemented dual-submit with `Promise.allSettled()`: FormSubmit AJAX email plus Apps Script JSON POST to the maintenance-request Google Sheet logger.
- Success is shown if either endpoint succeeds; failure only if both fail.
- Existing sidebar overlay, parser/calendar/table rendering, XLSX behavior, theme toggle, and font controls were left untouched.

## Deployment
- Repo: `TroyFowlerMD/non-clinical`
- File: `psych-scheduler.html`
- Branch: `main`
- Commit: `8a3b2410c5fda0da65c9dd973d5b96b30ebba3e1`

## Follow-up
No separate Asana Build & Dev task was found. Matching unprojected Asana capture task was completed after this deployment.
