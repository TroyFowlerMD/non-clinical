# Dog Whistle Android

## What this app does

- Plays a continuous high-frequency whistle while the user presses and holds the main button.
- Lets the user enable vibration feedback, audible cue feedback, or both.
- Keeps a foreground notification available for screen-off use.
- Offers an experimental accessibility-service mode that tries to use the phone's volume buttons as a hold-to-whistle trigger.

## Current platform limits

- The app cannot reliably guarantee that only dogs hear the sound. Phone speakers vary, some adults can still hear part of the tone, and some phones may not reproduce `19 kHz` well.
- The app does **not** override the phone's true built-in maximum speaker output. On stock Android, a normal APK can raise the media stream only up to the system-reported max.
- The volume-button screen-off mode is **experimental**. It depends on the user enabling an accessibility service and may behave differently across devices and lock-screen states.

## Build shape

- Native Android app
- Kotlin
- Jetpack Compose
- Foreground service for playback and notification controls
- Accessibility service for optional hardware-button capture

## Main behaviors

- The main whistle button spans the full width of the screen and takes roughly one third of the screen height.
- Press down starts the whistle immediately.
- Releasing the press stops the whistle immediately.
- If `Vibrate feedback` is checked, the phone vibrates in pulses while the whistle is active.
- If `Audible cue feedback` is checked, a short repeating beep plays while the whistle is active.
- If screen-off mode is armed, the app keeps an idle foreground notification available so the user can start or stop the whistle from the lock screen or notification shade.

## Accessibility setup

1. Open the app.
2. Turn on `Arm screen-off buttons`.
3. Tap the system Accessibility settings shortcut shown by Android, or manually enable `Dog whistle key mode` in Accessibility settings.
4. Once enabled, pressing and holding a volume button should start the whistle. Releasing it should stop the whistle.

If that mode does not work reliably on a specific phone, the notification controls remain the supported fallback.

## Local build notes

This workspace did not include a local Java/Gradle toolchain at implementation time, so the project was scaffolded but not built locally here.

To build manually on a development machine:

1. Install Android Studio or a JDK + Android SDK + Gradle.
2. Open `dog-whistle-android/` as an Android project.
3. Build the `app` module or run `gradle :app:assembleDebug`.

