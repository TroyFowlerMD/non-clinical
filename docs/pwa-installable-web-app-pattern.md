# Installable PWA Pattern for Static GitHub Pages Apps

Use this as the canonical website-to-app checklist for static apps in `TroyFowlerMD/non-clinical`. The original working reference is Five Crowns (`five-crowns.html`, `manifest.json`, and `sw.js`). Sourdough Workbench uses a dedicated, app-scoped version under `personal/`.

## Required app files

1. A dedicated web app manifest containing:
   - `name` and `short_name`
   - a unique `id`
   - the live app `start_url`
   - a narrow `scope`
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

## Publishing and verification

1. Commit every HTML, manifest, service-worker, and icon change together.
2. Publish to `main` so GitHub Pages deploys it.
3. Verify all asset URLs return successfully over HTTPS.
4. Confirm the manifest has the correct app-specific name, ID, start URL, scope, display mode, and icons.
5. Confirm the service worker controls the app URL and has a non-empty fetch handler.
6. Test on Android Chrome in a normal browser tab with the app not already installed. The in-app install suggestion should appear only after Chrome determines the page is eligible.
7. When updating cached assets, bump the service worker cache version.

## Future ChatGPT request

Use this wording:

> Make this site an installable PWA using the canonical pattern in `TroyFowlerMD/non-clinical/docs/pwa-installable-web-app-pattern.md`. Give it its own manifest, scoped service worker, 192/512 icons, and Chrome `beforeinstallprompt` install banner. Publish to `main` and verify the live app.
