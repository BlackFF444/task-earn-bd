import { useState } from 'react';
import { Plus, Trash2, Send, Twitter, Youtube, Share2, ExternalLink } from 'lucide-react';
import useStore from '../stores/useStore';

const CATEGORIES = ['Telegram', 'X', 'YouTube', 'Facebook'];
const CAT_ICONS = { Telegram: Send, X: Twitter, YouTube: Youtube, Facebook: Share2 };

export default function AdminTasks() {
  const { tasks, addTask, deleteTask, addToast } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', reward: '', category: 'Telegram', timer: '10', targetLimit: '100' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.url || !form.reward) { addToast('Fill all required fields', 'error'); return; }
    setLoading(true);
    try {
      await addTask({ title: form.title, url: form.url, reward: parseFloat(form.reward), category: form.category, timer: parseInt(form.timer) || 10, targetLimit: parseInt(form.targetLimit) || 100 });
      addToast('Task created!', 'success');
      setForm({ title: '', url: '', reward: '', category: 'Telegram', timer: '10', targetLimit: '100' });
      setShowForm(false);
    } catch (e) { addToast(e.message, 'error'); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try { await deleteTask(id); addToast('Task deleted', 'success'); } catch (e) { addToast(e.message, 'error'); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Tasks ({tasks.length})</h2>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold active:scale-95">
          <Plus className="w-3 h-3" /> Add Task
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-4 space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task title" className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="Task URL" className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          <div className="flex gap-2">
            <input type="number" value={form.reward} onChange={e => setForm({ ...form, reward: e.target.value })} placeholder="Reward (BDT)" className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
            <input type="number" value={form.timer} onChange={e => setForm({ ...form, timer: e.target.value })} placeholder="Timer (s)" className="w-24 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          </div>
          <div className="flex gap-2">
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="flex-1 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none">
              {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d0f1a]">{c}</option>)}
            </select>
            <input type="number" value={form.targetLimit} onChange={e => setForm({ ...form, targetLimit: e.target.value })} placeholder="Claim limit" className="w-28 py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-xs font-bold disabled:opacity-40 active:scale-95">{loading ? 'Creating...' : 'Create Task'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-gray-400 text-xs font-bold">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {tasks.map(task => {
          const Icon = CAT_ICONS[task.category] || Send;
          return (
            <div key={task.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-violet-500/10">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{task.title}</p>
                <p className="text-[9px] text-gray-500">{task.category} · ৳{task.reward} · {task.claimedCount || 0}/{task.targetLimit} claimed</p>
              </div>
              <div className="flex items-center gap-1">
                <a href={task.url} target="_blank" rel="noreferrer" className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><ExternalLink className="w-3 h-3" /></a>
                <button onClick={() => handleDelete(task.id)} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400"><Trash2 className="w-3 h-3" /></button>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No tasks yet. Create one above.</p>}
      </div>
    </div>
  );
}
