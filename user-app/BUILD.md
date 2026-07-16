# Task Earn BD — User Android App Build Guide

This is the **user-facing** app (Telegram + Google login). It builds into an Android APK via Capacitor.

## Prerequisites (install once on your build PC)
1. **Node.js 18+** — https://nodejs.org
2. **Java JDK 17** — https://adoptium.net (set `JAVA_HOME`)
3. **Android Studio** — https://developer.android.com/studio
   - During install, also install **Android SDK** + **Android SDK Command-line Tools**
   - In Android Studio → SDK Manager → install **Android 14 (API 34)** platform
4. Environment variables:
   ```
   JAVA_HOME   = C:\Program Files\Eclipse Adoptium\jdk-17...\  (or your path)
   ANDROID_HOME = C:\Users\<you>\AppData\Local\Android\Sdk
   ```
   Add `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\cmdline-tools\latest\bin` to PATH.

## Step 1 — Install deps
```bash
cd user-app
npm install
npm install @capacitor/cli @capacitor/core @capacitor/android
```

## Step 2 — Build web bundle
```bash
npm run build
```
Output goes to `user-app/dist`.

## Step 3 — Add Android platform (first time only)
```bash
npx cap add android
```
This creates `user-app/android/`.

## Step 4 — Sync web code into the native project
```bash
npx cap sync android
```

## Step 5 — Open in Android Studio & build APK
```bash
npx cap open android
```
In Android Studio:
- Wait for Gradle sync to finish.
- Menu → **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
- APK appears at `android/app/build/outputs/apk/debug/app-debug.apk`.
- For a release (publishable) APK: **Build → Generate Signed Bundle / APK**.

## Google Login setup
1. Go to https://console.cloud.google.com → **APIs & Services → Credentials**.
2. Create **OAuth 2.0 Client ID** of type **Web application**.
3. Add authorized JavaScript origin: `http://localhost` (dev) and your deploy URL.
4. Copy the Client ID and paste into `user-app/src/services/google.js`:
   ```js
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```
5. Rebuild (`npm run build && npx cap sync android`).

## Notes
- Telegram login works automatically when the Mini App is opened from the bot.
- Google login works in the standalone Android app / browser.
- Both share the same localStorage data model, so a user logged in via either method keeps their balance & referrals on the same device.
