<!-- last-reviewed: 2026-07-24 -->
<!-- source: codex -->

# Psych Scheduler IT Request Inbox

Psych Scheduler and JFK Med Staff Schedule feedback lands in the private GitHub repo `TroyFowlerMD/website-feedback`. This is the sole GitHub Issues intake repo for website feedback, IT requests, and website suggestions from all supported sites. The old `TroyFowlerMD/non-clinical-feedback` repo, Google Sheet `Feedback` tab, and FormSubmit path are retired.

## Current `#IT` Workflow

When Dr. Fowler says `#IT`, `IT`, `#it`, `check IT`, `scheduler IT`, or asks to check scheduler feedback, website requests, or active scheduler requests:

1. Open/read the private repo `TroyFowlerMD/website-feedback`.
2. Treat issues as active when they are open and labeled `status:new`, `status:in-progress`, or `status:waiting`.
3. Ignore explicit verification or test issues created only for endpoint checks.
4. Report active requests first with issue number, title, source label, status label, and a short plain-language summary.
5. Propose a concrete action for each active request: likely affected file/system, whether it is a direct fix or needs clarification, suggested priority, and the next command/action Codex should take.
6. Unless Dr. Fowler explicitly asks for planning/review only, proceed through implementation without waiting for another approval when the request and target are clear.
7. Test the change, commit and push it, complete the production deployment, verify the live behavior, add implementation/deployment evidence to the originating issue, and close it when resolved.
8. Ask only when the request, target, material design choice, or required authority is genuinely unclear.

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

Both schedule apps submit to the central Vercel endpoint at `https://all-website-feedback.vercel.app/api/feedback`.

- Psych Scheduler and JFK Med Staff Schedule call that endpoint cross-origin from their current hosts.
- The endpoint creates one private GitHub issue per accepted submission.

See `docs/website-feedback-github-issues.md` for the full issue format, labels, protections, and operator workflow.

## Apps Script Scope

The Apps Script source remains cloned in `apps-script/psych-scheduler-feedback/` and linked by the root `.clasp.json`, but it is now schedule-data infrastructure only. It may still serve `Sheet1` reads for Psych Scheduler. It is no longer the feedback inbox, and future `#IT` triage should not read or update the old Google Sheet `Feedback` tab as the system of record.
