import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, FIREBASE_ENABLED } from '../services/firebase';
import { firestoreService } from '../services/firestore';
import { authService } from '../services/auth';

const useStore = create((set, get) => ({
  user: null,
  userData: null,
  tasks: [],
  withdrawals: [],
  pendingClaims: [],
  leaderboard: [],
  settings: { minimumWithdrawal: 50, referralBonus: 0.5, maintenanceMode: false },
  loading: true,
  toasts: [],

  init: () => {
    if (!FIREBASE_ENABLED) {
      set({ loading: false });
      return;
    }
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userData = await firestoreService.getUser(firebaseUser.uid);
        if (!userData) {
          const code = (firebaseUser.displayName || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') + Math.floor(1000 + Math.random() * 9000);
          userData = await firestoreService.createUser(firebaseUser.uid, {
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            referralCode: code,
          });
        }
        set({ user: firebaseUser, userData, loading: false });
        get().loadData();
      } else {
        set({ user: null, userData: null, loading: false });
      }
    });
  },

  signIn: async () => {
    const firebaseUser = await authService.signInWithGoogle();
    let userData = await firestoreService.getUser(firebaseUser.uid);
    if (!userData) {
      const code = (firebaseUser.displayName || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X') + Math.floor(1000 + Math.random() * 9000);
      userData = await firestoreService.createUser(firebaseUser.uid, {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        referralCode: code,
      });
    }
    set({ user: firebaseUser, userData });
    return userData;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, userData: null, tasks: [], withdrawals: [], pendingClaims: [], leaderboard: [] });
  },

  loadData: async () => {
    try {
      const [tasks, withdrawals, pendingClaims, leaderboard, settings] = await Promise.all([
        firestoreService.getTasks(),
        firestoreService.getWithdrawals(),
        firestoreService.getPendingClaims(),
        firestoreService.getLeaderboard(),
        firestoreService.getSettings(),
      ]);
      set({ tasks, withdrawals, pendingClaims, leaderboard, settings });
    } catch (e) {
      console.error('Load data error:', e);
    }
  },

  refreshUser: async () => {
    const { user } = get();
    if (!user) return;
    const userData = await firestoreService.getUser(user.uid);
    set({ userData });
  },

  submitClaim: async (taskId, proofFile) => {
    const { user, userData, tasks } = get();
    if (!user || !userData) throw new Error('Not logged in');

    const task = tasks.find(t => t.id === taskId);
    if (!task) throw new Error('Task not found');
    if (userData.completedTasks?.includes(taskId)) throw new Error('Task already completed');

    const proofImageUrl = await storageService.uploadProofImage(proofFile, user.uid, taskId);

    const REFERRAL_COUNTS = { 0: 1.0, 5: 1.5, 15: 2.0 };
    let multiplier = 1.0;
    if ((userData.referralCount || 0) >= 15) multiplier = 2.0;
    else if ((userData.referralCount || 0) >= 5) multiplier = 1.5;

    const earnedAmount = task.reward * multiplier;

    await firestoreService.submitClaim({
      taskId, userId: user.uid, userName: userData.name, userPhoto: userData.photoURL,
      taskTitle: task.title, taskCategory: task.category, reward: task.reward,
      earnedAmount, multiplier, proofImageUrl,
    });

    get().loadData();
  },

  claimStreak: async () => {
    const { userData } = get();
    if (!userData) return;
    const result = await firestoreService.claimStreak(userData.uid);
    await get().refreshUser();
    return result;
  },

  requestWithdrawal: async (amount, gateway, phone) => {
    const { userData } = get();
    if (!userData) throw new Error('Not logged in');
    await firestoreService.requestWithdrawal(userData.uid, amount, gateway, phone);
    await get().refreshUser();
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

  addTask: async (taskData) => {
    await firestoreService.addTask(taskData);
    get().loadData();
  },

  deleteTask: async (taskId) => {
    await firestoreService.deleteTask(taskId);
    get().loadData();
  },

  updateUserBalance: async (uid, newBalance) => {
    await firestoreService.updateUser(uid, { balance: newBalance });
    get().loadData();
  },

  banUser: async (uid) => {
    await firestoreService.updateUser(uid, { status: 'banned' });
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
