<!-- last-reviewed: 2026-05-22 -->
<!-- source: codex -->

# Psych Scheduler IT Request Inbox

Psych Scheduler feedback requests are tracked in the existing `Medical Staff Schedule ANALYSIS SHEET` Google Sheet on a separate `Feedback` tab. The schedule app continues to read schedule data from `Sheet1`; feedback logging must not alter `Sheet1`.

## Future Codex Workflow

When Dr. Fowler asks to check scheduler feedback, IT requests, website requests, or active scheduler requests:

1. Open/read the `Feedback` tab from `Medical Staff Schedule ANALYSIS SHEET`.
2. Treat rows as active when `Status` is blank, `open`, `needs_clarification`, or `in_progress`.
3. Report active requests first with `Request_ID`, `Timestamp`, `Submitter`, and `Description`.
4. Suggest likely fixes and identify which requests need clarification before editing.
5. After approved implementation, update `Status`, `Codex_Notes`, `Resolution_Notes`, and `Resolved_At` when sheet-write access is available.

## Sheet Columns

`Request_ID`, `Timestamp`, `Submitter`, `Description`, `Page`, `URL`, `Source`, `Status`, `Codex_Notes`, `Resolution_Notes`, `Resolved_At`

## Apps Script Source

The Apps Script source is cloned into `apps-script/psych-scheduler-feedback/` and linked by the root `.clasp.json`. The same deployed web app serves `Sheet1` schedule reads and handles feedback POSTs.

Use `scripts/clasp.cmd push` and redeploy the existing web app deployment so the public `DRIVE_EXEC_URL` does not change. The current live deployment ID is the one matching the `DRIVE_EXEC_URL` in `psych-scheduler.html`.
