<!-- last-reviewed: 2026-05-20 -->
<!-- source: codex -->

# Psych Scheduler Feedback Apps Script Contract

Current implementation note: the live feedback handler now lives in the clasp-managed shared Apps Script bridge at `apps-script/psych-scheduler-feedback/Code.js`. It logs requests to the `Feedback` tab in `Medical Staff Schedule ANALYSIS SHEET` and still serves `Sheet1` schedule reads. Use this document as the response-contract reference, not as the full source of truth for the deployed script.

Psych Scheduler feedback should use the feedback Apps Script as the owned primary path. The browser sends one JSON payload as `text/plain` to avoid a CORS preflight from GitHub Pages. The script should log the request, send the owner email, and return JSON confirming email delivery.

Expected browser payload fields:

- `site`
- `name`
- `comment`
- `page`
- `url`
- `timestamp`
- `source`

Recommended `doPost` shape:

```javascript
const FEEDBACK_RECIPIENT = 'troyfowlermd@gmail.com';
const FEEDBACK_SHEET_NAME = 'Feedback';

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const timestamp = payload.timestamp || new Date().toISOString();
    const name = String(payload.name || '').trim();
    const comment = String(payload.comment || '').trim();
    const page = String(payload.page || '').trim();
    const url = String(payload.url || '').trim();
    const source = String(payload.source || '').trim();

    if (!name || !comment) {
      return jsonResponse({ ok: false, logged: false, emailed: false, error: 'Missing name or comment' });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME) || ss.insertSheet(FEEDBACK_SHEET_NAME);
    sheet.appendRow([timestamp, name, comment, page, url, source]);

    MailApp.sendEmail({
      to: FEEDBACK_RECIPIENT,
      subject: 'JFK Schedule Analyzer Maintenance Request',
      body: [
        'Name: ' + name,
        'Page: ' + page,
        'URL: ' + url,
        'Timestamp: ' + timestamp,
        'Source: ' + source,
        '',
        comment
      ].join('\n')
    });

    return jsonResponse({ ok: true, logged: true, emailed: true });
  } catch (err) {
    return jsonResponse({
      ok: false,
      logged: false,
      emailed: false,
      error: err && err.message ? err.message : String(err)
    });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deployment note: after editing the Apps Script, deploy a new Web App version with access set so the public GitHub Pages app can submit feedback. The HTML expects the response to include `emailed: true` before it shows the green success message.
