import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs,
  query, where, orderBy, limit, runTransaction, increment, serverTimestamp,
  deleteDoc, onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

const COLLECTIONS = {
  USERS: 'users',
  TASKS: 'tasks',
  CLAIMS: 'claims',
  WITHDRAWALS: 'withdrawals',
  SETTINGS: 'app_settings',
};

export const firestoreService = {
  getUser: async (uid) => {
    const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  },

  createUser: async (uid, data) => {
    const userRef = doc(db, COLLECTIONS.USERS, uid);
    await setDoc(userRef, {
      uid,
      name: data.name || '',
      email: data.email || '',
      photoURL: data.photoURL || '',
      balance: 0,
      referralCode: data.referralCode || '',
      referredBy: null,
      status: 'active',
      role: 'user',
      streakCount: 0,
      lastCheckIn: null,
      completedTasks: [],
      createdAt: new Date().toISOString(),
    });
    return { id: uid, ...data, balance: 0, role: 'user', status: 'active' };
  },

  updateUser: async (uid, data) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
  },

  searchUsers: async (searchTerm) => {
    const q = query(collection(db, COLLECTIONS.USERS), limit(50));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  },

  getAllUsers: async () => {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getTasks: async () => {
    const snap = await getDocs(query(collection(db, COLLECTIONS.TASKS), where('status', '==', 'active')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  addTask: async (taskData) => {
    const ref = doc(collection(db, COLLECTIONS.TASKS));
    await setDoc(ref, { ...taskData, id: ref.id, claimedCount: 0, status: 'active' });
    return ref.id;
  },

  deleteTask: async (taskId) => {
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
  },

  getPendingClaims: async () => {
    const q = query(collection(db, COLLECTIONS.CLAIMS), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  submitClaim: async (claimData) => {
    const ref = doc(collection(db, COLLECTIONS.CLAIMS));
    await setDoc(ref, { ...claimData, id: ref.id, status: 'pending', timestamp: new Date().toISOString() });
    return ref.id;
  },

  approveClaim: async (claimId) => {
    return runTransaction(db, async (transaction) => {
      const claimRef = doc(db, COLLECTIONS.CLAIMS, claimId);
      const claimSnap = await transaction.get(claimRef);
      if (!claimSnap.exists() || claimSnap.data().status !== 'pending') throw new Error('Claim not found or already processed');

      const claim = claimSnap.data();
      const userRef = doc(db, COLLECTIONS.USERS, claim.userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User not found');

      const newBalance = userSnap.data().balance + claim.earnedAmount;
      const completedTasks = [...(userSnap.data().completedTasks || []), claim.taskId];

      transaction.update(userRef, { balance: newBalance, completedTasks });
      transaction.update(claimRef, { status: 'approved', processedAt: new Date().toISOString() });

      return { ...claim, status: 'approved' };
    });
  },

  rejectClaim: async (claimId) => {
    await updateDoc(doc(db, COLLECTIONS.CLAIMS, claimId), { status: 'rejected', processedAt: new Date().toISOString() });
  },

  getWithdrawals: async () => {
    const q = query(collection(db, COLLECTIONS.WITHDRAWALS), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getPendingWithdrawals: async () => {
    const q = query(collection(db, COLLECTIONS.WITHDRAWALS), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  requestWithdrawal: async (userId, amount, gateway, phone) => {
    return runTransaction(db, async (transaction) => {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      if (userSnap.data().balance < amount) throw new Error('Insufficient balance');

      transaction.update(userRef, { balance: userSnap.data().balance - amount });

      const ref = doc(collection(db, COLLECTIONS.WITHDRAWALS));
      await setDoc(ref, {
        id: ref.id, userId, userName: userSnap.data().name, amount, gateway, phone,
        status: 'pending', timestamp: new Date().toISOString(),
      });
      return ref.id;
    });
  },

  approveWithdrawal: async (withdrawalId) => {
    await updateDoc(doc(db, COLLECTIONS.WITHDRAWALS, withdrawalId), { status: 'paid', processedAt: new Date().toISOString() });
  },

  rejectWithdrawal: async (withdrawalId) => {
    return runTransaction(db, async (transaction) => {
      const wdRef = doc(db, COLLECTIONS.WITHDRAWALS, withdrawalId);
      const wdSnap = await transaction.get(wdRef);
      if (!wdSnap.exists()) throw new Error('Withdrawal not found');

      const wd = wdSnap.data();
      if (wd.userId) {
        const userRef = doc(db, COLLECTIONS.USERS, wd.userId);
        const userSnap = await transaction.get(userRef);
        if (userSnap.exists()) {
          transaction.update(userRef, { balance: userSnap.data().balance + wd.amount });
        }
      }
      transaction.update(wdRef, { status: 'rejected', processedAt: new Date().toISOString() });
      return { ...wd, status: 'rejected' };
    });
  },

  getLeaderboard: async () => {
    const q = query(collection(db, COLLECTIONS.USERS), orderBy('balance', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getSettings: async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'global'));
    return snap.exists() ? snap.data() : { minimumWithdrawal: 50, referralBonus: 0.5, maintenanceMode: false, appVersion: '6.0.0' };
  },

  updateSettings: async (data) => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), data, { merge: true });
  },

  claimStreak: async (userId) => {
    return runTransaction(db, async (transaction) => {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User not found');

      const user = userSnap.data();
      const now = new Date();
      const STREAK_REWARDS = [0.5, 1, 1.5, 2, 2.5, 3.5, 5];

      if (user.lastCheckIn) {
        const diffHours = (now - new Date(user.lastCheckIn)) / (1000 * 60 * 60);
        if (diffHours < 24) throw new Error('Already checked in today');
        if (diffHours >= 48) {
          transaction.update(userRef, { streakCount: 1, lastCheckIn: now.toISOString(), balance: user.balance + STREAK_REWARDS[0] });
          return { reward: STREAK_REWARDS[0], streakCount: 1, isStreakBroken: true };
        }
      }

      const nextDay = (user.streakCount % 7) + 1;
      const reward = STREAK_REWARDS[nextDay - 1];
      transaction.update(userRef, {
        streakCount: nextDay,
        lastCheckIn: now.toISOString(),
        balance: user.balance + reward,
      });
      return { reward, streakCount: nextDay, isStreakBroken: false };
    });
  },

  applyReferral: async (newUserId, referralCode) => {
    return runTransaction(db, async (transaction) => {
      const usersSnap = await getDocs(query(collection(db, COLLECTIONS.USERS), where('referralCode', '==', referralCode)));
      if (usersSnap.empty) return;
      const referrerDoc = usersSnap.docs[0];
      const referrerRef = doc(db, COLLECTIONS.USERS, referrerDoc.id);
      const referrerSnap = await transaction.get(referrerRef);
      if (!referrerSnap.exists()) return;

      transaction.update(referrerRef, { referralCount: increment(1) });
      const newUserRef = doc(db, COLLECTIONS.USERS, newUserId);
      transaction.update(newUserRef, { referredBy: referrerDoc.id, balance: increment(0.5) });
    });
  },
};
