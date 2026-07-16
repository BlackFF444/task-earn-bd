// Firestore data layer — mirrors localStorage API but shared across devices.
// Used automatically when firebaseConfig is filled in. See firebaseConfig.js.

import { initializeApp } from 'firebase/app';
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc,
  collection, getDocs, addDoc, query, where
} from 'firebase/firestore';
import { firebaseConfig, FIREBASE_ENABLED } from './firebaseConfig';

let db = null;
let app = null;

if (FIREBASE_ENABLED) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (e) {
    console.error('Firebase init failed, falling back to localStorage', e);
    db = null;
  }
}

export const isFirebaseActive = () => !!db;

// ---- Generic doc helpers ----
const getDocData = async (col, id) => {
  const snap = await getDoc(doc(db, col, id));
  return snap.exists() ? snap.data() : null;
};

const setDocData = async (col, id, data) => {
  await setDoc(doc(db, col, id), data, { merge: true });
};

const getAllDocs = async (col) => {
  const snap = await getDocs(collection(db, col));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Collections
const COL = {
  USERS: 'users',
  TASKS: 'tasks',
  WITHDRAWALS: 'withdrawals',
  CLAIMS: 'taskClaims',
};

// ---- Users ----
export const firestoreUsers = {
  getAll: () => getAllDocs(COL.USERS),
  getByTelegramId: (tgId) => getByField(COL.USERS, 'telegramId', tgId),
  getByGoogleId: (gId) => getByField(COL.USERS, 'googleId', gId),
  getByRefCode: (code) => getByField(COL.USERS, 'referralCode', code),
  get: (id) => getDocData(COL.USERS, id),
  set: (id, data) => setDocData(COL.USERS, id, data),
  update: async (id, fields) => {
    try { await updateDoc(doc(db, COL.USERS, id), fields); }
    catch { await setDocData(COL.USERS, id, fields); }
  },
};

async function getByField(col, field, value) {
  const q = query(collection(db, col), where(field, '==', value));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// ---- Tasks ----
export const firestoreTasks = {
  getAll: () => getAllDocs(COL.TASKS),
  set: (id, data) => setDocData(COL.TASKS, id, data),
  add: (data) => addDoc(collection(db, COL.TASKS), data),
  delete: (id) => deleteDoc(doc(db, COL.TASKS, id)),
};

// ---- Withdrawals ----
export const firestoreWithdrawals = {
  getAll: () => getAllDocs(COL.WITHDRAWALS),
  getUser: (userId) => getByField(COL.WITHDRAWALS, 'userId', userId),
  add: (data) => addDoc(collection(db, COL.WITHDRAWALS), data),
  update: async (id, fields) => {
    try { await updateDoc(doc(db, COL.WITHDRAWALS, id), fields); }
    catch { await setDocData(COL.WITHDRAWALS, id, fields); }
  },
};

// ---- Task Claims ----
export const firestoreClaims = {
  getAll: () => getAllDocs(COL.CLAIMS),
  getUserPending: async (userId) => {
    const q = query(collection(db, COL.CLAIMS), where('userId', '==', userId), where('status', '==', 'Pending'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },
  add: (data) => addDoc(collection(db, COL.CLAIMS), data),
  update: async (id, fields) => {
    try { await updateDoc(doc(db, COL.CLAIMS, id), fields); }
    catch { await setDocData(COL.CLAIMS, id, fields); }
  },
};
