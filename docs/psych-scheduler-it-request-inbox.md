<!-- last-reviewed: 2026-06-10 -->
<!-- source: codex -->

# Psych Scheduler IT Request Inbox

Psych Scheduler and JFK Med Staff Schedule feedback now lands in the private GitHub repo `TroyFowlerMD/non-clinical-feedback`. The old Google Sheet `Feedback` tab and FormSubmit path are retired as the active request inbox.

## Current `#IT` Workflow

When Dr. Fowler says `#IT`, `IT`, `#it`, `check IT`, `scheduler IT`, or asks to check scheduler feedback, website requests, or active scheduler requests:

1. Open/read the private repo `TroyFowlerMD/non-clinical-feedback`.
2. Treat issues as active when they are open and labeled `status:new`, `status:in-progress`, or `status:waiting`.
3. Ignore explicit verification or test issues created only for endpoint checks.
4. Report active requests first with issue number, title, source label, status label, and a short plain-language summary.
5. Propose a concrete action for each active request: likely affected file/system, whether it is a direct fix or needs clarification, suggested priority, and the next command/action Codex should take.
6. Do not edit files, deploy, relabel, or close issues until Dr. Fowler approves the proposed action plan or explicitly asks for implementation.
7. After approved implementation, add a comment with the commit/PR/deployment evidence, update labels as needed, and close the issue only after live verification.

## Expected `#IT` Response Shape

Start with a short count of active non-test issues. Then list each active request in this shape:

- `#<issue>` - `<source label>` - `<status label>`
  - Request: concise description
  - Proposed action: direct fix / needs clarification / defer / already handled
  - Likely target: file, app area, or external system

End with a short "Recommended next action" section. If no active requests exist, say that directly and mention the filters checked.

## Useful GitHub Issue Filters

- New: `is:issue is:open label:status:new`
- Psych only: `is:issue is:open label:source:psych-scheduler`
- JFK only: `is:issue is:open label:source:jfk-med-staff`
- In progress: `is:issue is:open label:status:in-progress`
- Waiting: `is:issue is:open label:status:waiting`
- Closed: `is:issue is:closed sort:updated-desc`

## Shared Feedback Intake

Both schedule apps now submit to the shared Vercel endpoint at `https://non-clinical-lac.vercel.app/api/feedback`.

- Psych Scheduler calls that endpoint cross-origin from GitHub Pages.
- JFK Med Staff Schedule calls the same endpoint same-origin from Vercel.
- The endpoint creates one private GitHub issue per accepted submission.

See `docs/non-clinical-feedback-github-issues.md` for the full issue format, labels, protections, and operator workflow.

## Apps Script Scope

The Apps Script source remains cloned in `apps-script/psych-scheduler-feedback/` and linked by the root `.clasp.json`, but it is now schedule-data infrastructure only. It may still serve `Sheet1` reads for Psych Scheduler. It is no longer the feedback inbox, and future `#IT` triage should not read or update the old Google Sheet `Feedback` tab as the system of record.
