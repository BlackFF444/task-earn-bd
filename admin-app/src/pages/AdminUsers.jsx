import { useState } from 'react';
import { Search, Ban, CheckCircle, DollarSign, Shield, ShieldOff } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminUsers() {
  const { users, updateUserBalance, banUser, unbanUser, setUserRole, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBalanceUpdate = async (uid) => {
    const bal = parseFloat(newBalance);
    if (isNaN(bal)) { addToast('Invalid amount', 'error'); return; }
    try { await updateUserBalance(uid, bal); addToast('Balance updated', 'success'); setEditingUser(null); setNewBalance(''); } catch (e) { addToast(e.message, 'error'); }
  };

  const handleBan = async (uid, status) => {
    if (status === 'banned') {
      try { await unbanUser(uid); addToast('User unbanned', 'success'); } catch (e) { addToast(e.message, 'error'); }
    } else {
      if (!confirm('Ban this user?')) return;
      try { await banUser(uid); addToast('User banned', 'success'); } catch (e) { addToast(e.message, 'error'); }
    }
  };

  const handleRole = async (uid, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Set user role to ${newRole}?`)) return;
    try { await setUserRole(uid, newRole); addToast(`Role updated to ${newRole}`, 'success'); } catch (e) { addToast(e.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">User Control ({users.length})</h2>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="w-full py-2.5 pl-10 pr-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
      </div>

      <div className="space-y-2">
        {filtered.map(user => (
          <div key={user.uid || user.id} className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-400 text-xs font-bold">{(user.name || 'U')[0]}</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${user.status === 'banned' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{user.status}</span>
                  {user.role === 'admin' && <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400">admin</span>}
                </div>
                <p className="text-[9px] text-gray-500 truncate">{user.email}</p>
                <p className="text-[9px] text-gray-500">Balance: ৳{user.balance?.toFixed(2)} · Tasks: {user.completedTasks?.length || 0}</p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => { setEditingUser(user.uid || user.id); setNewBalance(user.balance?.toString() || '0'); }} className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400"><DollarSign className="w-3 h-3" /></button>
                <button onClick={() => handleRole(user.uid || user.id, user.role)} className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                  {user.role === 'admin' ? <ShieldOff className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                </button>
                <button onClick={() => handleBan(user.uid || user.id, user.status)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                  {user.status === 'banned' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {editingUser === (user.uid || user.id) && (
              <div className="mt-3 flex gap-2">
                <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none" />
                <button onClick={() => handleBalanceUpdate(user.uid || user.id)} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold active:scale-95">Set</button>
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-white/[0.05] text-gray-400 text-xs font-bold">Cancel</button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No users found</p>}
      </div>
    </div>
  );
}
