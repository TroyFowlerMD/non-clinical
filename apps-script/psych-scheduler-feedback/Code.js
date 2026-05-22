// Code.gs - psych-scheduler bridge
//
// Serves Sheet1 JSON to the Psych Scheduler static app and logs website
// feedback/maintenance requests to a separate Feedback tab.

var SHEET_NAME_DEFAULT = 'Sheet1';
var FEEDBACK_SHEET_NAME = 'Feedback';
var FEEDBACK_RECIPIENT = 'troyfowlermd@gmail.com';
var FEEDBACK_HEADERS = [
  'Request_ID',
  'Timestamp',
  'Submitter',
  'Description',
  'Page',
  'URL',
  'Source',
  'Status',
  'Codex_Notes',
  'Resolution_Notes',
  'Resolved_At'
];

function doGet(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var sheetName = params.sheet || SHEET_NAME_DEFAULT;

    if (sheetName !== SHEET_NAME_DEFAULT) {
      throw new Error('Unsupported sheet: "' + sheetName + '"');
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      var available = ss.getSheets().map(function(s) { return s.getName(); }).join(', ');
      throw new Error('Sheet not found: "' + sheetName + '". Available sheets: ' + available);
    }

    var range = params.range ? sheet.getRange(params.range) : sheet.getDataRange();
    var values = range.getValues();
    var tz = Session.getScriptTimeZone();

    if (!values || !values.length) {
      return jsonResponse_({
        headers: [],
        rows: [],
        sheetName: sheetName,
        fetchedAt: new Date().toISOString(),
        rowCount: 0
      });
    }

    var headers = (values[0] || []).map(function(v) {
      return (v === null || v === undefined) ? '' : String(v).replace(/\r\n/g, '\n');
    });

    var rows = values.slice(1).map(function(row) {
      return row.map(function(cell) {
        if (cell instanceof Date) {
          return Utilities.formatDate(cell, tz, 'yyyy-MM-dd');
        }
        if (cell === null || cell === undefined) return '';
        return String(cell).replace(/\r\n/g, '\n');
      });
    });

    var lastModified = DriveApp.getFileById(ss.getId()).getLastUpdated().toISOString();

    return jsonResponse_({
      headers: headers,
      rows: rows,
      sheetName: sheetName,
      fetchedAt: new Date().toISOString(),
      lastModified: lastModified,
      rowCount: rows.length
    });
  } catch (err) {
    return jsonResponse_({ error: err.message });
  }
}

function doPost(e) {
  try {
    var data = parsePostData_(e);

    if (isFeedbackPayload_(data)) {
      return handleFeedbackPost_(data);
    }

    if (data && data.rows) {
      return handleScheduleWritePost_(data.rows);
    }

    return jsonResponse_({
      ok: false,
      logged: false,
      emailed: false,
      error: 'Unsupported POST payload'
    });
  } catch (err) {
    return jsonResponse_({
      ok: false,
      logged: false,
      emailed: false,
      error: err.message
    });
  }
}

function parsePostData_(e) {
  var contents = (e && e.postData && e.postData.contents) ? e.postData.contents : '{}';
  return JSON.parse(contents);
}

function isFeedbackPayload_(data) {
  if (!data) return false;
  if (data.op === 'feedback') return true;
  return !data.rows && (data.name || data.submitter) && (data.comment || data.description);
}

function handleFeedbackPost_(data) {
  var timestamp = String(data.timestamp || new Date().toISOString());
  var submitter = String(data.name || data.submitter || '').trim();
  var description = String(data.comment || data.description || '').trim();
  var page = String(data.page || data.site || '').trim();
  var url = String(data.url || '').trim();
  var source = String(data.source || 'psych-scheduler-feedback-modal').trim();

  if (!submitter || !description) {
    return jsonResponse_({
      ok: false,
      logged: false,
      emailed: false,
      error: 'Missing name or comment'
    });
  }

  var requestId = String(data.requestId || data.Request_ID || makeRequestId_());
  var sheet = ensureFeedbackSheet_();
  sheet.appendRow([
    requestId,
    timestamp,
    submitter,
    description,
    page,
    url,
    source,
    'open',
    '',
    '',
    ''
  ]);

  var emailed = false;
  var emailError = '';
  try {
    MailApp.sendEmail({
      to: FEEDBACK_RECIPIENT,
      subject: 'JFK Schedule Analyzer IT Request - ' + submitter,
      body: [
        'Request ID: ' + requestId,
        'Submitter: ' + submitter,
        'Page: ' + page,
        'URL: ' + url,
        'Timestamp: ' + timestamp,
        'Source: ' + source,
        '',
        description
      ].join('\n')
    });
    emailed = true;
  } catch (err) {
    emailError = err && err.message ? err.message : String(err);
  }

  return jsonResponse_({
    ok: true,
    logged: true,
    emailed: emailed,
    requestId: requestId,
    error: emailError
  });
}

function handleScheduleWritePost_(rows) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME_DEFAULT);

  if (!rows || !rows.length || !rows[0] || !rows[0].length) {
    throw new Error('No schedule rows provided');
  }

  sheet.clearContents();
  sheet.getRange(1, 1, rows.length, rows[0].length).setValues(rows);

  return jsonResponse_({
    ok: true,
    rowCount: rows.length,
    writtenAt: new Date().toISOString()
  });
}

function ensureFeedbackSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(FEEDBACK_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(FEEDBACK_SHEET_NAME);
  }

  var headerRange = sheet.getRange(1, 1, 1, FEEDBACK_HEADERS.length);
  var current = headerRange.getValues()[0] || [];
  var needsHeader = FEEDBACK_HEADERS.some(function(header, idx) {
    return String(current[idx] || '') !== header;
  });

  if (needsHeader) {
    headerRange.setValues([FEEDBACK_HEADERS]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function makeRequestId_() {
  return 'PS-' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss') + '-' + Utilities.getUuid().slice(0, 8);
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function smokeTest() {
  var result = doGet({ parameter: {} });
  var json = JSON.parse(result.getContent());
  if (json.error) {
    Logger.log('ERROR: ' + json.error);
  } else {
    Logger.log('OK - ' + json.rowCount + ' rows, sheet: "' + json.sheetName + '"');
    Logger.log('Header count: ' + json.headers.length);
    Logger.log('First header: ' + (json.headers[0] || '(blank)'));
    Logger.log('First data row date: ' + ((json.rows[0] && json.rows[0][0]) ? json.rows[0][0] : 'none'));
  }
}

function smokeTestFeedback() {
  var result = doPost({
    postData: {
      contents: JSON.stringify({
        op: 'feedback',
        name: 'Codex smoke test',
        comment: 'Testing Feedback tab append and email confirmation.',
        page: 'Psych Scheduler',
        url: 'https://troyfowlermd.github.io/non-clinical/psych-scheduler.html',
        timestamp: new Date().toISOString(),
        source: 'apps-script-smoke-test'
      })
    }
  });
  Logger.log(result.getContent());
}

function authorizeMailApp() {
  Logger.log('Mail quota: ' + MailApp.getRemainingDailyQuota());
}

function smokeTestPost() {
  var result = doPost({
    postData: {
      contents: JSON.stringify({
        rows: [
          ['Header 1', 'Header 2'],
          ['Value 1', 'Value 2']
        ]
      })
    }
  });
  Logger.log(result.getContent());
}

function listSheets() {
  var names = SpreadsheetApp.getActiveSpreadsheet().getSheets().map(function(s) {
    return s.getName();
  });
  Logger.log(names.join(', '));
}
