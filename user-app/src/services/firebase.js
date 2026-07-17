// Unified Data Layer — Firestore (shared) OR LocalStorage (fallback)
// Auto-switches based on firebaseConfig. See services/firebaseConfig.js

import { FIREBASE_ENABLED } from './firebaseConfig';
import {
  isFirebaseActive, firestoreUsers, firestoreTasks,
  firestoreWithdrawals, firestoreClaims
} from './firestore';

const USE_CLOUD = FIREBASE_ENABLED && isFirebaseActive();

// ---------- LocalStorage helpers ----------
const STORAGE_KEYS = {
  USERS: 'task_earn_bd_users',
  TASKS: 'task_earn_bd_tasks',
  WITHDRAWALS: 'task_earn_bd_withdrawals',
  PENDING_TASK_CLAIMS: 'task_earn_bd_pending_claims',
  CURRENT_USER: 'task_earn_bd_curr_user',
};

const DEFAULT_TASKS = [
  { id: 'task-1', title: 'Join Task Earn Bd Official Telegram Channel', reward: 3, category: 'Telegram', url: 'https://t.me/task_earn_bd', timer: 10, claimedCount: 142, targetLimit: 500 },
  { id: 'task-2', title: 'Follow our Founder on X (Twitter)', reward: 2, category: 'Twitter', url: 'https://twitter.com/task_earn_bd', timer: 12, claimedCount: 89, targetLimit: 300 },
  { id: 'task-3', title: 'Watch & Like YouTube Video: Beginner Guide to BDT Crypto', reward: 5, category: 'YouTube', url: 'https://youtube.com', timer: 15, claimedCount: 299, targetLimit: 300 },
  { id: 'task-4', title: 'Share our project page on Facebook', reward: 1.5, category: 'Facebook', url: 'https://facebook.com', timer: 8, claimedCount: 450, targetLimit: 500 },
];

const DEFAULT_USERS = [];
const APP_VERSION = '5.0.0';
const VERSION_KEY = 'task_earn_bd_version';

const checkAndClearStaleData = () => {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== APP_VERSION) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('task_earn_bd_') || key === 'te_lang' || key === 'te_theme' || key === 'te_announcements')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => { try { localStorage.removeItem(key); } catch {} });
      localStorage.setItem(VERSION_KEY, APP_VERSION);
    }
  } catch {}
};
checkAndClearStaleData();

const loadFromStorage = (key, defaultValue) => {
  try {
    const data = localStorage.getItem(key);
    if (!data) { localStorage.setItem(key, JSON.stringify(defaultValue)); return defaultValue; }
    return JSON.parse(data);
  } catch (e) {
    try { localStorage.removeItem(key); } catch {}
    return defaultValue;
  }
};
const saveToStorage = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
};

// Local in-memory caches (used only in localStorage mode)
let lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
let lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
let lsWithdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
let lsClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
let currentUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);

