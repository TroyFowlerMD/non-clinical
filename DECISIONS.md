# Decisions

This file records durable architectural, workflow, safety, and publishing decisions for Non-Clinical Tools. Each entry should include Context, Decision, Rationale, and Consequences.

---

### 2026-07-22 - Build Dr. Troy's Killer Burgers As A Dedicated Static Vercel PWA
Context: The burger recipe app needs to be installable, offline-capable, printable, bilingual, and deployable separately at the preferred `drtroyskillerburgers` Vercel slug while using the supplied hero artwork.
Decision: Keep the app in `dr-troys-killer-burgers/` as a dedicated static TypeScript build that outputs `dist/` for Vercel, with generated assets under `assets/generated/`, a relative app-scoped manifest/service worker, and the canonical production URL centralized in recipe code and QR generation.
Rationale: A folder-scoped static build is enough for the recipe app, avoids adding a backend or framework runtime, keeps PWA scope narrow if served under another origin, and lets Vercel use this folder as the project root.
Consequences: If the production URL changes, update `CANONICAL_URL`, manifest metadata, and QR generation together, rerun `npm run check`, and regenerate assets before deploying. The Vercel project root should be `dr-troys-killer-burgers/`, not the repo root or the existing `non-clinical` Vercel project.

### 2026-06-10 - Use Private GitHub Issues As The Shared Feedback Inbox
Context: Both schedule apps had drifted into a mixed feedback setup using Apps Script, FormSubmit, email confirmation rules, and a Google Sheet `Feedback` tab. The owner wanted one shared mechanism, private by default, with a simpler future `#IT` triage workflow.
Decision: Route Psych Scheduler and JFK Med Staff Schedule feedback through one shared Vercel endpoint at `vercel-jfk/api/feedback.js`, then create private issues in `TroyFowlerMD/non-clinical-feedback`. Keep the Google Apps Script bridge for schedule-data reads only, not as the feedback inbox.
Rationale: One private GitHub Issues inbox gives both apps the same intake behavior, keeps operational requests off the public repo, and makes triage/documentation easier than maintaining separate Sheet and email flows.
Consequences: Future feedback changes should update the shared endpoint, both app entrypoints, and the operator docs in the same change set. `#IT` should inspect the private GitHub Issues repo instead of the old Google Sheet `Feedback` tab. If the private repo, PAT, or Vercel env vars are missing, Codex must report that live verification is blocked instead of claiming the new inbox is active.

### 2026-06-10 - Keep One Canonical Shared Schedule Directory Source
Context: The Psych Scheduler and JFK Med Staff Schedule both needed the same directory/contact data, and the owner explicitly wanted one source of truth so future URL changes, repo moves, and startup sessions would not miss stale copies.
Decision: Keep shared schedule-directory data in `data/schedule-directory.json`. Regenerate app-specific inline data blocks with `scripts/sync-schedule-directory.mjs` instead of fetching runtime JSON. Treat `vercel-jfk/index.html` as the canonical JFK med-staff HTML file, and copy that full file byte-for-byte to the two alias HTML paths during the sync step.
Rationale: One editable canonical file prevents silent contact drift, preserves the current single-file/static deployment architecture, and makes future contact changes or repo handoffs verifiable with one `--check` command.
Consequences: Future schedule-directory edits should change the JSON first, rerun the sync script, avoid hand-editing generated blocks, and confirm the two alias HTML files still match the canonical JFK file exactly before shutdown.

### 2026-06-09 - Keep One Canonical Schedule-App Route Registry And Forward Legacy URLs
Context: The schedule apps now span GitHub Pages and Vercel, and a partial Copilot update showed how easy it is for current URLs, old URLs, and repo ownership assumptions to drift apart across future sessions.
Decision: Keep `docs/schedule-app-canonical-routes.md` as the primary routing source of truth for the schedule apps. When a schedule-app URL, host, or repo location changes, update the registry, all live entrypoints, and the old-URL behavior in the same change set. Retire old public schedule URLs as redirect-forwarders by default instead of leaving stale live copies behind.
Rationale: A single canonical registry plus explicit forwarder policy makes future repo moves, hostname swaps, and cross-repo schedule work less likely to miss the current live app or revive an old one accidentally.
Consequences: Future schedule-app work should start by reading the registry, verify both the current live URL and any intentional legacy-forwarder URL after publish, and avoid treating old GitHub Pages copies as active apps unless Dr. Fowler explicitly reverses that policy.

