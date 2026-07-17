import React, { useState, useEffect } from 'react';
import { Moon, Sun, Lock, Shield } from 'lucide-react';
import { dbService } from './services/firebase';
import { AppProvider, useApp } from './context/AppContext';
import AdminTab from './components/AdminTab';
import ToastContainer from './components/ToastContainer';

const ADMIN_PASSWORD = 'FAHIM2020';

function AdminAppInner() {
  const { theme, toggleTheme, lang, toggleLang, notify } = useApp();
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [pendingTaskClaims, setPendingTaskClaims] = useState([]);
  const [globalStats, setGlobalStats] = useState({ totalBDT: 0, totalUsers: 0, completedTasks: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (localStorage.getItem('te_admin_auth') === 'true') {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      if (passwordInput === ADMIN_PASSWORD) {
        setAuthenticated(true);
        localStorage.setItem('te_admin_auth', 'true');
        notify('Admin access granted', 'success');
        await fetchData();
      } else {
        notify('Wrong password', 'error');
      }
    } catch (e) {
      notify('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('te_admin_auth');
    setAuthenticated(false);
    setPasswordInput('');
  };

  const fetchData = async () => {
    try {
      const allTasks = await dbService.getTasks();
      setTasks(allTasks);
      const allWithdrawals = await dbService.getWithdrawals();
      setWithdrawals(allWithdrawals);
      const allPendingClaims = await dbService.getPendingTaskClaims();
      setPendingTaskClaims(allPendingClaims);
      const stats = await dbService.getGlobalStats();
      setGlobalStats(stats);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  useEffect(() => { if (authenticated) fetchData(); }, [authenticated]);

  const refreshAppState = async () => await fetchData();

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
        </>
      )}

      <div className={`w-full max-w-lg mx-auto min-h-screen backdrop-blur-3xl flex flex-col overflow-hidden relative ${
        theme === 'dark' ? 'bg-darkBg/98 border-x border-white/[0.08]' : 'bg-white/98 border-x border-slate-200'
      }`}>
        <header className={`px-4 py-3 border-b flex items-center justify-between z-10 ${
          theme === 'dark' ? 'border-white/[0.04] bg-white/[0.01]' : 'border-slate-200/80 bg-slate-50/60'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 flex items-center justify-center font-bold text-[10px] shadow-lg">
              <span className="relative z-10">AD</span>
            </div>
            <div>
              <h1 className="text-[11px] font-bold tracking-[0.15em] text-pink-500">TASK EARN BD · ADMIN</h1>
              <div className={`flex items-center gap-1 text-[8px] mt-0.5 ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                <span className="font-mono tracking-wider">{formatClock(currentTime)}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={toggleLang} className={`w-7 h-7 rounded-lg border flex items-center justify-center text-[9px] font-black ${theme === 'dark' ? 'bg-white/5 border-white/10 text-gray-300' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              {lang === 'en' ? 'বাং' : 'EN'}
            </button>
            <button onClick={toggleTheme} className={`w-7 h-7 rounded-lg border flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 border-white/10 text-amber-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            {authenticated && (
              <button onClick={handleLogout} className={`w-7 h-7 rounded-lg border flex items-center justify-center ${theme === 'dark' ? 'bg-white/5 border-white/10 text-red-400' : 'bg-slate-100 border-slate-200 text-red-500'}`} title="Logout">
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-4 relative">
          {!authenticated ? (
            <div className={`absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20 backdrop-blur-md ${theme === 'dark' ? 'bg-[#05060f]/95' : 'bg-white/95'}`}>
              <div className="w-20 h-20 rounded-[22px] bg-gradient-to-br from-pink-500 via-rose-500 to-red-600 flex items-center justify-center mb-6 shadow-2xl shadow-pink-500/30 relative overflow-hidden">
                <Shield className="w-10 h-10 text-white relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <h2 className={`text-xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-pink-400' : 'text-pink-600'}`}>
                ADMIN PANEL
              </h2>
              <p className={`text-[11px] mb-6 max-w-[260px] leading-relaxed ${theme === 'dark' ? 'text-gray-500' : 'text-slate-400'}`}>
                Enter admin password to access the control panel.
              </p>

              <div className="flex flex-col gap-3 w-full max-w-[260px]">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className={`w-full py-2.5 px-4 rounded-[12px] text-[11px] font-bold outline-none transition-all ${
                    theme === 'dark'
                      ? 'bg-white/[0.05] border border-white/[0.08] text-white placeholder:text-gray-600 focus:border-pink-500/50'
                      : 'bg-slate-100 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-pink-400'
                  }`}
                />

                <button onClick={handleLogin} disabled={loading || !passwordInput} className={`w-full py-3 px-6 rounded-[14px] text-[11px] font-black flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-lg bg-gradient-to-r from-pink-600 to-rose-600 text-white hover:from-pink-500 hover:to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span className="tracking-widest">UNLOCK</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <AdminTab
              user={{ id: 'admin', name: 'Admin', balance: 0, referralCount: 0, isAdmin: true }}
              tasks={tasks}
              withdrawals={withdrawals}
              pendingTaskClaims={pendingTaskClaims}
              globalStats={globalStats}
              refreshAppState={refreshAppState}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function AdminApp() {
  return (
    <AppProvider>
      <AdminAppInner />
    </AppProvider>
  );
}

export default AdminApp;
