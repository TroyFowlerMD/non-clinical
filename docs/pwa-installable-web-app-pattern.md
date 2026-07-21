# Installable PWA Pattern for Static GitHub Pages Apps

Use this as the canonical website-to-app checklist for static apps in `TroyFowlerMD/non-clinical`. The original working reference is Five Crowns (`five-crowns.html`, `manifest.json`, and `sw.js`). Sourdough Workbench uses a dedicated, app-scoped version under `personal/`.

## Required app files

1. A dedicated web app manifest containing:
   - `name` and `short_name`
   - a unique `id`
   - the live app `start_url`
   - a narrow, app-specific `scope` that does not overlap any other PWA on the origin
   - `display: "standalone"`
   - `theme_color` and `background_color`
   - 192×192 and 512×512 PNG icons, preferably maskable
   - `prefer_related_applications: false`
2. A service worker inside the app's scope that:
   - has a real `fetch` handler
   - precaches the HTML, manifest, and icons
   - provides an offline fallback
   - activates updates promptly
   - deletes only caches owned by that app
   - uses a non-overlapping registration scope matching only that app
3. HTML `<head>` metadata:
   - `<link rel="manifest">`
   - `theme-color`
   - mobile/Apple standalone metadata
   - an Apple touch icon
4. Page JavaScript that:
   - registers the scoped service worker
   - listens for `beforeinstallprompt`
   - stores the event and automatically reveals an in-app install suggestion
   - calls `prompt()` only after the user taps an Install button
   - hides install UI after `appinstalled` or in standalone display mode

## Important Chrome limitation

A website cannot automatically open Chrome's native install dialog. Chrome requires a user gesture. The supported pattern is to automatically show an in-app install banner when `beforeinstallprompt` fires, then open the native dialog when the user taps **Install app**.

## Multiple PWAs in this GitHub Pages repository

All project pages under `https://troyfowlermd.github.io/non-clinical/` share one origin. Each independently installable app must therefore have:

- its own unique manifest `id`
- its own `start_url`
- a manifest scope that does not contain another app's URL
- its own service-worker registration with the same non-overlapping scope
- its own cache name and cache cleanup limited to that app

Never give an individual app the manifest or service-worker scope `/non-clinical/`. That makes it claim every other tool in the repository. Avoid broad grouping scopes such as `/non-clinical/personal/` when that directory may later contain multiple installable apps. For a single-file static app, use the exact app URL as both the manifest scope and service-worker scope.

When correcting a previously broad service worker, add a one-time cleanup that unregisters only the known legacy registration by matching both its exact scope and script URL. Existing Android installations may retain old manifest metadata temporarily; uninstalling and reinstalling the affected app applies the corrected identity immediately.

## Publishing and verification

1. Commit every HTML, manifest, service-worker, and icon change together.
2. Publish to `main` so GitHub Pages deploys it.
3. Verify all asset URLs return successfully over HTTPS.
4. Confirm the manifest has the correct app-specific name, ID, start URL, non-overlapping scope, display mode, and icons.
5. Confirm the service worker controls only the intended app URL and has a non-empty fetch handler.
6. Compare the new app's manifest and service-worker scopes with every other PWA on the same origin; no app may contain another app's start URL.
7. Test on Android Chrome in a normal browser tab with the app not already installed. The in-app install suggestion should appear only after Chrome determines the page is eligible.
8. Install it and confirm it receives its own launcher icon, splash screen, app-list entry, and Recent Apps identity.
9. Open every other installed PWA on the same origin and confirm each still launches its own start URL and identity.
10. When updating cached assets, bump the service worker cache version.

## Future ChatGPT request

Use this wording:

> Make this site an installable PWA using the canonical pattern in `TroyFowlerMD/non-clinical/docs/pwa-installable-web-app-pattern.md`. Give it its own manifest, scoped service worker, 192/512 icons, and Chrome `beforeinstallprompt` install banner. Publish to `main` and verify the live app.
