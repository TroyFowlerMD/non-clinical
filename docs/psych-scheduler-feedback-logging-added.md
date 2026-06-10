<!-- last-reviewed: 2026-05-18 -->
<!-- source: notion -->

# 2026-05-11 - Psych Scheduler Feedback Logging Added

Historical note: this document describes the retired Apps Script/FormSubmit feedback flow that was replaced on 2026-06-10 by the shared Vercel-to-private-GitHub-Issues intake. Keep it only for historical debugging context.

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

## 2026-05-19 Repair Note
- Current failure mode: the modal had drifted to an email-only FormSubmit path, so a FormSubmit failure produced the user-facing "couldn't send" message.
- Repair: restored dual submission with FormSubmit email plus the maintenance-request Apps Script logger. The Apps Script request now avoids a CORS preflight so it can work from the static GitHub Pages app.
- Verification: local browser test loaded the live schedule, submitted one Codex-labeled feedback test, and showed the modal success message.

## 2026-05-20 Confirmation Repair Note
- Current failure mode: the modal could show the green success message when only the unconfirmed no-CORS logger path completed, so the user could see "sent" without receiving email.
- Repair: made the feedback Apps Script the primary owned path and require JSON confirmation with `emailed: true` before showing the full success message. FormSubmit remains a confirmed email fallback. The no-CORS Apps Script path remains only as a last backup and shows a warning instead of clearing the form.
- Follow-up: the deployed feedback Apps Script must match `docs/psych-scheduler-feedback-apps-script-contract.md` so it both appends the maintenance row and sends the owner email.
