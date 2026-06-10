const DEFAULT_ALLOWED_ORIGINS = [
  'https://troyfowlermd.github.io',
  'https://non-clinical-lac.vercel.app'
];
const MAX_NAME_LENGTH = 120;
const MAX_MESSAGE_LENGTH = 4000;
const MAX_TITLE_LENGTH = 120;
const MAX_URL_LENGTH = 500;
const MAX_SOURCE_LENGTH = 120;
const MAX_USER_AGENT_LENGTH = 500;
const MAX_SUBMISSION_ID_LENGTH = 120;
const MAX_HONEYPOT_LENGTH = 120;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const DEDUPE_WINDOW_MS = 10 * 60 * 1000;
const LABELS = {
  feedback: { color: '1d76db', description: 'Feedback submitted from a public schedule app' },
  'status:new': { color: 'fbca04', description: 'New feedback awaiting review' },
  'source:psych-scheduler': { color: '5319e7', description: 'Submitted from Psych Scheduler' },
  'source:jfk-med-staff': { color: '0e8a16', description: 'Submitted from JFK Med Staff Schedule' }
};
const APP_CONFIG = {
  'psych-scheduler': {
    label: 'Psych Scheduler',
    sourceLabel: 'source:psych-scheduler'
  },
  'jfk-med-staff': {
    label: 'JFK Med Staff',
    sourceLabel: 'source:jfk-med-staff'
  }
};

function setCors(res, origin) {
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function setJson(res, status, payload, origin) {
  setCors(res, origin);
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function allowedOrigins() {
  const extraLocal = process.env.FEEDBACK_ALLOW_LOCALHOST === '1' ? ['http://localhost:3000'] : [];
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...extraLocal]);
}

function normalizeOrigin(req) {
  return String(req.headers.origin || '').trim();
}

function isAllowedOrigin(origin) {
  return !!origin && allowedOrigins().has(origin);
}

function readIp(req) {
  const candidates = [
    req.headers['x-vercel-forwarded-for'],
    req.headers['x-forwarded-for'],
    req.headers['x-real-ip']
  ];
  for (const value of candidates) {
    const first = String(value || '').split(',')[0].trim();
    if (first) return first;
  }
  return 'unknown';
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return Object.fromEntries(new URLSearchParams(raw));
  }
}

function trimField(value, max) {
  return String(value || '').trim().slice(0, max);
}

function firstMeaningfulLine(message) {
  const lines = String(message || '')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  return (lines[0] || 'Feedback').replace(/\s+/g, ' ');
}

function shortTitle(appLabel, message) {
  const summary = firstMeaningfulLine(message).slice(0, MAX_TITLE_LENGTH);
  return `[${appLabel}] ${summary}`;
}

function pruneStore(map, cutoffMs) {
  const now = Date.now();
  for (const [key, value] of map.entries()) {
    if (typeof value === 'number' && value < now - cutoffMs) map.delete(key);
    if (Array.isArray(value)) {
      const filtered = value.filter(ts => ts >= now - cutoffMs);
      if (filtered.length) map.set(key, filtered);
      else map.delete(key);
    }
  }
}

function rateLimitStore() {
  if (!globalThis.__feedbackRateLimitStore) globalThis.__feedbackRateLimitStore = new Map();
  return globalThis.__feedbackRateLimitStore;
}

function dedupeStore() {
  if (!globalThis.__feedbackDedupeStore) globalThis.__feedbackDedupeStore = new Map();
  return globalThis.__feedbackDedupeStore;
}

function checkRateLimit(ip) {
  const store = rateLimitStore();
  pruneStore(store, RATE_LIMIT_WINDOW_MS);
  const now = Date.now();
  const entries = store.get(ip) || [];
  if (entries.length >= RATE_LIMIT_MAX_REQUESTS) return false;
  store.set(ip, [...entries, now]);
  return true;
}

function seenSubmission(submissionId) {
  const store = dedupeStore();
  pruneStore(store, DEDUPE_WINDOW_MS);
  return store.has(submissionId);
}

function rememberSubmission(submissionId) {
  dedupeStore().set(submissionId, Date.now());
}

function validatePayload(body) {
  const appId = trimField(body.appId, 40);
  const appConfig = APP_CONFIG[appId];
  if (!appConfig) return { ok: false, error: 'invalid_app' };

  const honeypot = trimField(body.website || body.company || body.honeypot, MAX_HONEYPOT_LENGTH);
  if (honeypot) return { ok: true, ignored: true, appId, appConfig };

  const name = trimField(body.name, MAX_NAME_LENGTH);
  const message = trimField(body.message || body.comment, MAX_MESSAGE_LENGTH);
  const pageTitle = trimField(body.pageTitle || body.page, MAX_TITLE_LENGTH);
  const pageUrl = trimField(body.pageUrl || body.url, MAX_URL_LENGTH);
  const source = trimField(body.source, MAX_SOURCE_LENGTH);
  const userAgent = trimField(body.userAgent, MAX_USER_AGENT_LENGTH);
  const submissionId = trimField(body.submissionId, MAX_SUBMISSION_ID_LENGTH);

  if (!name || !message) return { ok: false, error: 'missing_required_fields' };
  if (!submissionId) return { ok: false, error: 'missing_submission_id' };

  return {
    ok: true,
    appId,
    appConfig,
    payload: {
      name,
      message,
      pageTitle,
      pageUrl,
      source,
      userAgent,
      submissionId,
      submittedAt: new Date().toISOString()
    }
  };
}

