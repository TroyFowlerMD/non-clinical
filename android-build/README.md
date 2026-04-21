# Five Crowns — Offline APK Build

This folder wraps `five-crowns.html` in a [Capacitor](https://capacitorjs.com/) Android WebView so the app runs **fully offline** as an installable APK.

## How the APK is built

Every push to `main` that touches this folder (or `five-crowns.html`) triggers the GitHub Actions workflow at `.github/workflows/build-apk.yml`. The workflow:

1. Checks out the repo
2. Copies `five-crowns.html` into `android-build/www/index.html` (with manifest paths rewritten for offline use)
3. Runs `npm install` and `npx cap add android` to generate the native project
4. Runs `./gradlew assembleDebug` to produce a signed-for-testing debug APK
5. Uploads the APK as a workflow artifact named **five-crowns-apk**

## Downloading the APK

1. Go to [Actions → Build Five Crowns APK](https://github.com/TroyFowlerMD/non-clinical/actions/workflows/build-apk.yml)
2. Click the latest successful run
3. Under **Artifacts**, download `five-crowns-apk.zip`
4. Unzip → you get `five-crowns-debug.apk`

## Side-loading on Android

1. Transfer the APK to your phone (email, Drive, USB — any method)
2. Open it on the phone → Android will ask to allow install from unknown sources
3. Tap **Allow**, then **Install**
4. Launch "Five Crowns" from your home screen — works with no internet

## Rebuilding after edits

Just edit `five-crowns.html` in the repo root and push. The workflow picks up the change automatically and produces a new APK.
