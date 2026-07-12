// Firebase / LocalStorage Dual-Mode Data Layer
// Transparently handles operations locally so the platform works out-of-the-box

const STORAGE_KEYS = {
  USERS: 'task_earn_bd_users',
  TASKS: 'task_earn_bd_tasks',
  WITHDRAWALS: 'task_earn_bd_withdrawals',
  PENDING_TASK_CLAIMS: 'task_earn_bd_pending_claims',
  CURRENT_USER: 'task_earn_bd_curr_user',
  QUIZ_LAST_TAKEN: 'task_earn_bd_quiz_taken',
};

// Seed initial tasks if none exist
const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Join Task Earn Bd Official Telegram Channel',
    reward: 0.05,
    category: 'Telegram',
    url: 'https://t.me/task_earn_bd',
    timer: 10, // seconds
    claimedCount: 142,
    targetLimit: 500,
  },
  {
    id: 'task-2',
    title: 'Follow our Founder on X (Twitter)',
    reward: 0.04,
    category: 'Twitter',
    url: 'https://twitter.com/task_earn_bd',
    timer: 12,
    claimedCount: 89,
    targetLimit: 300,
  },
  {
    id: 'task-3',
    title: 'Watch & Like YouTube Video: Cryptocurrencies for Beginners',
    reward: 0.08,
    category: 'YouTube',
    url: 'https://youtube.com',
    timer: 15,
    claimedCount: 299,
    targetLimit: 300, // Close to limit to show sold out functionality
  },
  {
    id: 'task-4',
    title: 'Share our project page on Facebook',
    reward: 0.03,
    category: 'Facebook',
    url: 'https://facebook.com',
    timer: 8,
    claimedCount: 450,
    targetLimit: 500,
  },
];

// Seed initial mock users for Leaderboard and Stats
const DEFAULT_USERS = [
  {
    id: 'mock-user-1',
    name: 'Sabbir Rahman',
    email: 'sabbir@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=sabbir',
    balance: 12.45,
    referralCode: 'SABBIR77',
    referralCount: 18, // Platinum
    streakCount: 6,
    lastCheckIn: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    completedTasks: ['task-1', 'task-2', 'task-4'],
  },
  {
    id: 'mock-user-2',
    name: 'Tahsan Khan',
    email: 'tahsan@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=tahsan',
    balance: 5.82,
    referralCode: 'TAHSAN99',
    referralCount: 8, // Gold
    streakCount: 3,
    lastCheckIn: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    completedTasks: ['task-1', 'task-2'],
  },
  {
    id: 'mock-user-3',
    name: 'Anika Tabassum',
    email: 'anika@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=anika',
    balance: 24.15,
    referralCode: 'ANIKA12',
    referralCount: 22, // Platinum
    streakCount: 7,
    lastCheckIn: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    completedTasks: ['task-1', 'task-2', 'task-3', 'task-4'],
  },
  {
    id: 'mock-user-4',
    name: 'Mahfuz Alam',
    email: 'mahfuz@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=mahfuz',
    balance: 1.25,
    referralCode: 'MAHFUZ55',
    referralCount: 2, // Bronze
    streakCount: 1,
    lastCheckIn: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    completedTasks: ['task-1'],
  },
  {
    id: 'mock-user-5',
    name: 'Faria Jahan',
    email: 'faria@gmail.com',
    photoURL: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=faria',
    balance: 0.45,
    referralCode: 'FARIA777',
    referralCount: 0, // Bronze
    streakCount: 0,
    lastCheckIn: null,
    completedTasks: [],
  }
];

// Helper functions for LocalStorage
const loadFromStorage = (key, defaultValue) => {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  return JSON.parse(data);
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initialize Storage
let users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
let tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
let withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
let pendingTaskClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
let currentUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);

