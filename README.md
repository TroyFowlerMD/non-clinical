# non-clinical

Non-clinical TroyMD tools and personal/professional utility pages. The primary active app is Psych Scheduler, a single-file static GitHub Pages scheduling tool that defaults to a live Google Sheet and keeps paste/Excel fallback ingestion available. The current JFK Med Staff Schedule app is served from Vercel at `https://non-clinical-lac.vercel.app/`, while the older GitHub Pages med-staff URL is retained only as a legacy forwarder.

Shared schedule-directory contact data now lives in `data/schedule-directory.json`. Regenerate both apps from that source with `node scripts/sync-schedule-directory.mjs` instead of hand-editing duplicated contact blocks.

## Project Files
- `dr-troys-killer-burgers/`: Bilingual installable recipe PWA for Dr. Troy's Killer Burger Patties, with approved recipe content, scaling, print/PDF, offline support, and Vercel deployment configuration. See `dr-troys-killer-burgers/README.md`.
- `volunteer-hub/`: Static site listing 12 vetted volunteer opportunities for a solo 15-year-old in Buncombe County, NC (cards, Leaflet map, comparison table). See `volunteer-hub/README.md`.
- `CONTEXT.md`: Short session-start briefing for Codex and returning developers.
- `TASKS.md`: Live working task list seeded from the migrated Notion state.
- `WORKLOG.md`: Append-only session-end worklog format.
- `DECISIONS.md`: Key architectural and workflow decisions extracted from Notion.
- `AGENTS.md`: Existing repo-specific Codex instructions for Psych Scheduler work.
- `data/schedule-directory.json`: Canonical shared directory/contact source for Psych Scheduler and JFK Med Staff Schedule.
- `docs/schedule-app-canonical-routes.md`: Canonical registry for current schedule-app URLs, owning repos, dashboard entrypoints, and legacy-forwarder behavior.
- `docs/pwa-installable-web-app-pattern.md`: The one canonical, project-agnostic instruction set for making any website an installable PWA.
- `docs/psych-scheduler.md`: Canonical migrated Psych Scheduler project page.
- `docs/psych-scheduler-feedback-logging-added.md`: Historical pre-migration note for the retired Apps Script/FormSubmit feedback path.
- `docs/psych-scheduler-feedback-apps-script-contract.md`: Historical retired Apps Script feedback contract kept only for reference.
- `docs/non-clinical-feedback-github-issues.md`: Current private GitHub Issues workflow for shared schedule-app feedback.
- `docs/psych-scheduler-it-request-inbox.md`: Current `#IT` / scheduler-request triage workflow.
- `docs/psych-scheduler-column-toggles-backup-call-buttons-auto-deselect.md`: Provider-column and Backup Call column-toggle change log.
- `docs/excel-drag-and-drop-ingestion-added-to-psych-scheduler.md`: Initial Excel ingestion implementation note.
- `docs/excel-ingestion-filelist-file-hotfix.md`: First Excel ingestion hotfix note.
- `docs/excel-ingestion-hotfix-2.md`: Second Excel ingestion hotfix and verification note.
- `docs/reverted-post-call-classification-fix.md`: Reverted post-call classification change and follow-up note.
- `docs/psych-scheduler-post-call-staffing-bug-fixed.md`: Final targeted post-call staffing count fix.
- `docs/consolidated-duplicate-psych-scheduler-project-page.md`: Notion duplicate consolidation note.
- `docs/windows-codex-github-workstation-setup.md`: Other-computer setup guide for GitHub repos, Codex Desktop, clasp, and Psych Scheduler Apps Script access.
- `scripts/setup-codex-projects.ps1`: Bootstrap active repos and optionally run Psych Scheduler Apps Script access setup on another Windows workstation.
- `scripts/setup-psych-scheduler-appscript-access.ps1`: Install/verify Node.js, clasp, Google Apps Script login, and local feedback admin token access.
- `scripts/sync-schedule-directory.mjs`: Regenerates shared directory blocks inside `psych-scheduler.html` and `vercel-jfk/index.html`, then copies the canonical JFK HTML to its alias files.
