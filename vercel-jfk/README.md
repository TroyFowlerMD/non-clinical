# JFK Vercel Deployment

This folder is the Vercel project root for the password-gated JFK medical staff
schedule. Point Vercel at this folder, not the repository root, so the other
static pages in this repo are not published by this deployment.

Required Vercel environment variables:

- `JFK_SITE_PASSWORD`: shared site password.
- `JFK_AUTH_SECRET`: random signing secret for the auth cookie.
- `JFK_AUTH_COOKIE_DAYS`: cookie lifetime in days. Use `365` for the current
  staff-friendly default.

Published routes:

- `/` - canonical current public entrypoint
- `/jfk-med-staff-schedule-experimental-v2.html` - compatibility alias only
- `/non-clinical/jfk-med-staff-schedule-experimental-v2.html` - compatibility alias only
- `/login`