function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'non-clinical-feedback-bot',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json'
  };
}

function parseRepoSlug(slug) {
  const [owner, repo] = String(slug || '').split('/');
  if (!owner || !repo) throw new Error('invalid_repo_slug');
  return { owner, repo };
}

async function githubRequest(pathname, token, options = {}) {
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...options,
    headers: {
      ...githubHeaders(token),
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let json = {};
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = { raw: text };
    }
  }
  if (!response.ok) {
    const error = new Error(`github_${response.status}`);
    error.status = response.status;
    error.body = json;
    throw error;
  }
  return json;
}

async function ensureLabel(repoSlug, token, name) {
  const { owner, repo } = parseRepoSlug(repoSlug);
  const label = LABELS[name];
  if (!label) return;
  try {
    await githubRequest(`/repos/${owner}/${repo}/labels`, token, {
      method: 'POST',
      body: JSON.stringify({
        name,
        color: label.color,
        description: label.description
      })
    });
  } catch (error) {
    if (error.status === 422) return;
    throw error;
  }
}

function issueBody(appLabel, payload) {
  return [
    `App: ${appLabel}`,
    `Submission ID: ${payload.submissionId}`,
    `Submitted by: ${payload.name}`,
    `Submitted at: ${payload.submittedAt}`,
    `Page title: ${payload.pageTitle || '(not provided)'}`,
    `Public page URL: ${payload.pageUrl || '(not provided)'}`,
    `Source marker: ${payload.source || '(not provided)'}`,
    `Browser/user agent: ${payload.userAgent || '(not provided)'}`,
    '',
    'Warning: the user was told not to include patient details or passwords.',
    '',
    'Full message:',
    payload.message
  ].join('\n');
}

async function createGitHubIssue(repoSlug, token, assignee, appConfig, payload) {
  const { owner, repo } = parseRepoSlug(repoSlug);
  const labels = ['feedback', appConfig.sourceLabel, 'status:new'];
  for (const label of labels) {
    await ensureLabel(repoSlug, token, label);
  }
  return githubRequest(`/repos/${owner}/${repo}/issues`, token, {
    method: 'POST',
    body: JSON.stringify({
      title: shortTitle(appConfig.label, payload.message),
      body: issueBody(appConfig.label, payload),
      labels,
      assignees: assignee ? [assignee] : []
    })
  });
}

export default async function handler(req, res) {
  const origin = normalizeOrigin(req);

  if (req.method === 'OPTIONS') {
    if (!isAllowedOrigin(origin)) {
      setJson(res, 403, { ok: false, error: 'origin_not_allowed' }, '');
      return;
    }
    res.statusCode = 204;
    setCors(res, origin);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    setJson(res, 405, { ok: false, error: 'method_not_allowed' }, isAllowedOrigin(origin) ? origin : '');
    return;
  }

  if (!isAllowedOrigin(origin)) {
    setJson(res, 403, { ok: false, error: 'origin_not_allowed' }, '');
    return;
  }

  const ip = readIp(req);
  if (!checkRateLimit(ip)) {
    setJson(res, 429, { ok: false, error: 'rate_limited' }, origin);
    return;
  }

  const token = String(process.env.GITHUB_FEEDBACK_TOKEN || '').trim();
  const repoSlug = String(process.env.GITHUB_FEEDBACK_REPO || 'TroyFowlerMD/non-clinical-feedback').trim();
  const assignee = trimField(process.env.GITHUB_FEEDBACK_ASSIGNEE, 80);
  if (!token || !repoSlug) {
    setJson(res, 500, { ok: false, error: 'feedback_not_configured' }, origin);
    return;
  }

  try {
    const body = await readBody(req);
    const validation = validatePayload(body);
    if (!validation.ok) {
      setJson(res, 400, { ok: false, error: validation.error }, origin);
      return;
    }
    if (validation.ignored) {
      setJson(res, 200, { ok: true, ignored: true }, origin);
      return;
    }

    if (seenSubmission(validation.payload.submissionId)) {
      setJson(res, 200, { ok: true, duplicate: true }, origin);
      return;
    }

    const issue = await createGitHubIssue(repoSlug, token, assignee, validation.appConfig, validation.payload);
    rememberSubmission(validation.payload.submissionId);
    setJson(
      res,
      200,
      {
        ok: true,
        issueNumber: issue.number,
        issueUrl: issue.html_url || '',
        duplicate: false
      },
      origin
    );
  } catch (error) {
    const code = error.status === 404 ? 'feedback_repo_not_found'
      : error.status === 401 || error.status === 403 ? 'feedback_auth_failed'
      : 'feedback_create_failed';
    setJson(res, 502, { ok: false, error: code }, origin);
  }
}
