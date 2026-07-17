import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Clock, DollarSign, Users, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import useStore from '../stores/useStore';

const NAV = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { path: '/approvals', icon: Clock, label: 'Approvals' },
  { path: '/payouts', icon: DollarSign, label: 'Payouts' },
  { path: '/users', icon: Users, label: 'Users' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, logout, pendingClaims, pendingWithdrawals } = useStore();
  const [mobileMenu, setMobileMenu] = useState(false);

  const pendingCount = (pendingClaims?.length || 0) + (pendingWithdrawals?.length || 0);

  return (
    <div className="min-h-screen bg-darkBg bg-grid flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/[0.04] bg-darkBg/90 backdrop-blur-xl">
        <div className="p-4 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center font-bold text-[10px] text-white shadow-lg shadow-red-500/25">A</div>
            <div>
              <h1 className="text-[11px] font-bold tracking-[0.15em] gradient-text">ADMIN PANEL</h1>
              <p className="text-[8px] text-gray-500">Task Earn BD</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(item => {
            const active = location.pathname === item.path;
            const badge = item.path === '/approvals' ? pendingClaims?.length : item.path === '/payouts' ? pendingWithdrawals?.length : 0;
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? 'bg-violet-500/10 text-violet-400 font-bold' : 'text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]'}`}>
                <item.icon className="w-4 h-4" />
                <span className="text-xs">{item.label}</span>
                {badge > 0 && <span className="ml-auto text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.04]">
          <div className="flex items-center gap-2 px-3 py-2">
            {user?.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold text-white truncate">{user?.displayName || 'Admin'}</p>
              <p className="text-[8px] text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex-1 flex flex-col min-h-screen lg:hidden">
        <header className="px-4 py-3 border-b border-white/[0.04] flex items-center justify-between bg-darkBg/90 backdrop-blur-xl z-10">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400">
              {mobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div>
              <h1 className="text-[11px] font-bold tracking-[0.15em] gradient-text">ADMIN PANEL</h1>
              {pendingCount > 0 && <span className="text-[8px] text-red-400 font-bold">{pendingCount} pending</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.photoURL && <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full object-cover" />}
            <button onClick={logout} className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-red-400">
              <LogOut className="w-3 h-3" />
            </button>
          </div>
        </header>

        {mobileMenu && (
          <div className="absolute top-12 left-0 right-0 z-50 bg-[#0a0b1a]/95 backdrop-blur-xl border-b border-white/[0.06] p-3 space-y-1">
            {NAV.map(item => {
              const active = location.pathname === item.path;
              const badge = item.path === '/approvals' ? pendingClaims?.length : item.path === '/payouts' ? pendingWithdrawals?.length : 0;
              return (
                <button key={item.path} onClick={() => { navigate(item.path); setMobileMenu(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${active ? 'bg-violet-500/10 text-violet-400 font-bold' : 'text-gray-500 hover:text-gray-300'}`}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-xs">{item.label}</span>
                  {badge > 0 && <span className="ml-auto text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded-full">{badge}</span>}
                </button>
              );
            })}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>

      {/* Desktop main */}
      <main className="flex-1 overflow-y-auto p-6 hidden lg:block">
        <Outlet />
      </main>
    </div>
  );
}
