import { useState, useRef } from 'react';
import { Send, Twitter, Youtube, Share2, Clock, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../stores/useStore';

const CATEGORIES = ['All', 'Telegram', 'X', 'YouTube', 'Facebook'];
const CAT_ICONS = { Telegram: Send, X: Twitter, YouTube: Youtube, Facebook: Share2 };
const CAT_COLORS = { Telegram: '#0088cc', X: '#1da1f2', YouTube: '#ff0000', Facebook: '#1877f2' };

export default function TasksPage() {
  const { tasks, userData, submitClaim, addToast } = useStore();
  const [filter, setFilter] = useState('All');
  const [activeTask, setActiveTask] = useState(null);
  const [timer, setTimer] = useState(0);
  const [timerDone, setTimerDone] = useState(false);
  const [proofFile, setProofFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);

  const startTask = (task) => {
    if (userData?.completedTasks?.includes(task.id)) {
      addToast('Already completed', 'error');
      return;
    }
    setActiveTask(task);
    setTimerDone(false);
    setTimer(task.timer || 10);
    setProofFile(null);

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setTimerDone(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!proofFile || !activeTask) return;
    setSubmitting(true);
    try {
      await submitClaim(activeTask.id, proofFile);
      addToast('Task submitted! Awaiting approval.', 'success');
      setActiveTask(null);
    } catch (e) {
      addToast(e.message, 'error');
    }
    setSubmitting(false);
  };

  const close = () => {
    clearInterval(timerRef.current);
    setActiveTask(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${filter === cat ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-gray-400 border border-white/[0.08]'}`}>{cat}</button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(task => {
          const Icon = CAT_ICONS[task.category] || Send;
          const done = userData?.completedTasks?.includes(task.id);
          return (
            <div key={task.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: (CAT_COLORS[task.category] || '#8b5cf6') + '20' }}>
                  <Icon className="w-5 h-5" style={{ color: CAT_COLORS[task.category] || '#8b5cf6' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-emerald-400">৳{task.reward}</span>
                    <span className="text-[9px] text-gray-500">{task.claimedCount}/{task.targetLimit}</span>
                  </div>
                </div>
                <button
                  onClick={() => startTask(task)}
                  disabled={done}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-violet-600 text-white active:scale-95'}`}
                >
                  {done ? 'Done' : 'Claim'}
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-xs">No tasks found</div>
        )}
      </div>

      <AnimatePresence>
        {activeTask && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card rounded-2xl p-6 w-full max-w-sm relative">
              <button onClick={close} className="absolute top-3 right-3 text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>

              <h3 className="text-sm font-bold text-white mb-1">{activeTask.title}</h3>
              <p className="text-[10px] text-gray-400 mb-4">Reward: ৳{activeTask.reward} BDT</p>

              {!timerDone ? (
                <div className="text-center py-6">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray={`${(timer / (activeTask.timer || 10)) * 283} 283`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-black text-white">{timer}s</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">Complete the task while waiting...</p>
                  <a href={activeTask.url} target="_blank" rel="noreferrer" className="inline-block mt-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold">Open Task Link</a>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-emerald-400">Timer complete! Upload proof screenshot:</p>
                  <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setProofFile(e.target.files?.[0])} className="hidden" />
                  <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-gray-400 text-xs font-bold flex items-center justify-center gap-2 hover:border-violet-500/50 transition-all">
                    <Upload className="w-4 h-4" />
                    {proofFile ? proofFile.name : 'Choose Image'}
                  </button>
                  <button onClick={handleSubmit} disabled={!proofFile || submitting} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black disabled:opacity-40 active:scale-[0.98] transition-all">
                    {submitting ? 'Submitting...' : 'Submit Proof'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
