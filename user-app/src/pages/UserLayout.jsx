import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, CheckSquare, Trophy, User, Clock, LogOut } from 'lucide-react';
import useStore from '../stores/useStore';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/leaderboard', icon: Trophy, label: 'Events' },
  { path: '/wallet', icon: User, label: 'Wallet' },
];

export default function UserLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData, logout, settings } = useStore();
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

  if (settings.maintenanceMode) {
    return (
      <div className="min-h-screen bg-darkBg flex items-center justify-center p-6 text-center">
        <div className="glass-card rounded-2xl p-8 max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔧</span>
          </div>
          <h2 className="text-xl font-black text-white mb-2">Under Maintenance</h2>
          <p className="text-sm text-gray-400">We'll be back soon. Please check again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg bg-grid flex flex-col max-w-lg mx-auto relative">
      <header className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between z-10 bg-darkBg/90 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center font-bold text-[10px] text-white shadow-lg shadow-purple-500/25">TE</div>
          <div>
            <h1 className="text-[11px] font-bold tracking-[0.15em] gradient-text">TASK EARN BD</h1>
            <div className="flex items-center gap-1 text-[8px] text-gray-500 mt-0.5">
              <Clock className="w-2.5 h-2.5 text-indigo-400/70" />
              <span className="font-mono tracking-wider">{currentTime}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userData && (
            <div className="text-right">
              <div className="text-[8px] font-extrabold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 shimmer-effect">
                {getVIPName(userData.referralCount)}
              </div>
              <div className="text-[11px] font-black text-emerald-400 mt-0.5">
                ৳{userData.balance?.toFixed(2)} <span className="text-[8px] font-bold text-gray-400">BDT</span>
              </div>
            </div>
          )}
          {userData?.photoURL && (
            <img src={userData.photoURL} alt="" className="w-8 h-8 rounded-full border border-violet-500/40 object-cover" />
          )}
          <button onClick={() => logout()} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors">
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-14 backdrop-blur-2xl border-t border-white/[0.06] flex items-center justify-around px-2 z-50 bg-[#0a0b1a]/90 max-w-lg mx-auto">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all ${active ? 'text-violet-400 font-extrabold scale-105 bg-violet-500/10' : 'text-gray-500 hover:text-gray-300'}`}
            >
              <item.icon className="w-[17px] h-[17px]" />
              <span className="text-[7px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function getVIPName(count = 0) {
  if (count >= 15) return 'Platinum';
  if (count >= 5) return 'Gold';
  return 'Member';
}
