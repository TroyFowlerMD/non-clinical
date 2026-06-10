<!-- last-reviewed: 2026-06-09 -->

# Schedule App Canonical Routes

This file is the primary routing source of truth for the schedule apps. Before changing a schedule-app URL, repo location, host, or dashboard/sidebar link, update this file first and keep the entrypoints plus legacy-URL behavior in the same change set.

## Route Registry

| Public label | Current public URL | Status | Owning repo | Source file or deployment root | Public host type | Dashboard entrypoint(s) | Legacy URL(s) | Legacy handling rule | Last verified date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| JFK Psych Schedule | https://troyfowlermd.github.io/non-clinical/psych-scheduler.html | active | `non-clinical` | `psych-scheduler.html` | GitHub Pages | `my-dashboard/index.html` Schedules card; `non-clinical/index.html` Professional card | None | None | 2026-06-09 |
| JFK Med Staff Schedule | https://non-clinical-lac.vercel.app/ | active | `non-clinical` | `vercel-jfk/` | Vercel | `my-dashboard/index.html` Schedules card; `non-clinical/index.html` Professional card; `psych-scheduler.html` Related sidebar link | https://troyfowlermd.github.io/non-clinical/jfk-med-staff-schedule-experimental-v2.html | Old GitHub Pages URL stays live only as a forwarder to the Vercel app | 2026-06-09 |
| JFK Med Staff Schedule (legacy GitHub Pages URL) | https://troyfowlermd.github.io/non-clinical/jfk-med-staff-schedule-experimental-v2.html | legacy-forwarder | `non-clinical` | `jfk-med-staff-schedule-experimental-v2.html` | GitHub Pages | None; this path should not be used as a current entrypoint | https://non-clinical-lac.vercel.app/ | Immediate browser forward to the current Vercel app; do not restore old standalone app content here | 2026-06-09 |
| Psych Scheduler Command Center | https://troyfowlermd.github.io/non-clinical/psych-scheduler-experimental.html | active | `non-clinical` | `psych-scheduler-experimental.html` | GitHub Pages | `my-dashboard/index.html` Schedules card; `non-clinical/index.html` Professional card | None | None | 2026-06-09 |

## Update Rules

- Any future schedule-app URL, repo move, or host change must update this registry, all current live entrypoints, and any legacy-forwarder page in the same publish.
- Old schedule-app URLs should default to redirect-forwarders, not preserved live copies, unless Dr. Fowler explicitly chooses another retirement mode.
- `non-clinical` owns the canonical routing truth for the schedule apps. `my-dashboard` consumes this registry and should mirror it rather than redefining it.
