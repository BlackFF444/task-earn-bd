import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// ─── Language Translations ───────────────────────────────────────────────────
export const translations = {
  en: {
    // Nav
    home: 'Home',
    tasks: 'Tasks',
    events: 'Events',
    wallet: 'Wallet',
    admin: 'Admin',
    // Home
    hello: 'Hello',
    welcomeBack: 'Welcome back to your dashboard.',
    levelMultiplier: 'Level Multiplier',
    dailyStreak: 'Daily Streak Reward',
    dayStreak: 'Day Streak',
    claimDay: 'Claim Day',
    streakReward: 'Streak Reward',
    nextReward: 'Next Reward Unlocks in',
    yourTaskProgress: 'Your Task Progress',
    completed: 'Completed',
    referralSystem: 'Referral System',
    inviteEarn: 'Invite & Earn',
    yourReferralLink: 'Your Referral Link',
    copyLink: 'Copy Link',
    copied: 'Copied!',
    totalInvites: 'Total Invites',
    commission: 'Commission Earned',
    // Tasks
    availableTasks: 'Available Tasks',
    claimReward: 'Claim Reward',
    soldOut: 'Sold Out',
    claimed: 'Claimed ✓',
    proofRequired: 'Proof Required',
    uploadProof: 'Upload Screenshot Proof',
    submitProof: 'Submit Proof',
    // Profile/Wallet
    dailyQuiz: 'Daily Crypto Quiz',
    submitAnswer: 'Submit Answer',
    withdrawal: 'Withdrawal Portal',
    withdrawHistory: 'Withdrawal History',
    myStats: 'My Stats',
    earningsGraph: 'Earnings Overview',
    taskHistory: 'Task History',
    streakCalendar: 'Streak Calendar',
    // Admin
    adminPanel: 'Staff Control Panel',
    analytics: 'Analytics Dashboard',
    activeUsers: 'Active Users',
    totalDistributed: 'Total Distributed',
    totalTasks: 'Total Tasks',
    pendingWithdrawals: 'Pending Withdrawals',
    announcements: 'Broadcast Announcement',
    sendAnnouncement: 'Send to All Users',
    announcementPlaceholder: 'Type your message here...',
    taskCreator: 'Task Creator',
    // General
    logout: 'Logout',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    success: 'Success',
    error: 'Error',
    dark: 'Dark',
    light: 'Light',
    language: 'Language',
    notifications: 'Notifications',
  },
  bn: {
    // Nav
    home: 'হোম',
    tasks: 'টাস্ক',
    events: 'ইভেন্ট',
    wallet: 'ওয়ালেট',
    admin: 'অ্যাডমিন',
    // Home
    hello: 'হ্যালো',
    welcomeBack: 'আপনার ড্যাশবোর্ডে স্বাগতম।',
    levelMultiplier: 'লেভেল মাল্টিপ্লায়ার',
    dailyStreak: 'দৈনিক স্ট্রিক পুরস্কার',
    dayStreak: 'দিনের স্ট্রিক',
    claimDay: 'দিন ক্লেইম করুন',
    streakReward: 'স্ট্রিক পুরস্কার',
    nextReward: 'পরবর্তী পুরস্কার আনলক হবে',
    yourTaskProgress: 'আপনার টাস্ক অগ্রগতি',
    completed: 'সম্পন্ন',
    referralSystem: 'রেফারেল সিস্টেম',
    inviteEarn: 'আমন্ত্রণ করুন ও আয় করুন',
    yourReferralLink: 'আপনার রেফারেল লিংক',
    copyLink: 'লিংক কপি',
    copied: 'কপি হয়েছে!',
    totalInvites: 'মোট আমন্ত্রণ',
    commission: 'কমিশন আয়',
    // Tasks
    availableTasks: 'উপলব্ধ টাস্ক',
    claimReward: 'পুরস্কার নিন',
    soldOut: 'শেষ হয়ে গেছে',
    claimed: 'সম্পন্ন ✓',
    proofRequired: 'প্রমাণ প্রয়োজন',
    uploadProof: 'স্ক্রিনশট প্রমাণ আপলোড করুন',
    submitProof: 'প্রমাণ জমা দিন',
    // Profile/Wallet
    dailyQuiz: 'দৈনিক ক্রিপ্টো কুইজ',
    submitAnswer: 'উত্তর জমা দিন',
    withdrawal: 'উইথড্রয়াল পোর্টাল',
    withdrawHistory: 'উইথড্রয়াল ইতিহাস',
    myStats: 'আমার পরিসংখ্যান',
    earningsGraph: 'আয়ের বিবরণ',
    taskHistory: 'টাস্ক ইতিহাস',
    streakCalendar: 'স্ট্রিক ক্যালেন্ডার',
    // Admin
    adminPanel: 'স্টাফ কন্ট্রোল প্যানেল',
    analytics: 'অ্যানালিটিক্স ড্যাশবোর্ড',
    activeUsers: 'সক্রিয় ব্যবহারকারী',
    totalDistributed: 'মোট বিতরণ করা হয়েছে',
    totalTasks: 'মোট টাস্ক',
    pendingWithdrawals: 'মুলতুবি উইথড্রয়াল',
    announcements: 'সম্প্রচার বার্তা',
    sendAnnouncement: 'সবাইকে পাঠান',
    announcementPlaceholder: 'আপনার বার্তা এখানে লিখুন...',
    taskCreator: 'টাস্ক তৈরি করুন',
    // General
    logout: 'লগআউট',
    cancel: 'বাতিল',
    confirm: 'নিশ্চিত করুন',
    loading: 'লোড হচ্ছে...',
    success: 'সফল',
    error: 'ত্রুটি',
    dark: 'ডার্ক',
    light: 'লাইট',
    language: 'ভাষা',
    notifications: 'নোটিফিকেশন',
  }
};

// ─── Notification Types ──────────────────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// ─── Context Definition ──────────────────────────────────────────────────────
const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('te_lang') || 'en');
  const [theme, setTheme] = useState(() => localStorage.getItem('te_theme') || 'dark');
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState(() => {
    try { return JSON.parse(localStorage.getItem('te_announcements') || '[]'); }
    catch { return []; }
  });

  // Persist lang and theme
  useEffect(() => {
    localStorage.setItem('te_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('te_theme', theme);
    if (theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [theme]);

  // Translation helper
  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  }, [lang]);

  // Push notification
  const notify = useCallback((message, type = NOTIFICATION_TYPES.INFO, duration = 4000) => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Announcements
  const addAnnouncement = useCallback((message, author = 'Admin') => {
    const newAnn = {
      id: Date.now(),
      message,
      author,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setAnnouncements(prev => {
      const updated = [newAnn, ...prev].slice(0, 20); // keep max 20
      localStorage.setItem('te_announcements', JSON.stringify(updated));
      return updated;
    });
    return newAnn;
  }, []);

  const markAnnouncementRead = useCallback((id) => {
    setAnnouncements(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, read: true } : a);
      localStorage.setItem('te_announcements', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setAnnouncements(prev => {
      const updated = prev.map(a => ({ ...a, read: true }));
      localStorage.setItem('te_announcements', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const unreadCount = announcements.filter(a => !a.read).length;

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  const toggleLang = () => setLang(prev => prev === 'en' ? 'bn' : 'en');

  return (
    <AppContext.Provider value={{
      lang, setLang, toggleLang,
      theme, setTheme, toggleTheme,
      t,
      notifications, notify, dismissNotification,
      announcements, addAnnouncement, markAnnouncementRead, markAllRead, unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