const generateReferralCode = (name) => {
  const prefix = (name || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${num}`;
};

export const getMultiplier = (referralCount = 0) => {
  if (referralCount >= 15) return 2.0;
  if (referralCount >= 5) return 1.5;
  return 1.0;
};

export const getVIPLevelName = (referralCount = 0) => {
  if (referralCount >= 15) return 'Platinum VIP';
  if (referralCount >= 5) return 'Gold Club';
  return 'Member';
};

const STREAK_REWARDS = [0.5, 1, 1.5, 2, 2.5, 3.5, 5];

// ============ AUTH ============
export const authService = {
  loginWithTelegram: async () => {
    const { telegramService } = await import('./telegram');
    if (!telegramService.isTelegramWebApp()) throw new Error('Telegram not available');
    telegramService.init();
    const tgUser = telegramService.getUser();
    if (!tgUser) throw new Error('Could not retrieve Telegram user data');

    if (USE_CLOUD) {
      let user = await firestoreUsers.getByTelegramId(tgUser.id);
      if (!user) {
        const fullName = `${tgUser.firstName} ${tgUser.lastName}`.trim();
        user = {
          id: 'tg-' + tgUser.id, telegramId: tgUser.id, name: fullName,
          photoURL: tgUser.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName.replace(/\s/g, '')}`,
          balance: 0.00, referralCode: generateReferralCode(fullName), referralCount: 0,
          streakCount: 0, lastCheckIn: null, completedTasks: [],
          telegramUsername: tgUser.username, isPremium: tgUser.isPremium, referredBy: null,
        };
        if (tgUser.startParam) await applyReferralCloud(user, tgUser.startParam);
        await firestoreUsers.set(user.id, user);
      }
      currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      return currentUser;
    }

    // localStorage mode
    let user = lsUsers.find(u => u.telegramId === tgUser.id);
    if (!user) {
      const fullName = `${tgUser.firstName} ${tgUser.lastName}`.trim();
      user = {
        id: 'tg-' + tgUser.id, telegramId: tgUser.id, name: fullName,
        photoURL: tgUser.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName.replace(/\s/g, '')}`,
        balance: 0.00, referralCode: generateReferralCode(fullName), referralCount: 0,
        streakCount: 0, lastCheckIn: null, completedTasks: [],
        telegramUsername: tgUser.username, isPremium: tgUser.isPremium, referredBy: null,
      };
      if (tgUser.startParam) {
        const referrer = lsUsers.find(u => u.referralCode === tgUser.startParam);
        if (referrer && referrer.id !== user.id) {
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          user.referredBy = referrer.id;
          user.balance = parseFloat((user.balance + 0.5).toFixed(4));
          saveToStorage(STORAGE_KEYS.USERS, lsUsers);
        }
      }
      lsUsers.push(user); saveToStorage(STORAGE_KEYS.USERS, lsUsers);
    }
    currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    return currentUser;
  },

  loginWithGoogle: async () => {
    const { googleService } = await import('./google');
    const gUser = await googleService.signIn();
    if (!gUser || !gUser.id) throw new Error('Google login failed');

    if (USE_CLOUD) {
      let user = await firestoreUsers.getByGoogleId(gUser.id);
      if (!user) {
        const fullName = gUser.name || gUser.email;
        user = {
          id: 'g-' + gUser.id, googleId: gUser.id, email: gUser.email, name: fullName,
          photoURL: gUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName.replace(/\s/g, '')}`,
          balance: 0.00, referralCode: generateReferralCode(fullName), referralCount: 0,
          streakCount: 0, lastCheckIn: null, completedTasks: [], telegramUsername: gUser.username || '',
          isPremium: false, referredBy: null, loginMethod: 'google',
        };
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode) await applyReferralCloud(user, refCode);
        await firestoreUsers.set(user.id, user);
      }
      currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      return currentUser;
    }

    let user = lsUsers.find(u => u.googleId === gUser.id);
    if (!user) {
      const fullName = gUser.name || gUser.email;
      user = {
        id: 'g-' + gUser.id, googleId: gUser.id, email: gUser.email, name: fullName,
        photoURL: gUser.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName.replace(/\s/g, '')}`,
        balance: 0.00, referralCode: generateReferralCode(fullName), referralCount: 0,
        streakCount: 0, lastCheckIn: null, completedTasks: [], telegramUsername: gUser.username || '',
        isPremium: false, referredBy: null, loginMethod: 'google',
      };
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        const referrer = lsUsers.find(u => u.referralCode === refCode);
        if (referrer && referrer.id !== user.id) {
          referrer.referralCount = (referrer.referralCount || 0) + 1;
          user.referredBy = referrer.id;
          user.balance = parseFloat((user.balance + 0.5).toFixed(4));
          saveToStorage(STORAGE_KEYS.USERS, lsUsers);
        }
      }
      lsUsers.push(user); saveToStorage(STORAGE_KEYS.USERS, lsUsers);
    }
    currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    return currentUser;
  },

  loginAsGuest: async (name) => {
    const guestName = (name || 'Guest').trim();
    const guestId = 'guest-' + Date.now() + '-' + Math.floor(1000 + Math.random() * 9000);
    const user = {
      id: guestId, name: guestName,
      photoURL: `https://api.dicebear.com/7.x/adventurer/svg?seed=${guestName.replace(/\s/g, '')}`,
      balance: 0.00, referralCode: generateReferralCode(guestName), referralCount: 0,
      streakCount: 0, lastCheckIn: null, completedTasks: [],
      telegramUsername: '', isPremium: false, referredBy: null, loginMethod: 'guest',
    };
    if (USE_CLOUD) {
      await firestoreUsers.set(user.id, user);
    } else {
      lsUsers.push(user);
      saveToStorage(STORAGE_KEYS.USERS, lsUsers);
    }
    currentUser = user;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    return currentUser;
  },

  logout: async () => {
    currentUser = null;
    saveToStorage(STORAGE_KEYS.CURRENT_USER, null);
  },

  getCurrentUser: () => {
    currentUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);
    return currentUser;
  },
};