// Generate random referral code
const generateReferralCode = (name) => {
  const prefix = (name || 'USER').substring(0, 4).toUpperCase().replace(/[^A-Z]/g, 'X');
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${num}`;
};

export const getMultiplier = (referralCount = 0) => {
  if (referralCount >= 15) return 2.0; // Platinum VIP
  if (referralCount >= 5) return 1.5;  // Gold Club Member
  return 1.0;                         // Bronze Member
};

export const getVIPLevelName = (referralCount = 0) => {
  if (referralCount >= 15) return 'Platinum VIP';
  if (referralCount >= 5) return 'Gold Club Member';
  return 'Bronze Member';
};

// Auth Service
export const authService = {
  // Login with Telegram WebApp (primary login method)
  loginWithTelegram: async () => {
    const { telegramService } = await import('./telegram');
    
    if (!telegramService.isTelegramWebApp()) {
      throw new Error('This app can only be used inside Telegram Messenger');
    }
    
    telegramService.init();
    const tgUser = telegramService.getUser();
    
    if (!tgUser) {
      throw new Error('Could not retrieve Telegram user data');
    }
    
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    
    // Use telegramId as unique identifier for data isolation
    let user = users.find(u => u.telegramId === tgUser.id);
    
    if (!user) {
      const fullName = `${tgUser.firstName} ${tgUser.lastName}`.trim();
      user = {
        id: 'tg-' + tgUser.id,
        telegramId: tgUser.id,
        name: fullName,
        photoURL: tgUser.photoUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${fullName.replace(/\s/g, '')}`,
        balance: 0.00,
        referralCode: generateReferralCode(fullName),
        referralCount: 0,
        streakCount: 0,
        lastCheckIn: null,
        completedTasks: [],
        telegramUsername: tgUser.username,
        isPremium: tgUser.isPremium,
      };
      users.push(user);
      saveToStorage(STORAGE_KEYS.USERS, users);
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
    if (currentUser) {
      // Re-fetch current user from database to ensure fresh states
      users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
      const freshUser = users.find(u => u.id === currentUser.id);
      if (freshUser) {
        currentUser = freshUser;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      }
    }
    return currentUser;
  }
};

