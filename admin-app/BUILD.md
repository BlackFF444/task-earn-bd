# Task Earn BD — Admin Android App Build Guide

This is the **standalone Admin Panel** APK. It is a separate app (package id `com.taskearnbd.admin`) and only contains the admin dashboard with password login (`FAHIM2020`).

## Prerequisites
Same as the user app: Node.js 18+, JDK 17, Android Studio, Android SDK (API 34).

## Step 1 — Install deps
```bash
cd admin-app
npm install
npm install @capacitor/cli @capacitor/core @capacitor/android
```

## Step 2 — Build web bundle
```bash
npm run build
```

## Step 3 — Add Android platform (first time only)
```bash
npx cap add android
```

## Step 4 — Sync
```bash
npx cap sync android
```

## Step 5 — Build APK
```bash
npx cap open android
```
Android Studio → **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
Output: `android/app/build/outputs/apk/debug/app-debug.apk`.

## Important
- The admin app and the user app use **the same localStorage keys** (`task_earn_bd_*`).
  Install BOTH on the same device only for testing. In production, install the **admin APK on the admin's phone** and the **user APK on users' phones** — they are separate installs but read/write the same local data store *per device*.
- For real multi-user production you need a backend (Firebase / Node server). The current build is local-storage based and meant for a single-device / demo deployment. To make admin see all users across devices, point `dbService` at a shared backend (see `src/services/firebase.js` — it already abstracts storage behind `loadFromStorage`/`saveToStorage`).
