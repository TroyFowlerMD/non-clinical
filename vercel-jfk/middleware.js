import { next } from '@vercel/functions';

const COOKIE_NAME = 'jfk_auth';
const DEFAULT_COOKIE_DAYS = 365;
const PUBLIC_PATHS = new Set(['/login', '/login.html', '/api/login']);

function cookieDays() {
  const days = Number.parseInt(process.env.JFK_AUTH_COOKIE_DAYS || '', 10);
  return Number.isFinite(days) && days > 0 ? days : DEFAULT_COOKIE_DAYS;
}

function getCookie(header, name) {
  const cookies = String(header || '').split(';');
  for (const cookie of cookies) {
    const index = cookie.indexOf('=');
    if (index < 0) continue;
    const key = cookie.slice(0, index).trim();
    if (key === name) return cookie.slice(index + 1).trim();
  }
  return '';
}

function base64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sign(value, secret) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return base64Url(new Uint8Array(signature));
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function isAuthenticated(request) {
  const secret = process.env.JFK_AUTH_SECRET || '';
  if (!secret) return false;

  const token = getCookie(request.headers.get('cookie'), COOKIE_NAME);
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const issuedAt = Number.parseInt(parts[0], 10);
  if (!Number.isFinite(issuedAt)) return false;

  const maxAgeMs = cookieDays() * 24 * 60 * 60 * 1000;
  if (Date.now() - issuedAt > maxAgeMs) return false;

  const expected = await sign(parts[0], secret);
  return safeEqual(parts[1], expected);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/+$/, '') || '/';
  const authed = await isAuthenticated(request);

  if (PUBLIC_PATHS.has(pathname)) {
    if (authed && (pathname === '/login' || pathname === '/login.html')) {
      return Response.redirect(new URL('/', request.url), 303);
    }
    return next();
  }

  if (authed) return next();

  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('next', url.pathname + url.search);
  return Response.redirect(loginUrl, 303);
}

export const config = {
  matcher: ['/((?!api/login).*)'],
  runtime: 'edge'
};
