import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, FIREBASE_ENABLED } from '../services/firebase';
import { firestoreService } from '../services/firestore';
import { authService } from '../services/auth';

const ADMIN_PASSWORD = 'FAHIM2020';

const useStore = create((set, get) => ({
  user: null,
  userData: null,
  tasks: [],
  pendingClaims: [],
  pendingWithdrawals: [],
  allClaims: [],
  allWithdrawals: [],
  users: [],
  stats: null,
  settings: { minimumWithdrawal: 50, referralBonus: 0.5, maintenanceMode: false, appVersion: '6.0.0' },
  loading: true,
  toasts: [],
  adminAuthenticated: false,

  init: () => {
    const savedAuth = localStorage.getItem('te_admin_auth');
    if (savedAuth === 'true') {
      set({ adminAuthenticated: true });
    }
    if (!FIREBASE_ENABLED) {
      set({ loading: false });
      return;
    }
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData = await firestoreService.getUser(firebaseUser.uid);
        if (!userData) {
          userData = await firestoreService.createUser(firebaseUser.uid, {
            name: firebaseUser.displayName || 'Admin',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            role: 'admin',
          });
        } else if (userData.role !== 'admin') {
          await firestoreService.updateUser(firebaseUser.uid, { role: 'admin' });
          userData.role = 'admin';
        }
        set({ user: firebaseUser, userData, loading: false });
        get().loadData();
      } else {
        set({ user: null, userData: null, loading: false });
      }
    });
  },

  authenticateAdmin: (password) => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem('te_admin_auth', 'true');
      set({ adminAuthenticated: true });
      return true;
    }
    return false;
  },

  signIn: async () => {
    const firebaseUser = await authService.signInWithGoogle();
    let userData = await firestoreService.getUser(firebaseUser.uid);
    if (!userData) {
      userData = await firestoreService.createUser(firebaseUser.uid, {
        name: firebaseUser.displayName || 'Admin',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        role: 'admin',
      });
    }
    set({ user: firebaseUser, userData });
    return userData;
  },

  logout: async () => {
    await authService.logout();
    localStorage.removeItem('te_admin_auth');
    set({ user: null, userData: null, adminAuthenticated: false, tasks: [], pendingClaims: [], pendingWithdrawals: [], allClaims: [], allWithdrawals: [], users: [], stats: null });
  },

  loadData: async () => {
    try {
      const [tasks, pendingClaims, pendingWithdrawals, allClaims, allWithdrawals, users, stats, settings] = await Promise.all([
        firestoreService.getTasks(),
        firestoreService.getPendingClaims(),
        firestoreService.getPendingWithdrawals(),
        firestoreService.getAllClaims(),
        firestoreService.getAllWithdrawals(),
        firestoreService.getAllUsers(),
        firestoreService.getStats(),
        firestoreService.getSettings(),
      ]);
      set({ tasks, pendingClaims, pendingWithdrawals, allClaims, allWithdrawals, users, stats, settings });
    } catch (e) {
      console.error('Load data error:', e);
    }
  },

  addTask: async (taskData) => {
    await firestoreService.addTask(taskData);
    get().loadData();
  },

  deleteTask: async (taskId) => {
    await firestoreService.deleteTask(taskId);
    get().loadData();
  },

  approveClaim: async (claimId) => {
    await firestoreService.approveClaim(claimId);
    get().loadData();
  },

  rejectClaim: async (claimId) => {
    await firestoreService.rejectClaim(claimId);
    get().loadData();
  },

  approveWithdrawal: async (withdrawalId) => {
    await firestoreService.approveWithdrawal(withdrawalId);
    get().loadData();
  },

  rejectWithdrawal: async (withdrawalId) => {
    await firestoreService.rejectWithdrawal(withdrawalId);
    get().loadData();
  },

  refundWithdrawal: async (withdrawalId) => {
    await firestoreService.refundWithdrawal(withdrawalId);
    get().loadData();
  },

  updateUserBalance: async (uid, newBalance) => {
    await firestoreService.updateUserBalance(uid, newBalance);
    get().loadData();
  },

  banUser: async (uid) => {
    await firestoreService.banUser(uid);
    get().loadData();
  },

  unbanUser: async (uid) => {
    await firestoreService.unbanUser(uid);
    get().loadData();
  },

  setUserRole: async (uid, role) => {
    await firestoreService.setUserRole(uid, role);
    get().loadData();
  },

  updateSettings: async (data) => {
    await firestoreService.updateSettings(data);
    set({ settings: { ...get().settings, ...data } });
  },

  addToast: (message, type = 'info') => {
    const id = Date.now();
    set(state => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set(state => ({ toasts: state.toasts.filter(t => t.id !== id) }));
    }, 3000);
  },
}));

export default useStore;
