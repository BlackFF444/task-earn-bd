# Task Earn BD — Multi-Platform Project

Earn BDT by completing micro social tasks. Withdraw via bKash / Nagad. Referral system built in.

## Folder Structure

```
task-earn-bd/
├── user-app/        # User Android App (Capacitor) — Telegram + Google login
│   ├── src/
│   │   ├── services/google.js     # Google OAuth login
│   │   └── services/firebase.js   # Auth + DB (localStorage, abstracted)
│   ├── capacitor.config.ts
│   ├── BUILD.md                    # How to build the APK
│   └── dist/                       # Built web bundle (after npm run build)
│
├── admin-app/       # Admin Android App (Capacitor) — standalone admin panel
│   ├── src/AdminApp.jsx            # Admin-only shell (password FAHIM2020)
│   ├── capacitor.config.ts
│   ├── BUILD.md
│   └── dist/
│
├── bot/             # Telegram Bot (backup + referral deep links)
│   └── index.js                     # node-telegram-bot-api script
│
└── (root)           # Original Telegram Mini App (GitHub Pages deploy)
```

## Apps

### 1. User App (`user-app/`)
- Login: **Telegram** (auto when opened from bot) OR **Google** (standalone Android/browser).
- Features: Home dashboard, Tasks with proof upload, Events/Leaderboard, Wallet/Withdraw (bKash/Nagad), Referrals.
- Build → `user-app/BUILD.md`

### 2. Admin App (`admin-app/`)
- Standalone APK. Password: `FAHIM2020`.
- Manages tasks, withdrawal approvals, task claim approvals, announcements, user tester.
- Build → `admin-app/BUILD.md`

### 3. Telegram Bot (`bot/`)
- Backup entry point. Sends Mini App deep link with `?start=REFCODE`.
- Referral credit happens inside the app.
- Run: `cd bot && npm install && node index.js` (set `BOT_TOKEN` + `WEBAPP_URL`).

## Important Notes
- Both apps support a **Firebase Firestore backend** (shared across all devices). By default they use
  **localStorage** (single device) until you fill in `src/services/firebaseConfig.js`.
  See **FIREBASE_SETUP.md** for full steps — once configured, admin sees ALL real users.
- `APP_VERSION` in `firebase.js` forces a localStorage wipe on version bump (currently `5.0.0`).
- Currency is **BDT** (৳). Payments via **bKash / Nagad**.
- Login: **Telegram** (from bot) + **Google OAuth** (standalone Android/browser). See `src/services/google.js`.
- Telegram bot (`bot/index.js`) is the backup entry point and carries referral deep links.
