# JFK v2 Android App and Widget

## Purpose

`jfk-med-staff-schedule-experimental-v2.html` can be packaged as a dedicated Android app through `android-jfk-v2/` and `.github/workflows/build-jfk-v2-apk.yml`.

The app is a Capacitor WebView wrapper around the existing single-file JFK v2 schedule page. The home-screen widget is native Android code because Android app widgets cannot embed or reuse the page's WebView directly.

## Why the widget needs native rendering

Android home-screen widgets are hosted by the launcher, not by the app's WebView. They use `AppWidgetProvider` and `RemoteViews`, which support a limited set of native layouts and widgets. That means a functional widget must:

- receive a compact daily schedule data snapshot from the app,
- store schedule data in native storage,
- recreate the daily schedule UI with native widget views,
- update itself when the app loads data or when a background refresh succeeds.

The generic Android-widget prompt in the cross-repo template is not enough by itself because it does not define a schedule-specific data contract or require a native recreation of the daily schedule layout.

## Build path

- Source HTML: `jfk-med-staff-schedule-experimental-v2.html`
- Android wrapper: `android-jfk-v2/`
- Build workflow: `.github/workflows/build-jfk-v2-apk.yml`
- App ID: `com.troyfowlermd.jfkmedstaffschedule`
- App name: `JFK Med Staff Schedule`
- GitHub Actions artifact: `jfk-v2-schedule-apk`
- APK filename inside artifact: `jfk-v2-schedule-debug.apk`

The workflow regenerates the Capacitor `android/` project during each build, then copies native widget Java and XML templates from `android-jfk-v2/native/`.

## Data contract

The web app calls the native Capacitor plugin `JfkScheduleWidget.saveSnapshot()` only when running inside Android Capacitor. Normal GitHub Pages browser use is a no-op.

The plugin receives:

- `snapshot`: JSON string for the currently selected daily schedule.
- `rawJson`: JSON string containing schedule `headers`, `rows`, and `fetchedAt`.
- `metaJson`: JSON string containing `asOf` and source label.
- `dailyDate`: selected schedule date.

The daily snapshot shape is:

```json
{
  "version": 1,
  "dailyDate": "YYYY-MM-DD",
  "title": "Fri, May 29",
  "asOf": "May 29, 2026, 9:00 AM",
  "label": "Google Sheet",
  "sections": [
    {
      "id": "acu",
      "title": "ACU",
      "color": "#6cc7bd",
      "rows": [
        {
          "label": "Team A",
          "psych": [{"name": "Fowler", "note": ""}],
          "medical": [{"name": "Nolan", "note": "AM"}]
        }
      ]
    }
  ],
  "rows": [
    {
      "sectionId": "acu",
      "sectionTitle": "ACU",
      "sectionColor": "#6cc7bd",
      "label": "Team A",
      "psych": [{"name": "Fowler", "note": ""}],
      "medical": [{"name": "Nolan", "note": "AM"}]
    }
  ]
}
```

## Widget behavior

- Daily schedule view only.
- No month calendar.
- No directory.
- Dark theme and section colors mirror JFK v2 as closely as Android widget limits allow.
- Uses a `ListView` collection so a full-screen widget can scroll through overflow rows.
- Tap the widget body to open the app.
- Tap `<` or `>` to move the widget to the previous or next daily schedule from the cached raw schedule.
- Tap `Refresh` to enqueue a native background refresh.
- A periodic background worker refreshes at a conservative interval and updates the widget from the Apps Script endpoint when network is available.

## Verification checklist

Before merging widget changes:

1. Confirm normal GitHub Pages behavior still works for `jfk-med-staff-schedule-experimental-v2.html`.
2. Confirm the extracted JFK v2 script parses.
3. Confirm `.github/workflows/build-jfk-v2-apk.yml` builds successfully.
4. Download the `jfk-v2-schedule-apk` artifact.
5. Install `jfk-v2-schedule-debug.apk` on an Android device or emulator.
6. Open the app and confirm Daily, Month, Directory, upload, feedback, and mobile swipe behavior still work.
7. Add the widget to the home screen, resize it to full-screen space, and confirm the daily widget rows match the app's Daily view.
