import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListTodo, CheckCircle, DollarSign, Users, ArrowLeft } from 'lucide-react';
import useStore from '../stores/useStore';

const ADMIN_NAV = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/tasks', icon: ListTodo, label: 'Tasks' },
  { path: '/admin/approvals', icon: CheckCircle, label: 'Approvals' },
  { path: '/admin/payouts', icon: DollarSign, label: 'Payouts' },
  { path: '/admin/users', icon: Users, label: 'Users' },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useStore();

  return (
    <div className="min-h-screen bg-darkBg flex max-w-6xl mx-auto">
      {/* Sidebar */}
      <aside className="w-56 bg-darkCard border-r border-white/[0.06] flex-col hidden md:flex fixed h-full">
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center text-white font-bold text-[10px]">AD</div>
            <div>
              <h1 className="text-[11px] font-bold text-pink-400 tracking-wider">ADMIN PANEL</h1>
              <p className="text-[8px] text-gray-500">{userData?.name}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {ADMIN_NAV.map(item => {
            const active = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path) && location.pathname !== '/admin';
            return (
              <button key={item.path} onClick={() => navigate(item.path)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${active ? 'bg-pink-500/10 text-pink-400' : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'}`}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="p-2 border-t border-white/[0.06]">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/[0.03]">
            <ArrowLeft className="w-4 h-4" /> Back to App
          </button>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-darkCard border-b border-white/[0.06] flex items-center justify-around px-1 z-50">
        {ADMIN_NAV.map(item => {
          const active = item.end ? location.pathname === item.path : location.pathname.startsWith(item.path) && location.pathname !== '/admin';
          return (
            <button key={item.path} onClick={() => navigate(item.path)} className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-lg text-[7px] font-bold ${active ? 'text-pink-400' : 'text-gray-500'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <main className="flex-1 md:ml-56 pt-12 md:pt-0 p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
