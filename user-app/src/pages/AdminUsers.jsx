import { useState } from 'react';
import { Search, Ban, DollarSign } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminUsers() {
  const { updateUserBalance, banUser, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState('');

  const handleSearch = async () => {
    if (!search.trim()) return;
    setLoading(true);
    try {
      const { firestoreService } = await import('../services/firestore');
      const users = await firestoreService.searchUsers(search);
      setResults(users);
    } catch (e) { addToast(e.message, 'error'); }
    setLoading(false);
  };

  const handleBalanceUpdate = async (uid) => {
    const bal = parseFloat(newBalance);
    if (isNaN(bal)) { addToast('Invalid amount', 'error'); return; }
    try { await updateUserBalance(uid, bal); addToast('Balance updated', 'success'); setEditingUser(null); setNewBalance(''); } catch (e) { addToast(e.message, 'error'); }
  };

  const handleBan = async (uid) => {
    if (!confirm('Ban this user?')) return;
    try { await banUser(uid); addToast('User banned', 'success'); } catch (e) { addToast(e.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">User Control</h2>

      <div className="flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Search users..." className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
        <button onClick={handleSearch} disabled={loading} className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1 active:scale-95 disabled:opacity-40">
          <Search className="w-3 h-3" /> {loading ? '...' : 'Search'}
        </button>
      </div>

      <div className="space-y-2">
        {results.map(user => (
          <div key={user.uid} className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3">
              <img src={user.photoURL || ''} alt="" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}</p>
                <p className="text-[9px] text-gray-500 truncate">{user.email}</p>
                <p className="text-[9px] text-gray-500">Balance: ৳{user.balance?.toFixed(2)} · Role: {user.role}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingUser(user.uid); setNewBalance(user.balance?.toString() || '0'); }} className="p-2 rounded-lg bg-violet-500/10 text-violet-400"><DollarSign className="w-3 h-3" /></button>
                <button onClick={() => handleBan(user.uid)} className="p-2 rounded-lg bg-red-500/10 text-red-400"><Ban className="w-3 h-3" /></button>
              </div>
            </div>

            {editingUser === user.uid && (
              <div className="mt-3 flex gap-2">
                <input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none" />
                <button onClick={() => handleBalanceUpdate(user.uid)} className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold">Set</button>
                <button onClick={() => setEditingUser(null)} className="px-4 py-2 rounded-xl bg-white/[0.05] text-gray-400 text-xs font-bold">Cancel</button>
              </div>
            )}
          </div>
        ))}
        {results.length === 0 && search && !loading && (
          <p className="text-xs text-gray-500 text-center py-4">No users found</p>
        )}
      </div>
    </div>
  );
}
