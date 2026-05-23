<!-- last-reviewed: 2026-05-22 -->
<!-- source: codex -->

# Psych Scheduler IT Request Inbox

Psych Scheduler feedback requests are tracked in the existing `Medical Staff Schedule ANALYSIS SHEET` Google Sheet on a separate `Feedback` tab. The schedule app continues to read schedule data from `Sheet1`; feedback logging must not alter `Sheet1`.

## Future Codex Workflow

When Dr. Fowler says `#IT`, `IT`, `#it`, `check IT`, `scheduler IT`, or asks to check scheduler feedback, website requests, or active scheduler requests:

1. Open/read the `Feedback` tab from `Medical Staff Schedule ANALYSIS SHEET`.
2. Treat rows as active when `Status` is blank, `open`, `needs_clarification`, or `in_progress`.
3. Ignore verification rows where `Source` starts with `codex-live-verification` or `Submitter` starts with `Codex test`.
4. Report active requests first with `Request_ID`, `Timestamp`, `Submitter`, and `Description`.
5. Propose a concrete action for each active request: likely affected file/system, whether it is a direct fix or needs clarification, suggested priority, and the next command/action Codex should take.
6. Do not edit files, deploy, or update request statuses until Dr. Fowler approves the proposed action plan or explicitly asks for implementation.
7. After approved implementation, update `Status`, `Codex_Notes`, `Resolution_Notes`, and `Resolved_At` using the admin status update operation.

## Expected `#IT` Response Shape

Start with a short count of active non-test requests. Then list each active request in this shape:

- `Request_ID` - `Timestamp` - `Submitter`
  - Request: concise description
  - Proposed action: direct fix / needs clarification / defer / already handled
  - Likely target: file, app area, or external system

End with a short "Recommended next action" section. If no active requests exist, say that directly and mention the last checked range.

## Sheet Columns

`Request_ID`, `Timestamp`, `Submitter`, `Description`, `Page`, `URL`, `Source`, `Status`, `Codex_Notes`, `Resolution_Notes`, `Resolved_At`

## Apps Script Source

The Apps Script source is cloned into `apps-script/psych-scheduler-feedback/` and linked by the root `.clasp.json`. The same deployed web app serves `Sheet1` schedule reads and handles feedback POSTs.

Use `scripts/clasp.cmd push` and redeploy the existing web app deployment so the public `DRIVE_EXEC_URL` does not change. The current live deployment ID is the one matching the `DRIVE_EXEC_URL` in `psych-scheduler.html`.

## Updating Request Status

Future Codex sessions on this workstation can update request status by POSTing to `DRIVE_EXEC_URL` with `op: "updateFeedbackStatus"` and the local admin token stored at `.codex-local/psych-scheduler-feedback-admin-token.txt`. This file is intentionally ignored by Git.

New workstation setup should run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-psych-scheduler-appscript-access.ps1
```

Payload fields:

`op`, `token`, `requestId`, `status`, `codexNotes`, `resolutionNotes`

Supported statuses:

`open`, `needs_clarification`, `in_progress`, `done`, `wont_do`, `duplicate`, `test`

Terminal statuses automatically fill `Resolved_At` when it is not provided.

For routine updates from Codex, prefer the helper script:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-psych-scheduler-feedback-status.ps1 -RequestId "PS-..." -Status done -CodexNotes "Fixed in commit ..." -ResolutionNotes "Implemented and verified."
```

To provision a separate token for another workstation from an already-configured workstation:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\provision-psych-scheduler-feedback-token.ps1 -Label "other-computer"
```
