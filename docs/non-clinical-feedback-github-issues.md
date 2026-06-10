# Shared Feedback GitHub Issues Workflow

Feedback intake for both schedule apps now goes to the private GitHub repo `TroyFowlerMD/non-clinical-feedback`.

Apps using this inbox:

- `Psych Scheduler`
- `JFK Med Staff Schedule`

## How New Feedback Arrives

Both apps submit to the shared Vercel endpoint at `https://non-clinical-lac.vercel.app/api/feedback`.

That endpoint:

- validates the request
- rejects unapproved origins
- rate-limits burst traffic
- ignores honeypot spam
- creates one private GitHub issue

Each new issue starts with these labels:

- `feedback`
- `status:new`
- `source:psych-scheduler` or `source:jfk-med-staff`

## Issue Format

Title format:

- `[Psych Scheduler] ...`
- `[JFK Med Staff] ...`

Issue body fields:

- App
- Submission ID
- Submitted by
- Submitted at
- Page title
- Public page URL
- Source marker
- Browser/user agent
- Full message
- warning not to include patient details or passwords

## Daily Owner Workflow

Open the private repo and go to the Issues tab.

Useful filters:

- New: `is:issue is:open label:status:new`
- Psych only: `is:issue is:open label:source:psych-scheduler`
- JFK only: `is:issue is:open label:source:jfk-med-staff`
- In progress: `is:issue is:open label:status:in-progress`
- Waiting: `is:issue is:open label:status:waiting`
- Closed: `is:issue is:closed sort:updated-desc`

Suggested manual triage labels:

- `status:in-progress`
- `status:waiting`
- `type:bug`
- `type:enhancement`
- `type:question`
- `priority:high`

Recommended triage flow:

1. Remove `status:new` when work starts.
2. Add `status:in-progress` while active.
3. Comment with the commit, PR, or deployment link when a fix is underway.
4. Close the issue after live verification.
5. Reopen it later if the problem returns.

## Codex `#IT` Guidance

When Dr. Fowler says `#IT`, `IT`, `#it`, `check IT`, `scheduler IT`, or asks to check scheduler feedback:

1. Read the private repo `TroyFowlerMD/non-clinical-feedback`.
2. Report active open issues, prioritizing `label:status:new`.
3. Ignore obvious verification issues only if they are clearly described as tests.
4. Propose the likely target file/system and next action before implementation.
5. Do not edit files or close issues until Dr. Fowler approves the plan or explicitly asks for implementation.

## Runtime Configuration

Vercel env vars required by the shared endpoint:

- `GITHUB_FEEDBACK_TOKEN`
- `GITHUB_FEEDBACK_REPO`
- `GITHUB_FEEDBACK_ASSIGNEE` optional
- `FEEDBACK_ALLOW_LOCALHOST` optional for local-only testing

The current default repo slug in code is `TroyFowlerMD/non-clinical-feedback`.

## Retired Paths

These are no longer the active feedback inbox:

- Psych Scheduler FormSubmit email fallback
- Psych Scheduler feedback Apps Script POST path
- Psych Scheduler no-CORS backup logger
- JFK feedback POST-to-Apps-Script path
- Google Sheet `Feedback` tab as the operational inbox

The Apps Script bridge still remains in the repo for schedule-data reads. It is no longer the feedback system of record.
