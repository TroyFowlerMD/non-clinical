// Code.gs - psych-scheduler bridge
//
// Serves Sheet1 JSON to the Psych Scheduler static app and logs website
// feedback/maintenance requests to a separate Feedback tab.

var SHEET_NAME_DEFAULT = 'Sheet1';
var FEEDBACK_SHEET_NAME = 'Feedback';
var FEEDBACK_RECIPIENT = 'troyfowlermd@gmail.com';
var FEEDBACK_ADMIN_TOKEN_PROPERTY = 'PS_FEEDBACK_ADMIN_TOKEN';
var FEEDBACK_ADMIN_TOKENS_PROPERTY = 'PS_FEEDBACK_ADMIN_TOKENS_JSON';
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

    if (data && data.op === 'checkFeedbackAdminToken') {
      return handleFeedbackTokenCheck_(data);
    }

    if (data && data.op === 'registerFeedbackAdminToken') {
      return handleFeedbackTokenRegister_(data);
    }

    if (data && data.op === 'updateFeedbackStatus') {
      return handleFeedbackStatusUpdate_(data);
    }

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

function handleFeedbackStatusUpdate_(data) {
  requireFeedbackAdminToken_(data);

  var requestId = String(data.requestId || data.Request_ID || '').trim();
  var status = String(data.status || '').trim().toLowerCase();
  var allowedStatuses = {
    open: true,
    needs_clarification: true,
    in_progress: true,
    done: true,
    wont_do: true,
    duplicate: true,
    test: true
  };

  if (!requestId) throw new Error('Missing requestId');
  if (!allowedStatuses[status]) throw new Error('Unsupported status: ' + status);

  var sheet = ensureFeedbackSheet_();
  var values = sheet.getDataRange().getValues();
  if (!values || values.length < 2) throw new Error('No feedback rows found');

  var headers = values[0].map(function(value) { return String(value || ''); });
  var cols = {};
  headers.forEach(function(header, idx) { cols[header] = idx + 1; });

  var idCol = cols.Request_ID;
  if (!idCol) throw new Error('Feedback sheet is missing Request_ID column');

  var targetRow = 0;
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol - 1] || '').trim() === requestId) {
      targetRow = i + 1;
      break;
    }
  }

  if (!targetRow) throw new Error('Request not found: ' + requestId);

  var now = new Date().toISOString();
  var resolvedAt = data.resolvedAt || data.Resolved_At || '';
  if (!resolvedAt && isTerminalFeedbackStatus_(status)) {
    resolvedAt = now;
  }

  setFeedbackCell_(sheet, targetRow, cols.Status, status);
  if (data.codexNotes !== undefined || data.Codex_Notes !== undefined) {
    setFeedbackCell_(sheet, targetRow, cols.Codex_Notes, data.codexNotes || data.Codex_Notes || '');
  }
  if (data.resolutionNotes !== undefined || data.Resolution_Notes !== undefined) {
    setFeedbackCell_(sheet, targetRow, cols.Resolution_Notes, data.resolutionNotes || data.Resolution_Notes || '');
  }
  if (resolvedAt) {
    setFeedbackCell_(sheet, targetRow, cols.Resolved_At, resolvedAt);
  }

  return jsonResponse_({
    ok: true,
    updated: true,
    requestId: requestId,
    status: status,
    row: targetRow
  });
}

function handleFeedbackTokenCheck_(data) {
  requireFeedbackAdminToken_(data);
  return jsonResponse_({ ok: true, authorized: true });
}

function handleFeedbackTokenRegister_(data) {
  requireFeedbackAdminToken_(data);

  var label = String(data.label || '').trim();
  var newToken = String(data.newToken || '').trim();

  if (!label) throw new Error('Missing token label');
  if (newToken.length < 32) throw new Error('New token must be at least 32 characters');

  var tokens = getAdditionalFeedbackAdminTokens_();
  tokens[label] = newToken;
  PropertiesService.getScriptProperties().setProperty(FEEDBACK_ADMIN_TOKENS_PROPERTY, JSON.stringify(tokens));

  return jsonResponse_({ ok: true, registered: true, label: label });
}

function requireFeedbackAdminToken_(data) {
  var actual = String((data && data.token) || '').trim();

  if (!isFeedbackAdminTokenValid_(actual)) throw new Error('Invalid feedback admin token');
}

function isFeedbackAdminTokenValid_(actual) {
  if (!actual) return false;

  var props = PropertiesService.getScriptProperties();
  var primary = props.getProperty(FEEDBACK_ADMIN_TOKEN_PROPERTY);
  if (primary && actual === primary) return true;

  var tokens = getAdditionalFeedbackAdminTokens_();
  return Object.keys(tokens).some(function(label) {
    return tokens[label] && actual === tokens[label];
  });
}

function getAdditionalFeedbackAdminTokens_() {
  var raw = PropertiesService.getScriptProperties().getProperty(FEEDBACK_ADMIN_TOKENS_PROPERTY) || '{}';
  try {
    var parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    return {};
  }
}

function isTerminalFeedbackStatus_(status) {
  return status === 'done' || status === 'wont_do' || status === 'duplicate' || status === 'test';
}

function setFeedbackCell_(sheet, row, col, value) {
  if (!col) return;
  sheet.getRange(row, col).setValue(value);
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
