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
  const [globalStats, setGlobalStats] = useState({ totalUSDT: 0, totalUsers: 0, completedTasks: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Telegram and auto-login
  useEffect(() => {
    if (telegramService.isTelegramWebApp()) {
      telegramService.init();
      const tgUser = telegramService.getUser();
      if (tgUser) {
        (async () => {
          setLoading(true);
          try {
            const loggedInUser = await authService.loginWithTelegram();
            setUser(loggedInUser);
            await refreshAppState();
            notify('Welcome to Task Earn BD!', 'success');
          } catch {
            notify('Login failed. Try again.', 'error');
          } finally {
            setLoading(false);
          }
        })();
      }
    }
  }, []);

  const fetchData = async () => {
    try {
      const activeUser = authService.getCurrentUser();
      setUser(activeUser);
      const allTasks = await dbService.getTasks();
      setTasks(allTasks);
      const allWithdrawals = await dbService.getWithdrawals();
      setWithdrawals(allWithdrawals);
      const allPendingClaims = await dbService.getPendingTaskClaims();
      setPendingTaskClaims(allPendingClaims);
      const stats = await dbService.getGlobalStats();
      setGlobalStats(stats);
    } catch (err) {
      console.error('Error loading application data:', err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const refreshAppState = async () => await fetchData();

  const handleLogin = async (autoLogin = false) => {
    setLoading(true);
    try {
      let loggedInUser;
      if (telegramService.isTelegramWebApp() || autoLogin) {
        loggedInUser = await authService.loginWithTelegram();
      } else {
        loggedInUser = await authService.loginWithGoogle();
      }
      setUser(loggedInUser);
      await refreshAppState();
      notify('Welcome to Task Earn BD!', 'success');
    } catch {
      notify('Login failed. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await authService.logout();
      setUser(null);
      setActiveTab('home');
    }
  };

  const formatClock = (date) => date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-6 select-none transition-colors duration-300 ${
      theme === 'dark' ? 'bg-darkBg bg-grid' : 'bg-slate-100 bg-grid-light'
    }`}>

      {/* Toast notification layer */}
      <ToastContainer />

      {/* Ambient Blobs */}
      {theme === 'dark' && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blob-1 animate-pulse-slow -z-10" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blob-2 animate-pulse-slow -z-10" style={{ animationDelay: '4s' }} />
          <div className="absolute top-[30%] left-[25%] w-[45%] h-[45%] rounded-full bg-blob-3 animate-pulse-slow -z-10" style={{ animationDelay: '8s' }} />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-purple-500/5 animate-spin-slow -z-10 pointer-events-none hidden md:block" style={{ animationDuration: '30s' }} />
          <div className="absolute w-[800px] h-[800px] rounded-full border border-indigo-500/5 animate-spin-slow -z-10 pointer-events-none hidden md:block" style={{ animationDirection: 'reverse', animationDuration: '45s' }} />
        </>
      )}

      {/* Smartphone Frame */}
      <div className={`relative p-3 rounded-[44px] border-[4px] flex items-center justify-center ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 border-zinc-700/60 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_40px_rgba(168,85,247,0.08)]'
          : 'bg-gradient-to-br from-zinc-300 via-zinc-200 to-zinc-300 border-zinc-400/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.3)]'
      }`}>

        {/* Hardware Buttons */}
        <div className="absolute left-[-10px] top-[140px] w-[5px] h-[55px] bg-gradient-to-b from-slate-800 to-slate-700 rounded-l border border-slate-600/30" />
        <div className="absolute left-[-10px] top-[205px] w-[5px] h-[55px] bg-gradient-to-b from-slate-800 to-slate-700 rounded-l border border-slate-600/30" />
        <div className="absolute right-[-10px] top-[165px] w-[5px] h-[85px] bg-gradient-to-b from-slate-800 to-slate-700 rounded-r border border-slate-600/30" />

        {/* App Canvas */}
        <div className={`w-[390px] max-w-[90vw] h-[780px] backdrop-blur-3xl rounded-[34px] flex flex-col overflow-hidden relative border ${
          theme === 'dark'
            ? 'bg-darkBg/98 border-white/[0.08]'
            : 'bg-white/98 border-slate-200'
        }`}>

          {/* Notch */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-5.5 bg-black rounded-full flex items-center justify-center z-30 shadow-inner">
            <div className="w-10 h-1 bg-zinc-800 rounded-full opacity-65 mb-1.5" />
            <div className="absolute bottom-1 right-6 w-1.5 h-1.5 bg-zinc-900 rounded-full" />
          </div>

          {/* Top Header */}
          <header className={`pt-8 px-4 pb-3 border-b flex items-center justify-between z-10 ${
            theme === 'dark' ? 'border-white/[0.04] bg-white/[0.01]' : 'border-slate-200/80 bg-slate-50/60'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] tracking-wider shadow-lg shadow-purple-500/25 relative overflow-hidden">
                <span className="relative z-10">TE</span>
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
              </div>
              <div>
                <h1 className="text-[11px] font-bold tracking-[0.15em] gradient-text">
                  TASK EARN BD
                </h1>
                <div className={`flex items-center gap-1 text-[8px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                  <Clock className="w-2.5 h-2.5 text-indigo-400/70" />
                  <span className="font-mono tracking-wider">{formatClock(currentTime)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Language Toggle */}
              <button
                onClick={toggleLang}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[9px] font-black transition-all active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
                title="Toggle Language"
              >
                {lang === 'en' ? 'বাং' : 'EN'}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${
                  theme === 'dark'
                    ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10'
                    : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>

              {/* User Balance */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className={`text-[8px] font-extrabold px-2 py-0.5 rounded-full inline-block uppercase tracking-wider shimmer-effect ${
                      theme === 'dark' ? 'text-violet-300 bg-violet-500/10 border border-violet-500/20' : 'text-violet-600 bg-violet-100 border border-violet-200'
                    }`}>
                      {getVIPLevelName(user.referralCount)}
                    </div>
                    <div className={`text-[11px] font-black mt-0.5 text-glow-green ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      ${user.balance.toFixed(3)} <span className={`text-[8px] font-bold ${theme === 'dark' ? 'text-gray-400' : 'text-slate-400'}`}>USDT</span>
                    </div>
                  </div>
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="w-8.5 h-8.5 rounded-full border border-violet-500/40 object-cover bg-slate-900 shadow-md shadow-violet-500/10"
                  />
                </div>
              )}
            </div>
          </header>

          {/* Tab Content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-24 relative">
            {!user ? (
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md ${
                theme === 'dark' ? 'bg-[#05060f]/95' : 'bg-white/95'
              }`}>
                <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/30 relative overflow-hidden">
                  <Zap className="w-10 h-10 text-white fill-white relative z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute -inset-1 rounded-[22px] border border-white/10 animate-ping opacity-20" />
                </div>
                <h2 className={`text-xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'gradient-text' : 'text-slate-800'}`}>
                  START EARNING USDT
                </h2>
                <p className={`text-[11px] mb-8 max-w-[260px] leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                  Complete simple micro-social tasks, claim daily rewards & withdraw instantly.
                </p>
                <button
                  onClick={() => handleLogin(false)}
                  disabled={loading}
                  className="w-full max-w-[260px] py-3 px-6 rounded-[14px] glass-button-premium text-[11px] font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : telegramService.isTelegramWebApp() ? (
                    <>
                      <Zap className="w-4 h-4" />
                      <span className="tracking-widest">OPEN TASK EARN BD</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#ea4335" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fillRule="evenodd" />
                        <path fill="#4285f4" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span className="tracking-widest">1-Click Google Login</span>
                    </>
                  )}
                </button>
                <div className={`absolute bottom-5 left-5 right-5 p-2.5 rounded-xl border ${
                  theme === 'dark' ? 'bg-white/[0.02] border-white/[0.04]' : 'bg-slate-50/80 border-slate-200/60'
                }`}>
                  <p className={`text-[8px] ${theme === 'dark' ? 'text-gray-600' : 'text-slate-400'}`}>
                    Demo Mode: Click login to generate a sandbox session.
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

          {/* Floating Nav Dock */}
          {user && (
            <nav className={`absolute bottom-3 left-3 right-3 h-14 backdrop-blur-2xl border rounded-[18px] flex items-center justify-around px-2 z-10 ${
              theme === 'dark'
                ? 'bg-[#0a0b1a]/90 border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5)]'
                : 'bg-white/90 border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            }`}>
              {[
                { key: 'home', icon: <Home className="w-[17px] h-[17px]" />, label: t('home') },
                { key: 'tasks', icon: <CheckSquare className="w-[17px] h-[17px]" />, label: t('tasks') },
                { key: 'leaderboard', icon: <Trophy className="w-[17px] h-[17px]" />, label: t('events') },
                { key: 'profile', icon: <User className="w-[17px] h-[17px]" />, label: t('wallet') },
                { key: 'admin', icon: <Settings className="w-[17px] h-[17px]" />, label: t('admin'), isAdmin: true },
              ].map(nav => (
                <button
                  key={nav.key}
                  onClick={() => setActiveTab(nav.key)}
                  className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-[12px] transition-all duration-300 ${
                    activeTab === nav.key
                      ? nav.isAdmin
                        ? 'text-pink-400 font-extrabold scale-105 bg-pink-500/10'
                        : `font-extrabold scale-105 ${theme === 'dark' ? 'text-violet-400 bg-violet-500/10' : 'text-violet-600 bg-violet-100'}`
                      : theme === 'dark' ? 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {nav.icon}
                  <span className="text-[7px] font-bold uppercase tracking-wider">{nav.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>

      {/* Desktop footer */}
      <div className="hidden md:flex flex-col items-center mt-5 text-center max-w-sm text-gray-500">
        <p className="text-[9px] font-bold uppercase tracking-widest text-violet-400/80 mb-1">
          Telegram Mini-App Glassmorphism Console
        </p>
        <p className="text-[9px] leading-relaxed">
          Rendered inside a luxury device mockup frame. Dark/Light mode + বাংলা/EN language toggle available.
        </p>
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