### 2026-05-22 - Add `#IT` As The Scheduler Request Triage Command
Context: Before the 2026-06-10 shared feedback migration, Dr. Fowler wanted a short command that made Codex go straight to the then-current Psych Scheduler feedback inbox and propose actions without rediscovering the sheet workflow.
Decision: At that time, treat `#IT` and plain-language IT variants as command aliases for reading `Medical Staff Schedule ANALYSIS SHEET` > `Feedback`, reporting active non-test rows, and proposing concrete actions before implementation.
Rationale: A command alias reduces setup friction and keeps scheduler request triage consistent across Codex sessions and workstations.
Consequences: Historical only. This sheet-based `#IT` workflow was superseded on 2026-06-10 by the private GitHub Issues inbox decision above. Current `#IT` triage should read `docs/psych-scheduler-it-request-inbox.md`, inspect `TroyFowlerMD/non-clinical-feedback`, and wait for approval before editing files or closing issues.

### 2026-05-22 - Distinguish Psych Scheduler Data Sources In The Production Badge
Context: The production scheduler can load from the live Google Sheet, pasted TSV, or Excel upload, but the existing top data bar could continue showing Google Sheet freshness after manual data replacement.
Decision: Track the active in-memory data source separately from Drive sync status and show `Live.Sheet1`, `Pasted data`, or `Excel upload` in the production data bar. Treat live Sheet metadata older than 7 days as stale. Leave `psych-scheduler-experimental.html` unchanged until experimental parity is explicitly requested.
Rationale: Users need to know what data they are actually viewing, especially when paste or Excel fallback data replaces the live Sheet data in memory.
Consequences: Future production source-display changes should update the shared in-memory source state rather than deriving the label only from `driveStatus`. Excel upload may sync back to Drive, but the current page source should still identify the upload unless the page reloads from `Live.Sheet1`.

### 2026-05-22 - Track Psych Scheduler IT Requests In The Schedule Sheet
Context: Before the 2026-06-10 shared feedback migration, Dr. Fowler wanted future Codex sessions to check active scheduler feedback/IT requests, report them, suggest fixes, and ask clarifying questions when needed.
Decision: At that time, use the existing `Medical Staff Schedule ANALYSIS SHEET` as the request inbox by adding a separate `Feedback` tab, while leaving schedule reads on `Sheet1`. Keep the Apps Script source in this repo under `apps-script/psych-scheduler-feedback/` and use clasp for future edits/deploys.
Rationale: This keeps the request workflow tied to the scheduler's existing Google infrastructure without adding a separate backend or changing the schedule-loading path.
Consequences: Historical only. The sheet-based request inbox was superseded on 2026-06-10 by the shared Vercel-to-private-GitHub-Issues flow. Current scheduler request triage should use `docs/psych-scheduler-it-request-inbox.md` plus `TroyFowlerMD/non-clinical-feedback` as the operational inbox. The Apps Script project still remains relevant for schedule-data reads, so `DRIVE_EXEC_URL` stability and workstation clasp setup guidance still matter for that narrower scope.

### 2026-05-21 - Keep My Schedule Provider Assignments In A Left-Side Block
Context: My Schedule users can remove and re-add the selected-provider assignment column and individual provider schedule columns. Re-added columns could move to the far right, away from the day/date and selected-provider context.
Decision: Normalize My Schedule column order after toggle, all-provider toggle, drag/drop, reset, PTO-only restore, and provider-profile changes so Day / Date stays first, the selected-provider assignment column stays second when enabled, and individual provider schedule columns stay immediately after it.
Rationale: This keeps the assignment columns visually grouped where providers compare schedules, while leaving Working Providers as a separate summary column.
Consequences: Future My Schedule column changes should route through the shared ordering helper and verify sticky header alignment after re-render.

### 2026-05-21 - Use A Cloned Header For Dashboard Sticky Scrolling
Context: The My Schedule dashboard table needs horizontal table scrolling and a header that appears only when the real table header reaches the top of the `.main` scroll viewport. Native `position: sticky` was unreliable because the horizontal overflow wrapper became the nearest scroll container and the header still scrolled away.
Decision: Keep the real dashboard table in normal page flow, render its header normally, and show a lightweight fixed cloned header only while the real header has crossed the top of `.main`. Sync the clone to the real table's column widths and horizontal scroll position using dashboard-only scroll/resize listeners plus a lightweight active-dashboard layout sync loop.
Rationale: This preserves the single-file app and horizontal scrolling while avoiding the browser sticky/overflow conflict that caused repeated failed fixes.
Consequences: Future My Schedule column/header changes should verify the cloned header remains aligned after table re-render, horizontal scroll, desktop width, and mobile width.

