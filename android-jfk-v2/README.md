# JFK Med Staff Schedule v2 Android Build

This folder builds `jfk-med-staff-schedule-experimental-v2.html` into a debug Android APK using Capacitor.

The app itself is a WebView wrapper around the existing single-file page. The home-screen widget is native Android because Android widgets cannot embed the same WebView page. The app syncs a daily schedule snapshot to native storage, and the widget renders that snapshot with Android-supported widget views.

## GitHub Actions build

The workflow at `.github/workflows/build-jfk-v2-apk.yml`:

1. Copies `jfk-med-staff-schedule-experimental-v2.html` into `android-jfk-v2/www/index.html`.
2. Installs Capacitor dependencies.
3. Generates the Android platform.
4. Adds the native widget provider, widget data service, refresh worker, and local Capacitor bridge.
5. Builds `jfk-v2-schedule-debug.apk`.
6. Uploads the APK artifact as `jfk-v2-schedule-apk`.

## Widget behavior

- Daily view only.
- No month calendar and no directory.
- Uses the same schedule data and date selection as the app.
- Tap the widget body to open the app.
- Tap Refresh to request a native background refresh from the Google Sheet endpoint.
- Periodic refresh is scheduled at a conservative interval so the widget does not poll constantly.

## Local build note

This folder intentionally does not commit the generated `android/` directory. The CI workflow regenerates it to keep the repository small and avoid generated-file drift.
