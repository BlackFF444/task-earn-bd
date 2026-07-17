import { useState } from 'react';
import { Plus, Trash2, Send, Twitter, Youtube, Share2 } from 'lucide-react';
import useStore from '../stores/useStore';

const CATEGORIES = ['Telegram', 'X', 'YouTube', 'Facebook'];

export default function AdminTasks() {
  const { tasks, addTask, deleteTask, addToast } = useStore();
  const [form, setForm] = useState({ title: '', reward: '', category: 'Telegram', timer: '10', targetLimit: '500', url: '' });
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title || !form.reward) { addToast('Fill all fields', 'error'); return; }
    setLoading(true);
    try {
      await addTask({ title: form.title, reward: parseFloat(form.reward), category: form.category, timer: parseInt(form.timer), targetLimit: parseInt(form.targetLimit), url: form.url });
      addToast('Task created!', 'success');
      setForm({ title: '', reward: '', category: 'Telegram', timer: '10', targetLimit: '500', url: '' });
    } catch (e) { addToast(e.message, 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); addToast('Task deleted', 'success'); } catch (e) { addToast(e.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Task Manager</h2>

      <form onSubmit={handleCreate} className="glass-card rounded-2xl p-4 space-y-3">
        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} placeholder="Reward (BDT)" className="py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          <input type="number" value={form.timer} onChange={e => setForm({ ...form, timer: e.target.value })} placeholder="Timer (seconds)" className="py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
        </div>
        <div className="flex gap-2">
          {CATEGORIES.map(c => (
            <button key={c} type="button" onClick={() => setForm({ ...form, category: c })} className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${form.category === c ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-gray-400 border border-white/[0.08]'}`}>{c}</button>
          ))}
        </div>
        <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="Task URL" className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
        <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black disabled:opacity-40 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {loading ? 'Creating...' : 'Create Task'}
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map(task => (
          <div key={task.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{task.title}</p>
              <p className="text-[9px] text-gray-500">{task.category} · ৳{task.reward} · {task.timer}s · {task.claimedCount}/{task.targetLimit}</p>
            </div>
            <button onClick={() => handleDelete(task.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
