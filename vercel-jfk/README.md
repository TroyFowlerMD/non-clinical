# JFK Vercel Deployment

This folder is the Vercel project root for the password-gated JFK medical staff
schedule. Point Vercel at this folder, not the repository root, so the other
static pages in this repo are not published by this deployment.

Required Vercel environment variables:

- `JFK_SITE_PASSWORD`: shared site password.
- `JFK_AUTH_SECRET`: random signing secret for the auth cookie.
- `JFK_AUTH_COOKIE_DAYS`: cookie lifetime in days. Use `365` for the current
  staff-friendly default.
- `GITHUB_FEEDBACK_TOKEN`: fine-grained PAT with issue access to `TroyFowlerMD/non-clinical-feedback`.
- `GITHUB_FEEDBACK_REPO`: repo slug for the private feedback inbox. Default target is `TroyFowlerMD/non-clinical-feedback`.
- `GITHUB_FEEDBACK_ASSIGNEE`: optional default GitHub username to assign on new feedback issues.
- `FEEDBACK_ALLOW_LOCALHOST`: optional `1` to allow `http://localhost:3000` during local testing.

Published routes:

- `/` - canonical current public entrypoint
- `/jfk-med-staff-schedule-experimental-v2.html` - compatibility alias only
- `/non-clinical/jfk-med-staff-schedule-experimental-v2.html` - compatibility alias only
- `/login`
- `/api/feedback` - shared public feedback endpoint for Psych Scheduler and JFK Med Staff Schedule
