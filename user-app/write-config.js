import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfig = `import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: ${JSON.stringify(process.env.FIREBASE_API_KEY || 'YOUR_FIREBASE_API_KEY')},
  authDomain: ${JSON.stringify(process.env.FIREBASE_AUTH_DOMAIN || 'YOUR_PROJECT.firebaseapp.com')},
  projectId: ${JSON.stringify(process.env.FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID')},
  storageBucket: ${JSON.stringify(process.env.FIREBASE_STORAGE_BUCKET || 'YOUR_PROJECT.appspot.com')},
  messagingSenderId: ${JSON.stringify(process.env.FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID')},
  appId: ${JSON.stringify(process.env.FIREBASE_APP_ID || 'YOUR_APP_ID')},
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
export const FIREBASE_ENABLED = firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";
`;

const outDir = path.join(__dirname, 'src', 'services');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'firebase.js'), firebaseConfig);

const enabled = process.env.FIREBASE_API_KEY && process.env.FIREBASE_API_KEY !== 'YOUR_FIREBASE_API_KEY';
console.log('Config written. FIREBASE_ENABLED =', enabled);
