import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'jfk_auth';
const DEFAULT_COOKIE_DAYS = 365;

function cookieDays() {
  const days = Number.parseInt(process.env.JFK_AUTH_COOKIE_DAYS || '', 10);
  return Number.isFinite(days) && days > 0 ? days : DEFAULT_COOKIE_DAYS;
}

function sign(value, secret) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  return left.length === right.length && timingSafeEqual(left, right);
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  const contentType = String(req.headers['content-type'] || '');
  if (contentType.includes('application/json')) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw));
}

function setJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    setJson(res, 405, { ok: false, error: 'method_not_allowed' });
    return;
  }

  const expectedPassword = process.env.JFK_SITE_PASSWORD || '';
  const authSecret = process.env.JFK_AUTH_SECRET || '';
  if (!expectedPassword || !authSecret) {
    setJson(res, 500, { ok: false, error: 'auth_not_configured' });
    return;
  }

  try {
    const body = await readBody(req);
    const submittedPassword = String(body.password || '');
    if (!safeEqual(submittedPassword, expectedPassword)) {
      setJson(res, 401, { ok: false, error: 'invalid_password' });
      return;
    }

    const issuedAt = String(Date.now());
    const maxAge = cookieDays() * 24 * 60 * 60;
    const token = `${issuedAt}.${sign(issuedAt, authSecret)}`;
    const host = String(req.headers.host || '');
    const proto = String(req.headers['x-forwarded-proto'] || '');
    const secure = proto.includes('https') || !host.includes('localhost');
    const secureAttr = secure ? '; Secure' : '';

    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly${secureAttr}; SameSite=Lax`
    );
    setJson(res, 200, {
      ok: true,
      expiresAt: new Date(Date.now() + maxAge * 1000).toISOString()
    });
  } catch (error) {
    setJson(res, 400, { ok: false, error: 'bad_request' });
  }
}
