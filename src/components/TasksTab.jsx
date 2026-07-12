import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Check, Zap, Clock, AlertTriangle, ArrowRight,
  ExternalLink, Upload, ImagePlus, X, CheckCircle
} from 'lucide-react';
import { dbService, getMultiplier } from '../services/firebase';
import { useApp } from '../context/AppContext';

const Twitter = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const Facebook = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
  </svg>
);

const Youtube = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const getCategoryIcon = (category) => {
  switch (category.toLowerCase()) {
    case 'twitter': return <Twitter className="w-5 h-5 text-[#1da1f2]" />;
    case 'telegram': return <Send className="w-5 h-5 text-[#0088cc]" />;
    case 'youtube': return <Youtube className="w-5 h-5 text-[#ff0000]" />;
    case 'facebook': return <Facebook className="w-5 h-5 text-[#1877f2]" />;
    default: return <Zap className="w-5 h-5 text-indigo-400" />;
  }
};

// Proof Upload Modal Component
function ProofUploadModal({ task, onClose, onSubmit, userMultiplier }) {
  const [proofImage, setProofImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      return;
    }
    setProofImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!proofImage) return;
    setSubmitting(true);
    
    // Convert image to base64
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Image = e.target.result;
      // Simulate upload delay
      await new Promise(r => setTimeout(r, 800));
      onSubmit(task, base64Image);
      setSubmitting(false);
    };
    reader.readAsDataURL(proofImage);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-[320px] glass-card rounded-2xl p-5 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <ImagePlus className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white">Upload Proof</h3>
        </div>

        <p className="text-[10px] text-gray-400 mb-4 leading-relaxed">
          Upload a screenshot proving you completed: <span className="text-white font-semibold">{task.title}</span>
        </p>

        {/* Upload Area */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full h-36 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all mb-4 ${
            previewUrl
              ? 'border-emerald-500/40 bg-emerald-500/5'
              : 'border-violet-500/30 bg-violet-500/5 hover:border-violet-500/60 hover:bg-violet-500/10'
          }`}
        >
          {previewUrl ? (
            <img src={previewUrl} alt="proof" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-violet-400" />
              <span className="text-xs text-violet-300 font-semibold">Tap to select screenshot</span>
              <span className="text-[9px] text-gray-500">JPG, PNG, WebP supported</span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          onClick={handleSubmit}
          disabled={!proofImage || submitting}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold shadow-md shadow-violet-500/20 disabled:opacity-40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Submit Proof & Claim +${(task.reward * userMultiplier).toFixed(4)} USDT</span>
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}

function TasksTab({ user, tasks, refreshAppState }) {
  const { t, notify } = useApp();
  const [activeCategory, setActiveCategory] = useState('All');
  const [verifyingTaskId, setVerifyingTaskId] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [canClaimTaskId, setCanClaimTaskId] = useState(null);
  const [claimingTaskId, setClaimingTaskId] = useState(null);
  const [proofTaskId, setProofTaskId] = useState(null); // task that needs proof
  const [userPendingClaims, setUserPendingClaims] = useState([]);

  const timerRef = useRef(null);
  const userMultiplier = getMultiplier(user.referralCount);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const fetchPendingClaims = async () => {
      if (user) {
        const claims = await dbService.getUserPendingClaims(user.id);
        setUserPendingClaims(claims);
      }
    };
    fetchPendingClaims();
  }, [user]);

  const handleStartTask = (task) => {
    if (verifyingTaskId) {
      notify('Please finish verifying the current task first!', 'warning');
      return;
    }
    window.open(task.url, '_blank');
    setVerifyingTaskId(task.id);
    setTimeLeft(task.timer);
    setCanClaimTaskId(null);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setVerifyingTaskId(null);
          // Check if task requires proof
          if (task.requiresProof) {
            setProofTaskId(task.id);
          } else {
            setCanClaimTaskId(task.id);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClaimReward = async (task, proofImage = null) => {
    setClaimingTaskId(task.id);
    try {
      await dbService.claimTask(user.id, task.id, proofImage);
      await refreshAppState();
      setCanClaimTaskId(null);
      setProofTaskId(null);
      notify(`Task submitted for approval! Admin will review shortly. ⏳`, 'success');
    } catch (err) {
      notify(err.message || 'Claim failed.', 'error');
    } finally {
      setClaimingTaskId(null);
    }
  };

  const handleProofSubmit = (task, proofImage) => {
    setProofTaskId(null);
    handleClaimReward(task, proofImage);
  };

  const categories = ['All', 'Telegram', 'Twitter', 'YouTube', 'Facebook'];
  const filteredTasks = tasks.filter(task => {
    if (activeCategory === 'All') return true;
    return task.category.toLowerCase() === activeCategory.toLowerCase();
  });

  // Find the proof task object
  const proofTask = tasks.find(t => t.id === proofTaskId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-4"
    >
      {/* Proof Upload Modal */}
      <AnimatePresence>
        {proofTask && (
          <ProofUploadModal
            task={proofTask}
            onClose={() => { setProofTaskId(null); setCanClaimTaskId(proofTask.id); }}
            onSubmit={handleProofSubmit}
            userMultiplier={userMultiplier}
          />
        )}
      </AnimatePresence>

      {/* Page Title & Multiplier Banner */}
      <div className="p-1 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Micro Tasks</h2>
          <p className="text-xs text-gray-400">Complete tasks to earn instant crypto rewards.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 inline-block uppercase">
            x{userMultiplier.toFixed(1)} Active Boost
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`py-1.5 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
              activeCategory === cat
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 font-bold glow-purple'
                : 'bg-black/20 border-white/5 text-gray-400 hover:text-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-card p-8 rounded-2xl text-center text-gray-500 text-xs">
            No tasks found in this category. Check back later!
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isCompleted = user.completedTasks?.includes(task.id);
            const isPendingApproval = userPendingClaims.some(c => c.taskId === task.id);
            const isSoldOut = task.claimedCount >= task.targetLimit;
            const isVerifying = verifyingTaskId === task.id;
            const isReadyToClaim = canClaimTaskId === task.id;
            const isClaiming = claimingTaskId === task.id;
            const pct = isVerifying ? ((task.timer - timeLeft) / task.timer) * 100 : 0;
            const soldOutPct = Math.round((task.claimedCount / task.targetLimit) * 100);

            return (
              <div
                key={task.id}
                className={`glass-card p-4 rounded-2xl transition-all relative overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-500/20 opacity-75'
                    : isPendingApproval
                      ? 'border-amber-500/30 bg-amber-500/5'
                      : isReadyToClaim
                        ? 'border-emerald-500/50 bg-emerald-500/5 glow-green'
                        : 'hover:border-white/20'
                }`}
              >
                {/* Background verification bar */}
                {isVerifying && (
                  <div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${pct}%` }}
                  />
                )}

                {/* Proof required badge */}
                {task.requiresProof && !isCompleted && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[8px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded uppercase">
                      Proof Needed
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black/30 border border-white/5 flex items-center justify-center flex-shrink-0">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white max-w-[190px] leading-relaxed">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase">
                          {task.category}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {task.claimedCount}/{task.targetLimit}
                        </span>
                      </div>
                      {/* Mini fill bar */}
                      <div className="w-[110px] h-1 rounded-full bg-black/30 mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${soldOutPct >= 90 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          style={{ width: `${soldOutPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-right flex flex-col items-end justify-between self-stretch">
                    <div>
                      <span className="text-xs font-extrabold text-emerald-400">
                        +${(task.reward * userMultiplier).toFixed(3)}
                      </span>
                      <span className="text-[8px] text-gray-500 block uppercase font-bold tracking-wider">USDT</span>
                    </div>

                    <div className="mt-2">
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                          <Check className="w-3.5 h-3.5" />
                          <span>{t('claimed')}</span>
                        </div>
                      ) : isPendingApproval ? (
                        <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20">
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Pending Approval</span>
                        </div>
                      ) : isSoldOut ? (
                        <div className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                          {t('soldOut')}
                        </div>
                      ) : isVerifying ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-violet-300 font-bold bg-violet-500/10 px-2.5 py-1 rounded-xl border border-violet-500/20">
                          <Clock className="w-3.5 h-3.5 animate-spin" />
                          <span>{timeLeft}s</span>
                        </div>
                      ) : isReadyToClaim ? (
                        <button
                          onClick={() => handleClaimReward(task)}
                          disabled={isClaiming}
                          className="text-[10px] font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 py-1.5 px-4 rounded-xl shadow-md shadow-emerald-500/20 active:scale-95 transition-transform flex items-center gap-1 glow-green"
                        >
                          {isClaiming ? (
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <><span>{t('claimReward')}</span><ArrowRight className="w-3 h-3" /></>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStartTask(task)}
                          disabled={verifyingTaskId !== null}
                          className={`text-[10px] font-bold text-white py-1.5 px-4 rounded-xl flex items-center gap-1 transition-all ${
                            verifyingTaskId !== null
                              ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                              : 'bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-md shadow-violet-500/10 active:scale-95'
                          }`}
                        >
                          <span>Start</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {isVerifying && (
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[9px] text-gray-400">
                    <AlertTriangle className="w-3 h-3 text-violet-400" />
                    <span>Keep link open. Reward unlocks in {timeLeft}s. Do not close browser tab.</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}

export default TasksTab;
