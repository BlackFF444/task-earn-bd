import {
  doc, getDoc, setDoc, updateDoc, collection, getDocs,
  query, where, orderBy, limit, runTransaction, increment,
  deleteDoc, count as firestoreCount
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

  getAllUsers: async () => {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  searchUsers: async (searchTerm) => {
    const snap = await getDocs(collection(db, COLLECTIONS.USERS));
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => (u.name?.toLowerCase().includes(searchTerm.toLowerCase())) || (u.email?.toLowerCase().includes(searchTerm.toLowerCase())));
  },

  updateUser: async (uid, data) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
  },

  banUser: async (uid) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { status: 'banned' });
  },

  unbanUser: async (uid) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { status: 'active' });
  },

  setUserRole: async (uid, role) => {
    await updateDoc(doc(db, COLLECTIONS.USERS, uid), { role });
  },

  getTasks: async () => {
    const snap = await getDocs(query(collection(db, COLLECTIONS.TASKS), orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  addTask: async (taskData) => {
    const ref = doc(collection(db, COLLECTIONS.TASKS));
    await setDoc(ref, { ...taskData, id: ref.id, claimedCount: 0, status: 'active', createdAt: new Date().toISOString() });
    return ref.id;
  },

  updateTask: async (taskId, data) => {
    await updateDoc(doc(db, COLLECTIONS.TASKS, taskId), data);
  },

  deleteTask: async (taskId) => {
    await deleteDoc(doc(db, COLLECTIONS.TASKS, taskId));
  },

  getPendingClaims: async () => {
    const q = query(collection(db, COLLECTIONS.CLAIMS), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getAllClaims: async () => {
    const q = query(collection(db, COLLECTIONS.CLAIMS), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
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
      transaction.update(claimRef, { status: 'approved', processedAt: new Date().toISOString(), processedBy: 'admin' });

      return { ...claim, status: 'approved' };
    });
  },

  rejectClaim: async (claimId) => {
    return runTransaction(db, async (transaction) => {
      const claimRef = doc(db, COLLECTIONS.CLAIMS, claimId);
      const claimSnap = await transaction.get(claimRef);
      if (!claimSnap.exists() || claimSnap.data().status !== 'pending') throw new Error('Claim not found or already processed');

      transaction.update(claimRef, { status: 'rejected', processedAt: new Date().toISOString(), processedBy: 'admin' });
      return { ...claimSnap.data(), status: 'rejected' };
    });
  },

  getPendingWithdrawals: async () => {
    const q = query(collection(db, COLLECTIONS.WITHDRAWALS), where('status', '==', 'pending'), orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  getAllWithdrawals: async () => {
    const q = query(collection(db, COLLECTIONS.WITHDRAWALS), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  approveWithdrawal: async (withdrawalId) => {
    return runTransaction(db, async (transaction) => {
      const wdRef = doc(db, COLLECTIONS.WITHDRAWALS, withdrawalId);
      const wdSnap = await transaction.get(wdRef);
      if (!wdSnap.exists() || wdSnap.data().status !== 'pending') throw new Error('Withdrawal not found or already processed');

      transaction.update(wdRef, { status: 'paid', processedAt: new Date().toISOString(), processedBy: 'admin' });
      return { ...wdSnap.data(), status: 'paid' };
    });
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
      transaction.update(wdRef, { status: 'rejected', processedAt: new Date().toISOString(), processedBy: 'admin' });
      return { ...wd, status: 'rejected' };
    });
  },

  refundWithdrawal: async (withdrawalId) => {
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
      transaction.update(wdRef, { status: 'refunded', processedAt: new Date().toISOString(), processedBy: 'admin' });
      return { ...wd, status: 'refunded' };
    });
  },

  updateUserBalance: async (uid, newBalance) => {
    return runTransaction(db, async (transaction) => {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error('User not found');
      transaction.update(userRef, { balance: newBalance });
    });
  },

  getSettings: async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.SETTINGS, 'global'));
    return snap.exists() ? snap.data() : { minimumWithdrawal: 50, referralBonus: 0.5, maintenanceMode: false, appVersion: '6.0.0' };
  },

  updateSettings: async (data) => {
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'global'), data, { merge: true });
  },

  getStats: async () => {
    const [usersSnap, tasksSnap, claimsSnap, withdrawalsSnap] = await Promise.all([
      getDocs(collection(db, COLLECTIONS.USERS)),
      getDocs(query(collection(db, COLLECTIONS.TASKS), where('status', '==', 'active'))),
      getDocs(collection(db, COLLECTIONS.CLAIMS)),
      getDocs(collection(db, COLLECTIONS.WITHDRAWALS)),
    ]);

    const users = usersSnap.docs.map(d => d.data());
    const claims = claimsSnap.docs.map(d => d.data());
    const withdrawals = withdrawalsSnap.docs.map(d => d.data());

    return {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      bannedUsers: users.filter(u => u.status === 'banned').length,
      totalBalance: users.reduce((sum, u) => sum + (u.balance || 0), 0),
      activeTasks: tasksSnap.size,
      pendingClaims: claims.filter(c => c.status === 'pending').length,
      approvedClaims: claims.filter(c => c.status === 'approved').length,
      totalPaidOut: withdrawals.filter(w => w.status === 'paid').reduce((sum, w) => sum + w.amount, 0),
      pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').length,
      totalWithdrawals: withdrawals.length,
    };
  },
};
