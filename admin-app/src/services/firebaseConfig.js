// Firebase configuration
// 1. Go to https://console.firebase.google.com → Create Project
// 2. Build → Firestore Database → Create (start in test mode for dev)
// 3. Build → Authentication → Sign-in method → Enable "Google"
// 4. Project Settings → Your apps → Web app → copy config below
// 5. Replace the placeholder values
//
// When config is filled, the app auto-uses Firestore (shared across all devices).
// When left as placeholder, it falls back to localStorage (single device).

export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Set to true once you paste real config above
export const FIREBASE_ENABLED = firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";