### 2026-05-20 - Keep Staffing Command Center Work In A Separate Experimental Page
Context: The production Psych Scheduler page is the live staffing tool and needed to remain stable while a more ambitious analytics interface was requested.
Decision: Clone production into `psych-scheduler-experimental.html` and keep experimental mode defaults, staffing-risk summary cards, and canvas timeline work there instead of redesigning `psych-scheduler.html`.
Rationale: A separate static page lets the owner test richer operational analytics against the same live Google Sheet and fallback ingestion paths without putting the production scheduler at risk.
Consequences: Production remains available at `psych-scheduler.html`; future command-center changes should land in the experimental file until explicitly promoted.

### 2026-05-20 - Feedback Success Requires Confirmed Email Delivery
Context: The Psych Scheduler feedback modal could show a green success message when only an unconfirmed no-CORS logger request completed, while the owner did not receive email.
Decision: Treat the feedback Apps Script as the primary owned email/log path and require JSON confirmation with `emailed: true` before showing full success. Keep FormSubmit only as a confirmed email fallback, and reserve the no-CORS Apps Script request for warning-state backup logging.
Rationale: A static GitHub Pages app cannot prove an opaque no-CORS request sent email, so the UI should not clear the form or claim success from that path alone.
Consequences: The deployed feedback Apps Script must send the email and return the documented response contract in `docs/psych-scheduler-feedback-apps-script-contract.md`; otherwise users will see a warning or depend on FormSubmit availability.

### 2026-05-11 - Preserve Psych Scheduler Parser During Surgical Patches
Context: Several Psych Scheduler fixes touched UI, columns, and ingestion paths, while parser regressions had previously broken paste recognition.
Decision: Preserve `parseTSVRobust()` and `parseAndLoad()` verbatim during surgical patches unless the task explicitly targets parsing.
Rationale: These functions are fragile and shared by paste, Drive, and Excel ingestion paths.
Consequences: Future patches should route new ingestion behavior through existing parser/loading helpers rather than rewriting parser internals.

### 2026-05-11 - Excel Ingestion Uses Existing App Loading Path
Context: Initial Excel ingestion code referenced missing globals/helpers and emitted comma-delimited output that did not work with the TSV parser.
Decision: Convert the first workbook sheet to TSV manually and route through `parseAndLoad()`.
Rationale: This reuses the same `DATA` assignment, `onDataLoaded()`, and visible result reporting used by the paste flow.
Consequences: New file-ingestion work should verify referenced globals and helper functions against the current single-file app before commit.

### 2026-05-11 - Post-Call Exclusion Belongs In Working-Provider Lists
Context: A global post-call reclassification attempt broke the deployed page and had to be reverted.
Decision: Exclude post-call cells at `workingCore` / `workingTemp` list construction or an equivalent availability helper, not by changing global classification or parser behavior.
Rationale: The targeted fix solved staffing counts without disrupting broader classification behavior.
Consequences: Future post-call changes should avoid broad parser/classifier rewrites unless fully tested.

### 2026-05-11 - Keep One Canonical Psych Scheduler Project Page
Context: Notion had duplicate Psych Scheduler project pages.
Decision: Keep the newer detailed Psych Scheduler page active and convert the older duplicate to an archived redirect note.
Rationale: Avoids two active sources of truth while preserving old references.
Consequences: GitHub docs should now become the durable source of truth for this project context.

### 2026-05-14 - Default To Live Google Sheet With Fallback Ingestion
Context: Psych Scheduler evolved from paste-only to a live Google Sheets-backed workflow, while fallback ingestion remains important.
Decision: Use the live Google Sheet as the default entry source and keep paste/Excel fallback paths available.
Rationale: The live Sheet reduces manual loading while preserving resilience if the bridge fails or stale data is suspected.
Consequences: Startup/loading changes should preserve `loadFromDrive()` behavior and fallback UI rather than replacing the ingestion model.

### 2026-05-19 - Feedback Modal Keeps A Maintenance-Log Fallback
Context: The feedback modal was showing a user-facing failure when the current email-only FormSubmit path failed.
Decision: Keep feedback submission as a dual-path workflow: FormSubmit email plus the maintenance-request Apps Script logger. Send the Apps Script request in a no-CORS-compatible shape from the static GitHub Pages app.
Rationale: Psych Scheduler has no backend server, so the modal needs at least one browser-safe external path to accept maintenance requests.
Consequences: Future feedback changes should preserve an independent maintenance-log fallback and should be browser-tested from the static page context before publishing.