// Database Service
export const dbService = {
  // Tasks
  getTasks: async () => {
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    return tasks;
  },

  // Pending Task Claims
  getPendingTaskClaims: async () => {
    pendingTaskClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    return pendingTaskClaims;
  },

  getUserPendingClaims: async (userId) => {
    pendingTaskClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    return pendingTaskClaims.filter(c => c.userId === userId && c.status === 'Pending');
  },

  approveTaskClaim: async (claimId) => {
    pendingTaskClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);

    const claimIndex = pendingTaskClaims.findIndex(c => c.id === claimId);
    if (claimIndex === -1) throw new Error('Pending claim not found');

    const claim = pendingTaskClaims[claimIndex];
    if (claim.status !== 'Pending') {
      throw new Error('Claim already processed');
    }

    const userIndex = users.findIndex(u => u.id === claim.userId);
    const taskIndex = tasks.findIndex(t => t.id === claim.taskId);

    if (userIndex === -1 || taskIndex === -1) {
      throw new Error('User or Task not found');
    }

    const user = users[userIndex];
    const task = tasks[taskIndex];

    // Credit user balance
    user.balance = parseFloat((user.balance + claim.earnedAmount).toFixed(4));
    user.completedTasks.push(claim.taskId);

    // Increment task claim count
    task.claimedCount += 1;

    // Update claim status
    pendingTaskClaims[claimIndex].status = 'Approved';
    pendingTaskClaims[claimIndex].processedAt = new Date().toISOString();

    users[userIndex] = user;
    tasks[taskIndex] = task;

    saveToStorage(STORAGE_KEYS.USERS, users);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    saveToStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, pendingTaskClaims);

    // Update active session if it's the same user
    if (currentUser && currentUser.id === claim.userId) {
      currentUser = user;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    }

    return pendingTaskClaims[claimIndex];
  },

  rejectTaskClaim: async (claimId) => {
    pendingTaskClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);

    const claimIndex = pendingTaskClaims.findIndex(c => c.id === claimId);
    if (claimIndex === -1) throw new Error('Pending claim not found');

    if (pendingTaskClaims[claimIndex].status !== 'Pending') {
      throw new Error('Claim already processed');
    }

    pendingTaskClaims[claimIndex].status = 'Rejected';
    pendingTaskClaims[claimIndex].processedAt = new Date().toISOString();

    saveToStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, pendingTaskClaims);

    return pendingTaskClaims[claimIndex];
  },

  addTask: async (taskData) => {
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    const newTask = {
      id: 'task-' + Date.now(),
      claimedCount: 0,
      ...taskData,
    };
    tasks.push(newTask);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  updateTask: async (taskId, updatedData) => {
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    tasks = tasks.map(t => t.id === taskId ? { ...t, ...updatedData } : t);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return tasks.find(t => t.id === taskId);
  },

  deleteTask: async (taskId) => {
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    tasks = tasks.filter(t => t.id !== taskId);
    saveToStorage(STORAGE_KEYS.TASKS, tasks);
    return true;
  },

  claimTask: async (userId, taskId, proofImage = null) => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    pendingTaskClaims = loadFromStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, []);

    const userIndex = users.findIndex(u => u.id === userId);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (userIndex === -1 || taskIndex === -1) throw new Error('User or Task not found');

    const user = users[userIndex];
    const task = tasks[taskIndex];

    // Check if task is already completed
    if (user.completedTasks.includes(taskId)) {
      throw new Error('Task already claimed');
    }

    // Check if task is sold out
    if (task.claimedCount >= task.targetLimit) {
      throw new Error('Task is sold out');
    }

    // Check if there's already a pending claim for this user and task
    const existingPending = pendingTaskClaims.find(
      p => p.userId === userId && p.taskId === taskId && p.status === 'Pending'
    );
    if (existingPending) {
      throw new Error('Task already pending approval');
    }

    // Calculate reward with multiplier
    const multiplier = getMultiplier(user.referralCount);
    const earnedAmount = task.reward * multiplier;

    // Create pending claim instead of immediate completion
    const newPendingClaim = {
      id: 'ptc-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhoto: user.photoURL,
      taskId: task.id,
      taskTitle: task.title,
      taskCategory: task.category,
      reward: task.reward,
      earnedAmount: earnedAmount,
      multiplier: multiplier,
      proofImage: proofImage,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    pendingTaskClaims.push(newPendingClaim);
    saveToStorage(STORAGE_KEYS.PENDING_TASK_CLAIMS, pendingTaskClaims);

    return { pendingClaim: newPendingClaim, earnedAmount };
  },

  // Daily Streak
  claimStreak: async (userId) => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    const user = users[userIndex];

    const STREAK_REWARDS = [0.005, 0.010, 0.015, 0.020, 0.025, 0.035, 0.050]; // Day 1 to Day 7

    const now = new Date();
    let isStreakBroken = false;
    let nextStreakCount = 1;

    if (user.lastCheckIn) {
      const lastCheckInDate = new Date(user.lastCheckIn);
      
      // Calculate diff in hours
      const diffMs = now - lastCheckInDate;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours < 24) {
        // Already checked in today
        throw new Error('You have already checked in today. Please return tomorrow!');
      } else if (diffHours >= 48) {
        // Streak is broken
        isStreakBroken = true;
        nextStreakCount = 1;
      } else {
        // Check-in continuation
        nextStreakCount = (user.streakCount % 7) + 1;
      }
    }

    const reward = STREAK_REWARDS[nextStreakCount - 1];
    user.balance = parseFloat((user.balance + reward).toFixed(4));
    user.streakCount = nextStreakCount;
    user.lastCheckIn = now.toISOString();

    users[userIndex] = user;
    saveToStorage(STORAGE_KEYS.USERS, users);

    if (currentUser && currentUser.id === userId) {
      currentUser = user;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    }

    return { reward, streakCount: nextStreakCount, isStreakBroken };
  },

  // Crypto Quiz
  submitQuizAnswer: async (userId, isCorrect) => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    const user = users[userIndex];

    // Check if they already took a quiz today (localstorage lock)
    const lastQuiz = localStorage.getItem(`${STORAGE_KEYS.QUIZ_LAST_TAKEN}_${userId}`);
    const now = new Date();
    if (lastQuiz) {
      const lastQuizDate = new Date(lastQuiz);
      if (now.toDateString() === lastQuizDate.toDateString()) {
        throw new Error('You have already taken today\'s quiz. Come back tomorrow!');
      }
    }

    localStorage.setItem(`${STORAGE_KEYS.QUIZ_LAST_TAKEN}_${userId}`, now.toISOString());

    let reward = 0;
    if (isCorrect) {
      reward = 0.05; // Quiz correct reward
      user.balance = parseFloat((user.balance + reward).toFixed(4));
      users[userIndex] = user;
      saveToStorage(STORAGE_KEYS.USERS, users);
      
      if (currentUser && currentUser.id === userId) {
        currentUser = user;
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      }
    }

    return { correct: isCorrect, reward };
  },

  canTakeQuiz: (userId) => {
    const lastQuiz = localStorage.getItem(`${STORAGE_KEYS.QUIZ_LAST_TAKEN}_${userId}`);
    if (!lastQuiz) return true;
    const lastQuizDate = new Date(lastQuiz);
    return new Date().toDateString() !== lastQuizDate.toDateString();
  },

  // Withdrawals
  getWithdrawals: async () => {
    withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    return withdrawals;
  },

  requestWithdrawal: async (userId, amount, gateway, walletAddress) => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);

    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');
    const user = users[userIndex];

    if (user.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // Deduct user balance immediately
    user.balance = parseFloat((user.balance - amount).toFixed(4));
    users[userIndex] = user;
    saveToStorage(STORAGE_KEYS.USERS, users);

    // Create withdrawal request
    const newRequest = {
      id: 'wd-' + Date.now(),
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      amount: amount,
      gateway: gateway,
      walletAddress: walletAddress,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    withdrawals.push(newRequest);
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    if (currentUser && currentUser.id === userId) {
      currentUser = user;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    }

    return newRequest;
  },

  approveWithdrawal: async (withdrawalId) => {
    withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    const requestIndex = withdrawals.findIndex(w => w.id === withdrawalId);
    if (requestIndex === -1) throw new Error('Withdrawal request not found');

    if (withdrawals[requestIndex].status !== 'Pending') {
      throw new Error('Request already processed');
    }

    withdrawals[requestIndex].status = 'Approved';
    withdrawals[requestIndex].processedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    return withdrawals[requestIndex];
  },

  rejectWithdrawal: async (withdrawalId) => {
    withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);

    const requestIndex = withdrawals.findIndex(w => w.id === withdrawalId);
    if (requestIndex === -1) throw new Error('Withdrawal request not found');
    
    const request = withdrawals[requestIndex];
    if (request.status !== 'Pending') {
      throw new Error('Request already processed');
    }

    // Auto-refund logic
    const userIndex = users.findIndex(u => u.id === request.userId);
    if (userIndex !== -1) {
      users[userIndex].balance = parseFloat((users[userIndex].balance + request.amount).toFixed(4));
      saveToStorage(STORAGE_KEYS.USERS, users);

      if (currentUser && currentUser.id === request.userId) {
        currentUser = users[userIndex];
        saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
      }
    }

    request.status = 'Rejected';
    request.processedAt = new Date().toISOString();
    saveToStorage(STORAGE_KEYS.WITHDRAWALS, withdrawals);

    return request;
  },

  // Stats & Leaderboard
  getGlobalStats: async () => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    tasks = loadFromStorage(STORAGE_KEYS.TASKS, DEFAULT_TASKS);
    withdrawals = loadFromStorage(STORAGE_KEYS.WITHDRAWALS, []);

    const totalDistributed = withdrawals
      .filter(w => w.status === 'Approved')
      .reduce((sum, w) => sum + w.amount, 0) + 
      users.reduce((sum, u) => sum + u.balance, 0);

    const totalCompletedTasks = users.reduce((sum, u) => sum + u.completedTasks.length, 0);

    return {
      totalUSDT: parseFloat(totalDistributed.toFixed(2)),
      totalUsers: users.length,
      completedTasks: totalCompletedTasks,
    };
  },

  getLeaderboard: async () => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    // Sort users by balance desc
    return [...users].sort((a, b) => b.balance - a.balance);
  },

  // Tester / Admin Tool: Modify User Data directly
  testerUpdateUser: async (userId, customFields) => {
    users = loadFromStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error('User not found');

    const updatedUser = {
      ...users[userIndex],
      ...customFields
    };

    users[userIndex] = updatedUser;
    saveToStorage(STORAGE_KEYS.USERS, users);

    if (currentUser && currentUser.id === userId) {
      currentUser = updatedUser;
      saveToStorage(STORAGE_KEYS.CURRENT_USER, currentUser);
    }

    return updatedUser;
  }
};
