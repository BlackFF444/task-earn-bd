import React, { useState, useEffect } from 'react';
import {
  Home, CheckSquare, Trophy, User, Settings, Clock, Zap, Moon, Sun
} from 'lucide-react';
import { authService, dbService, getVIPLevelName } from './services/firebase';
import { telegramService } from './services/telegram';
import { AppProvider, useApp } from './context/AppContext';
import HomeTab from './components/HomeTab';
import TasksTab from './components/TasksTab';
import LeaderboardTab from './components/LeaderboardTab';
import ProfileTab from './components/ProfileTab';
import AdminTab from './components/AdminTab';
import ToastContainer from './components/ToastContainer';

function AppInner() {
  const { t, theme, toggleTheme, lang, toggleLang, notify } = useApp();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [loading, setLoading] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingTaskClaims, setPendingTaskClaims] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalBDT: 0, totalUsers: 0, completedTasks: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isInTelegram, setIsInTelegram] = useState(() => telegramService.isTelegramWebApp());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Retry Telegram SDK detection (loads async)
  useEffect(() => {
    if (isInTelegram) return;
    let retries = 0;
    const check = setInterval(() => {
      if (telegramService.isTelegramWebApp()) {
        setIsInTelegram(true);
        clearInterval(check);
      }
      retries++;
      if (retries > 20) clearInterval(check); // stop after 2s
    }, 100);
    return () => clearInterval(check);
  }, [isInTelegram]);

  const fetchData = async () => {
    try {
      const activeUser = authService.getCurrentUser();
      setUser(activeUser);
      if (activeUser) {
        const allTasks = await dbService.getTasks();
        setTasks(allTasks);
        const allWithdrawals = await dbService.getWithdrawals();
        setWithdrawals(allWithdrawals);
        const allPendingClaims = await dbService.getPendingTaskClaims();
        setPendingTaskClaims(allPendingClaims);
        const stats = await dbService.getGlobalStats();
        setGlobalStats(stats);
      }
    } catch (err) {
      console.error('Error loading application data:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const refreshAppState = async () => await fetchData();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const loggedInUser = await authService.loginWithTelegram();
      setUser(loggedInUser);
      await refreshAppState();
      notify('Welcome to Task Earn BD!', 'success');
    } catch (e) {
      console.error('Telegram login error:', e);
      notify(e.message || 'Login failed. Try again.', 'error');
      if (!isInTelegram || (e.message && e.message.includes('user data'))) {
        setIsInTelegram(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const loggedInUser = await authService.loginWithGoogle();
      setUser(loggedInUser);
      await refreshAppState();
      notify('Welcome to Task Earn BD!', 'success');
    } catch (e) {
      notify(e.message || 'Google login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = telegramService.isTelegramWebApp()
      ? await telegramService.showConfirm('Are you sure you want to logout?')
      : window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await authService.logout();
      setUser(null);
      setActiveTab('home');
    }
  };

  const formatClock = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden select-none transition-colors duration-300 ${
      theme === 'dark' ? 'bg-darkBg bg-grid' : 'bg-slate-100 bg-grid-light'
    }`}>
      <ToastContainer />

      {theme === 'dark' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blob-1 animate-pulse-slow -z-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blob-2 animate-pulse-slow -z-10" style={{ animationDelay: '4s' }} />
          <div className="absolute top-[30%] left-[25%] w-[45%] h-[45%] rounded-full bg-blob-3 animate-pulse-slow -z-10" style={{ animationDelay: '8s' }} />
        </>
      )}

      <div className={`w-full max-w-lg mx-auto min-h-screen backdrop-blur-3xl flex flex-col overflow-hidden relative ${
        theme === 'dark' ? 'bg-darkBg/98 border-x border-white/[0.08]' : 'bg-white/98 border-x border-slate-200'
      }`}>
          <header className={`px-4 py-3 border-b flex items-center justify-between z-10 ${
            theme === 'dark' ? 'border-white/[0.04] bg-white/[0.01]' : 'border-slate-200/80 bg-slate-50/60'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] tracking-wider shadow-lg shadow-purple-500/25 relative overflow-hidden">
                <span className="relative z-10">TE</span>
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
              </div>
              <div>
                <h1 className="text-[11px] font-bold tracking-[0.15em] gradient-text">TASK EARN BD</h1>
                <div className={`flex items-center gap-1 text-[8px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                  <Clock className="w-2.5 h-2.5 text-indigo-400/70" />
                  <span className="font-mono tracking-wider">{formatClock(currentTime)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={toggleLang} className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[9px] font-black transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'}`} title="Toggle Language">
                {lang === 'en' ? 'বাং' : 'EN'}
              </button>
              <button onClick={toggleTheme} className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${theme === 'dark' ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`} title="Toggle Theme">
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              {user && (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider shimmer-effect ${theme === 'dark' ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20' : 'text-violet-600 bg-violet-100 border border-violet-200'}`}>
                      {getVIPLevelName(user.referralCount)}
                    </div>
                    <div className={`text-[11px] font-black mt-0.5 text-glow-green ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ৳{user.balance.toFixed(2)} <span className={`text-[8px] font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-slate-400'}`}>BDT</span>
                    </div>
                  </div>
                  <img src={user.photoURL} alt={user.name} className="w-8.5 h-8.5 rounded-full border border-violet-500/40 object-cover bg-slate-900 shadow-md shadow-violet-500/10" />
                </div>
              )}
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-4 relative">
            {!user ? (
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md ${theme === 'dark' ? 'bg-[#05060f]/95' : 'bg-white/95'}`}>
                <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                  <Zap className="w-10 h-10 text-white fill-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute -inset-1 rounded-[22px] border border-white/10 animate-ping opacity-20" />
                </div>
                <h2 className={`text-xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'gradient-text' : 'text-slate-800'}`}>
                  TASK EARN BD
                </h2>
                <p className={`text-[11px] mb-4 max-w-[260px] leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                  Complete simple micro-social tasks, claim daily rewards & withdraw BDT instantly.
                </p>

                {isInTelegram ? (
                  <button onClick={handleLogin} disabled={loading} className="w-full max-w-[260px] py-3 px-6 rounded-[14px] glass-button-premium text-[11px] font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        <span className="tracking-widest">START EARNING</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2.5 w-full max-w-[260px]">
                    <button onClick={handleGoogleLogin} disabled={loading} className="w-full py-3 px-6 rounded-[14px] bg-white text-[11px] font-black text-gray-800 flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg">
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin" />
                      ) : (
                        <>
                          <svg className="w-4 h-4" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
                          <span className="tracking-widest">CONTINUE WITH GOOGLE</span>
                        </>
                      )}
                    </button>
                    <div className={`p-3 rounded-2xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
                      <p className={`text-[9px] leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                        Or open in Telegram bot for auto-login. Use Google to login from the Android app directly.
                      </p>
                    </div>
                  </div>
                )}

                <div className={`absolute bottom-5 left-5 right-5 p-2.5 rounded-xl border ${theme === 'dark' ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-slate-50/80 border-slate-200/60'}`}>
                  <p className={`text-[8px] ${theme === 'dark' ? 'text-gray-600' : 'text-slate-400'}`}>
                    {isInTelegram ? 'Auto-login with your Telegram account' : 'Telegram Mini App - Open in bot to start'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'home' && <HomeTab user={user} refreshAppState={refreshAppState} tasks={tasks} />}
                {activeTab === 'tasks' && <TasksTab user={user} tasks={tasks} refreshAppState={refreshAppState} />}
                {activeTab === 'leaderboard' && <LeaderboardTab user={user} refreshAppState={refreshAppState} />}
                {activeTab === 'profile' && <ProfileTab user={user} refreshAppState={refreshAppState} onLogout={handleLogout} withdrawals={withdrawals} />}
                {activeTab === 'admin' && <AdminTab user={user} tasks={tasks} withdrawals={withdrawals} pendingTaskClaims={pendingTaskClaims} globalStats={globalStats} refreshAppState={refreshAppState} />}
              </>
            )}
          </main>

          {user && (
            <nav className={`sticky bottom-0 h-14 backdrop-blur-2xl border-t flex items-center justify-around px-2 z-10 ${theme === 'dark' ? 'bg-[#0a0b1a]/90 border-white/[0.06] shadow-[0_-4px_20px_rgba(0,0,0,0.3)]' : 'bg-white/90 border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'}`}>
              {[
                { key: 'home', icon: <Home className="w-[17px] h-[17px]" />, label: t('home') },
                { key: 'tasks', icon: <CheckSquare className="w-[17px] h-[17px]" />, label: t('tasks') },
                { key: 'leaderboard', icon: <Trophy className="w-[17px] h-[17px]" />, label: t('events') },
                { key: 'profile', icon: <User className="w-[17px] h-[17px]" />, label: t('wallet') },
                { key: 'admin', icon: <Settings className="w-[17px] h-[17px]" />, label: t('admin'), isAdmin: true },
              ].map(nav => (
                <button key={nav.key} onClick={() => setActiveTab(nav.key)} className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-[12px] transition-all duration-300 ${activeTab === nav.key ? nav.isAdmin ? 'text-pink-400 font-extrabold scale-105 bg-pink-500/10' : `font-extrabold scale-105 ${theme === 'dark' ? 'text-violet-400 bg-violet-500/10' : 'text-violet-600 bg-violet-100'}` : theme === 'dark' ? 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}>
                  {nav.icon}
                  <span className="text-[7px] font-bold uppercase tracking-wider">{nav.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}

export default App;