### 2026-05-19 - Keep Personal Educational Pages Under personal/
Context: The repo needed a public plain-English Power of Attorney guide that is non-clinical and family-facing.
Decision: Place standalone personal educational pages under `personal/`, starting with `personal/poa-guide.html`.
Rationale: This keeps personal/family utilities separate from the root-level app pages without splitting the single static GitHub Pages repo.
Consequences: Future personal pages should use the `personal/` path unless a larger reorganization is explicitly chosen.

### 2026-05-19 - Allow Local Checklist State For Personal Guides
Context: The POA logistics guide is a browser-only checklist and should not lose checked items on the same device.
Decision: Use browser localStorage only for non-sensitive checkbox completion state on personal checklist pages.
Rationale: This improves usability without sending data anywhere or storing names, account numbers, or form contents.
Consequences: Future checklist persistence should avoid storing sensitive details and should remain local to the user's device unless explicitly redesigned.

### 2026-05-21 - Prefer PR + Squash-Merge For Codex Cloud Activation
Context: Codex Cloud workspaces can have missing push/remote wiring, which can make direct push-based activation inconsistent and confusing for the owner.
Decision: Default Codex Cloud publishing to PR-based activation: Codex commits and opens a PR; Dr. Fowler squash-merges on GitHub to activate changes on `main`. Use manual single-file GitHub upload/commit only when PR push is unavailable.
Rationale: This keeps activation steps consistent, easy to explain, and aligned with GitHub as source of truth while preserving a practical fallback path.
Consequences: Future shutdown summaries should explicitly state whether activation is pending merge, merged, or manually committed in GitHub.

### 2026-05-22 - Explain Repo Work With Beginner Context
Context: Dr. Fowler is new to Git, GitHub, GitHub Desktop, Codex, and local-vs-remote repository workflows.
Decision: Codex should explain repo work with extra beginner-friendly context by default, including definitions, why each step matters, exact local paths/button names when useful, and a clear distinction between local files, local commits, pushed GitHub commits, pull requests, and deployed site changes.
Rationale: Better context reduces accidental duplicate clones, OneDrive/Git confusion, and uncertainty about whether work is local, synced, or live.
Consequences: Future repo instructions and shutdown summaries should favor plain outcome language and step-by-step guidance over unexplained Git shorthand.

### 2026-05-22 - Surface Workflow Streamlining Opportunities
Context: Dr. Fowler wants Codex to notice chances to make his coding, GitHub, GitHub Desktop, deployment, and cross-machine workflows smoother.
Decision: When Codex sees a practical workflow improvement, it should present the opportunity proactively with the expected benefit, any risk or cost, and the smallest safe next step.
Rationale: Small workflow improvements compound, especially while Dr. Fowler is learning Git and using Codex across multiple machines.
Consequences: Future sessions should separate optional workflow suggestions from required task work so recommendations help without derailing the current task.

### 2026-05-22 - Keep Cross-Computer Setup Guide In non-clinical
Context: Dr. Fowler uses Codex Desktop and GitHub Desktop across multiple Windows computers and wants a repeatable way to mirror local project setup without OneDrive.
Decision: Keep the workstation setup checklist and helper script in `TroyFowlerMD/non-clinical` under `docs/windows-codex-github-workstation-setup.md` and `scripts/setup-codex-projects.ps1`.
Rationale: `non-clinical` is a familiar durable repo that is already part of the shared active-project set and can bootstrap the rest of the repos on a new machine.
Consequences: On a new computer, clone `non-clinical` first, then use its setup guide/script to clone or update the other active repos under `Documents\Codex\Projects`.

### 2026-06-23 - Build Dog Whistle As A Native Android Project
Context: Dog Whistle needs press-and-hold audio playback, haptic feedback, screen-off notification controls, and an experimental hardware-button activation path, all ending in a sideloadable APK.
Decision: Implement Dog Whistle as a standalone native Android project under `dog-whistle-android/` with Kotlin, Jetpack Compose, a foreground playback service, and GitHub Actions APK automation, instead of trying to force it into the repo's older Capacitor wrapper pattern.
Rationale: The requested behavior depends on Android-native audio, service, vibration, and accessibility APIs that are materially more reliable and maintainable in a native app than in a web wrapper.
Consequences: Future Dog Whistle iterations should stay in the native Android project, and APK verification should continue through the dedicated `Build Dog Whistle APK` workflow artifact path.