// Apply referral in cloud mode
async function applyReferralCloud(user, refCode) {
  const referrer = await firestoreUsers.getByRefCode(refCode);
  if (referrer && referrer.id !== user.id) {
    referrer.referralCount = (referrer.referralCount || 0) + 1;
    user.referredBy = referrer.id;
    user.balance = parseFloat((user.balance + 0.5).toFixed(4));
    await firestoreUsers.set(referrer.id, referrer);
  }
}

// ============ DB ============
export const dbService = {
  getTasks: async () => {
    if (USE_CLOUD) { lsTasks = await firestoreTasks.getAll(); return lsTasks; }
    lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS); return lsTasks;
  },

  getPendingTaskClaims: async () => {
    if (USE_CLOUD) { lsClaims = await firestoreClaims.getAll(); return lsClaims; }
    lsClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []); return lsClaims;
  },

  getUserPendingClaims: async (userId) => {
    if (USE_CLOUD) return firestoreClaims.getUserPending(userId);
    lsClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    return lsClaims.filter(c => c.userId === userId && c.status === 'Pending');
  },

  approveTaskClaim: async (claimId) => {
    if (USE_CLOUD) {
      const claims = await firestoreClaims.getAll();
      const claim = claims.find(c => c.id === claimId);
      if (!claim || claim.status !== 'Pending') throw new Error('Claim not found or processed');
      const user = await firestoreUsers.get(claim.userId);
      const tasks = await firestoreTasks.getAll();
      const task = tasks.find(t => t.id === claim.taskId);
      if (!user || !task) throw new Error('User or Task not found');
      user.balance = parseFloat((user.balance + claim.earnedAmount).toFixed(4));
      user.completedTasks = [...(user.completedTasks || []), claim.taskId];
      task.claimedCount += 1;
      await firestoreUsers.set(user.id, user);
      await firestoreTasks.set(task.id, task);
      await firestoreClaims.update(claimId, { status: 'Approved', processedAt: new Date().toISOString() });
      if (currentUser && currentUser.id === claim.userId) {
        currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      }
      return { ...claim, status: 'Approved' };
    }
    lsClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const idx = lsClaims.findIndex(c => c.id === claimId);
    if (idx === -1) throw new Error('Pending claim not found');
    const claim = lsClaims[idx];
    if (claim.status !== 'Pending') throw new Error('Claim already processed');
    const ui = lsUsers.findIndex(u => u.id === claim.userId);
    const ti = lsTasks.findIndex(t => t.id === claim.taskId);
    if (ui === -1 || ti === -1) throw new Error('User or Task not found');
    lsUsers[ui].balance = parseFloat((lsUsers[ui].balance + claim.earnedAmount).toFixed(4));
    lsUsers[ui].completedTasks.push(claim.taskId);
    lsTasks[ti].claimedCount += 1;
    lsClaims[idx].status = 'Approved';
    lsClaims[idx].processedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.USERS, lsUsers);
    saveToStorage(STORAGE_KEYS.TASKS, lsTasks);
    saveToStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, lsClaims);
    if (currentUser && currentUser.id === claim.userId) { currentUser = lsUsers[ui]; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }
    return lsClaims[idx];
  },

  rejectTaskClaim: async (claimId) => {
    if (USE_CLOUD) {
      const claims = await firestoreClaims.getAll();
      const claim = claims.find(c => c.id === claimId);
      if (!claim || claim.status !== 'Pending') throw new Error('Claim not found or processed');
      await firestoreClaims.update(claimId, { status: 'Rejected', processedAt: new Date().toISOString() });
      return { ...claim, status: 'Rejected' };
    }
    lsClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    const idx = lsClaims.findIndex(c => c.id === claimId);
    if (idx === -1) throw new Error('Pending claim not found');
    if (lsClaims[idx].status !== 'Pending') throw new Error('Claim already processed');
    lsClaims[idx].status = 'Rejected';
    lsClaims[idx].processedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, lsClaims);
    return lsClaims[idx];
  },

  addTask: async (taskData) => {
    if (USE_CLOUD) {
      const ref = await firestoreTasks.add({ id: 'task-' + Date.now(), claimedCount: 0, ...taskData });
      return { id: ref.id, ...taskData };
    }
    lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const nt = { id: 'task-' + Date.now(), claimedCount: 0, ...taskData };
    lsTasks.push(nt); saveToStorage(STORAGE_KEYS.TASKS, lsTasks); return nt;
  },

  updateTask: async (taskId, updatedData) => {
    if (USE_CLOUD) { await firestoreTasks.set(taskId, updatedData); return { id: taskId, ...updatedData }; }
    lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    lsTasks = lsTasks.map(t => t.id === taskId ? { ...t, ...updatedData } : t);
    saveToStorage(STORAGE_KEYS.TASKS, lsTasks); return lsTasks.find(t => t.id === taskId);
  },

  deleteTask: async (taskId) => {
    if (USE_CLOUD) { await firestoreTasks.delete(taskId); return true; }
    lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    lsTasks = lsTasks.filter(t => t.id !== taskId);
    saveToStorage(STORAGE_KEYS.TASKS, lsTasks); return true;
  },

  claimTask: async (userId, taskId, proofImage = null) => {
    if (USE_CLOUD) {
      const users = await firestoreUsers.getAll();
      const tasks = await firestoreTasks.getAll();
      const ui = users.findIndex(u => u.id === userId);
      const ti = tasks.findIndex(t => t.id === taskId);
      if (ui === -1 || ti === -1) throw new Error('User or Task not found');
      const user = users[ui]; const task = tasks[ti];
      if ((user.completedTasks || []).includes(taskId)) throw new Error('Task already claimed');
      if (task.claimedCount >= task.targetLimit) throw new Error('Task is sold out');
      const existing = (await firestoreClaims.getAll()).find(p => p.userId === userId && p.taskId === taskId && p.status === 'Pending');
      if (existing) throw new Error('Task already pending approval');
      const multiplier = getMultiplier(user.referralCount);
      const earnedAmount = task.reward * multiplier;
      const newClaim = {
        id: 'ptc-' + Date.now(), userId, userName: user.name, userPhoto: user.photoURL,
        taskId, taskTitle: task.title, taskCategory: task.category, reward: task.reward,
        earnedAmount, multiplier, proofImage, status: 'Pending', createdAt: new Date().toISOString(),
      };
      await firestoreClaims.add(newClaim);
      return { pendingClaim: newClaim, earnedAmount };
    }
    lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    lsTasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    lsClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    const ui = lsUsers.findIndex(u => u.id === userId);
    const ti = lsTasks.findIndex(t => t.id === taskId);
    if (ui === -1 || ti === -1) throw new Error('User or Task not found');
    const user = lsUsers[ui]; const task = lsTasks[ti];
    if (user.completedTasks.includes(taskId)) throw new Error('Task already claimed');
    if (task.claimedCount >= task.targetLimit) throw new Error('Task is sold out');
    const existingPending = lsClaims.find(p => p.userId === userId && p.taskId === taskId && p.status === 'Pending');
    if (existingPending) throw new Error('Task already pending approval');
    const multiplier = getMultiplier(user.referralCount);
    const earnedAmount = task.reward * multiplier;
    const newPendingClaim = {
      id: 'ptc-' + Date.now(), userId, userName: user.name, userPhoto: user.photoURL,
      taskId, taskTitle: task.title, taskCategory: task.category, reward: task.reward,
      earnedAmount, multiplier, proofImage, status: 'Pending', createdAt: new Date().toISOString(),
    };
    lsClaims.push(newPendingClaim);
    saveToStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, lsClaims);
    return { pendingClaim: newPendingClaim, earnedAmount };
  },

  claimStreak: async (userId) => {
    const readUser = async () => USE_CLOUD ? await firestoreUsers.get(userId) : (() => { lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS); return lsUsers.find(u => u.id === userId); })();
    const user = await readUser();
    if (!user) throw new Error('User not found');
    const now = new Date();
    let isStreakBroken = false; let nextStreakCount = 1;
    if (user.lastCheckIn) {
      const diffHours = (now - new Date(user.lastCheckIn)) / (1000 * 60 * 60);
      if (diffHours < 24) throw new Error('You have already checked in today. Please return tomorrow!');
      else if (diffHours >= 48) isStreakBroken = true;
      else nextStreakCount = (user.streakCount % 7) + 1;
    }
    const reward = STREAK_REWARDS[nextStreakCount - 1];
    user.balance = parseFloat((user.balance + reward).toFixed(4));
    user.streakCount = nextStreakCount;
    user.lastCheckIn = now.toISOString();
    if (USE_CLOUD) await firestoreUsers.set(user.id, user);
    else { lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS); const i = lsUsers.findIndex(u => u.id === userId); lsUsers[i] = user; saveToStorage(STORAGE_KEYS.USERS, lsUsers); }
    if (currentUser && currentUser.id === userId) { currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }
    return { reward, streakCount: nextStreakCount, isStreakBroken };
  },

  getWithdrawals: async () => {
    if (USE_CLOUD) { lsWithdrawals = await firestoreWithdrawals.getAll(); return lsWithdrawals; }
    lsWithdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []); return lsWithdrawals;
  },

  getUserWithdrawals: async (userId) => {
    if (USE_CLOUD) return firestoreWithdrawals.getUser(userId);
    lsWithdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    return lsWithdrawals.filter(w => w.userId === userId);
  },

  requestWithdrawal: async (userId, amount, gateway, walletAddress) => {
    if (USE_CLOUD) {
      const user = await firestoreUsers.get(userId);
      if (!user) throw new Error('User not found');
      if (user.balance < amount) throw new Error('Insufficient balance');
      user.balance = parseFloat((user.balance - amount).toFixed(4));
      await firestoreUsers.set(userId, user);
      const ref = await firestoreWithdrawals.add({
        id: 'wd-' + Date.now(), userId, userName: user.name, amount, gateway, walletAddress,
        status: 'Pending', createdAt: new Date().toISOString(),
      });
      if (currentUser && currentUser.id === userId) { currentUser = user; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }
      return { id: ref.id, userId, amount, gateway, walletAddress, status: 'Pending' };
    }
    lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    lsWithdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    const ui = lsUsers.findIndex(u => u.id === userId);
    if (ui === -1) throw new Error('User not found');
    if (lsUsers[ui].balance < amount) throw new Error('Insufficient balance');
    lsUsers[ui].balance = parseFloat((lsUsers[ui].balance - amount).toFixed(4));
    saveToStorage(STORAGE_KEYS.USERS, lsUsers);
    const nr = { id: 'wd-' + Date.now(), userId, userName: lsUsers[ui].name, amount, gateway, walletAddress, status: 'Pending', createdAt: new Date().toISOString() };
    lsWithdrawals.push(nr); saveToStorage(STORAGE_KEYS.WITHDRAWALS, lsWithdrawals);
    if (currentUser && currentUser.id === userId) { currentUser = lsUsers[ui]; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }
    return nr;
  },

  approveWithdrawal: async (withdrawalId) => {
    if (USE_CLOUD) {
      const all = await firestoreWithdrawals.getAll();
      const req = all.find(w => w.id === withdrawalId);
      if (!req || req.status !== 'Pending') throw new Error('Request not found or processed');
      await firestoreWithdrawals.update(withdrawalId, { status: 'Approved', processedAt: new Date().toISOString() });
      return { ...req, status: 'Approved' };
    }
    lsWithdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    const idx = lsWithdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1) throw new Error('Withdrawal request not found');
    if (lsWithdrawals[idx].status !== 'Pending') throw new Error('Request already processed');
    lsWithdrawals[idx].status = 'Approved';
    lsWithdrawals[idx].processedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, lsWithdrawals);
    return lsWithdrawals[idx];
  },

  rejectWithdrawal: async (withdrawalId) => {
    if (USE_CLOUD) {
      const all = await firestoreWithdrawals.getAll();
      const req = all.find(w => w.id === withdrawalId);
      if (!req || req.status !== 'Pending') throw new Error('Request not found or processed');
      if (req.userId) {
        const user = await firestoreUsers.get(req.userId);
        if (user) { user.balance = parseFloat((user.balance + req.amount).toFixed(4)); await firestoreUsers.set(user.id, user); }
      }
      await firestoreWithdrawals.update(withdrawalId, { status: 'Rejected', processedAt: new Date().toISOString() });
      return { ...req, status: 'Rejected' };
    }
    lsWithdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const idx = lsWithdrawals.findIndex(w => w.id === withdrawalId);
    if (idx === -1) throw new Error('Withdrawal request not found');
    const req = lsWithdrawals[idx];
    if (req.status !== 'Pending') throw new Error('Request already processed');
    const ui = lsUsers.findIndex(u => u.id === req.userId);
    if (ui !== -1) { lsUsers[ui].balance = parseFloat((lsUsers[ui].balance + req.amount).toFixed(4)); saveToStorage(STORAGE_KEYS.USERS, lsUsers); }
    req.status = 'Rejected'; req.processedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, lsWithdrawals);
    return req;
  },

  getGlobalStats: async () => {
    let users, withdrawals;
    if (USE_CLOUD) { users = await firestoreUsers.getAll(); withdrawals = await firestoreWithdrawals.getAll(); }
    else { users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS); withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []); }
    const totalDistributed = withdrawals.filter(w => w.status === 'Approved').reduce((s, w) => s + w.amount, 0) + users.reduce((s, u) => s + u.balance, 0);
    const completedTasks = users.reduce((s, u) => s + (u.completedTasks ? u.completedTasks.length : 0), 0);
    return { totalBDT: parseFloat(totalDistributed.toFixed(2)), totalUsers: users.length, completedTasks };
  },

  getLeaderboard: async () => {
    const users = USE_CLOUD ? await firestoreUsers.getAll() : loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    return [...users].sort((a, b) => b.balance - a.balance);
  },

  testerUpdateUser: async (userId, customFields) => {
    if (USE_CLOUD) {
      const user = await firestoreUsers.get(userId);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...customFields };
      await firestoreUsers.set(userId, updated);
      if (currentUser && currentUser.id === userId) { currentUser = updated; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }
      return updated;
    }
    lsUsers = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const idx = lsUsers.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    lsUsers[idx] = { ...lsUsers[idx], ...customFields };
    saveToStorage(STORAGE_KEYS.USERS, lsUsers);
    if (currentUser && currentUser.id === userId) { currentUser = lsUsers[idx]; saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser); }
    return lsUsers[idx];
  },
};

export const USE_CLOUD_BACKEND = USE_CLOUD;
