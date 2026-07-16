# Firebase Backend Setup (Required for production / shared data)

The apps use **localStorage by default** (works on a single device). To make data shared
across **all users and the admin app** (real production), enable Firebase Firestore.

## 1. Create Firebase project
- Go to https://console.firebase.google.com → **Add project**
- Name it e.g. `task-earn-bd`

## 2. Enable Firestore
- **Build → Firestore Database → Create database**
- Start in **test mode** (or set rules so authenticated users can read/write their own doc)
- Region: choose closest to you

## 3. Enable Google Auth
- **Build → Authentication → Get started**
- **Sign-in method → Add provider → Google** → Enable

## 4. Add a Web App
- **Project Settings → Your apps → Web app** (</>) 
- Register, copy the `firebaseConfig` object

## 5. Paste config
Open `user-app/src/services/firebaseConfig.js` (and same file in `admin-app/`):

```js
export const firebaseConfig = {
  apiKey: "AIza.....",
  authDomain: "task-earn-bd.firebaseapp.com",
  projectId: "task-earn-bd",
  storageBucket: "task-earn-bd.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc..."
};
```

Once `apiKey` is no longer the placeholder, the app **auto-switches to Firestore**.
No other code change needed — `src/services/firebase.js` detects it via `FIREBASE_ENABLED`.

## 6. Seed tasks (optional)
Tasks auto-seed from `DEFAULT_TASKS` on first read if the `tasks` collection is empty.
You can also add/edit tasks from the Admin app.

## 7. Firestore Security Rules (production)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
Tighten as needed. For a launch, restrict writes to own-user docs.

## Notes
- Admin app uses the **same Firestore project** → sees all real users, claims, withdrawals.
- Telegram login stores `telegramId`; Google stores `googleId`. Both live in `users` collection.
- Referral: opening app with `?start=CODE` (Telegram) or `?ref=CODE` (Google/Android) credits referrer ৳0.5.
