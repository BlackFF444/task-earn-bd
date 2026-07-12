import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Plus, Trash2, Check, X, Users,
  CheckSquare, DollarSign, Wrench, RefreshCw, BarChart2,
  Send, Activity, ArrowUpRight, ArrowDownRight,
  AlertCircle, Megaphone, PieChart
} from 'lucide-react';
import { dbService } from '../services/firebase';
import { telegramService } from '../services/telegram';
import { useApp } from '../context/AppContext';

// Mini sparkline chart
function Sparkline({ values, color = '#a855f7' }) {
  if (!values || values.length < 2) return null;
  const max = Math.max(...values, 1);
  const w = 80, h = 30;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} className="opacity-70">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Stat card with sparkline
function StatCard({ icon, label, value, subValue, trend, color, sparkData }) {
  const trendUp = trend >= 0;
  return (
    <div className="glass-card p-3 rounded-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {sparkData && <Sparkline values={sparkData} color={trendUp ? '#10b981' : '#f43f5e'} />}
      </div>
      <div className="text-lg font-black text-white">{value}</div>
      {subValue && <div className="text-[9px] text-gray-500 mt-0.5">{subValue}</div>}
      <div className="text-[9px] text-gray-400 mt-1 flex items-center gap-1">
        {trendUp
          ? <ArrowUpRight className="w-3 h-3 text-emerald-400" />
          : <ArrowDownRight className="w-3 h-3 text-rose-400" />
        }
        <span className={trendUp ? 'text-emerald-400' : 'text-rose-400'}>
          {trendUp ? '+' : ''}{trend}%
        </span>
        <span className="text-gray-500 ml-0.5">{label}</span>
      </div>
    </div>
  );
}

function AdminTab({ user, tasks, withdrawals, pendingTaskClaims, globalStats, refreshAppState }) {
  const { t, notify, addAnnouncement } = useApp();

  // Auth
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Active admin section
  const [adminSection, setAdminSection] = useState('analytics');

  // Task form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Telegram');
  const [url, setUrl] = useState('');
  const [reward, setReward] = useState('');
  const [timer, setTimer] = useState('10');
  const [targetLimit, setTargetLimit] = useState('500');
  const [requiresProof, setRequiresProof] = useState(false);
  const [addingTask, setAddingTask] = useState(false);

  // Tester
  const [testBalance, setTestBalance] = useState(user.balance.toString());
  const [testReferrals, setTestReferrals] = useState(user.referralCount.toString());

  // Announcements
  const [annMessage, setAnnMessage] = useState('');
  const [sendingAnn, setSendingAnn] = useState(false);

  // Claims filter
  const [claimsFilter, setClaimsFilter] = useState('Pending');

  const handleVerifyPassword = (e) => {
    e.preventDefault();
    setAuthError('');
    if (passwordInput === 'FAHIM2020') {
      setIsAuthorized(true);
    } else {
      setAuthError('Incorrect Access Password! Access Denied.');
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setAddingTask(true);
    try {
      const taskData = {
        title, category, url,
        reward: parseFloat(reward),
        timer: parseInt(timer),
        targetLimit: parseInt(targetLimit),
        requiresProof,
      };
      if (isNaN(taskData.reward) || isNaN(taskData.timer) || isNaN(taskData.targetLimit)) {
        notify('Please enter valid numeric values.', 'error');
        return;
      }
      await dbService.addTask(taskData);
      await refreshAppState();
      setTitle(''); setUrl(''); setReward(''); setTimer('10'); setTargetLimit('500'); setRequiresProof(false);
      notify('Task created successfully! 🎯', 'success');
    } catch (err) {
      notify('Error adding task: ' + err.message, 'error');
    } finally {
      setAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = telegramService.isTelegramWebApp()
      ? await telegramService.showConfirm('Delete this task?')
      : window.confirm('Delete this task?');
    if (!confirmed) return;
    try {
      await dbService.deleteTask(taskId);
      await refreshAppState();
      notify('Task deleted.', 'info');
    } catch (err) {
      notify('Delete failed: ' + err.message, 'error');
    }
  };

  const handleApprovePayout = async (wdId) => {
    try {
      await dbService.approveWithdrawal(wdId);
      await refreshAppState();
      notify('Withdrawal approved! ✅', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleRejectPayout = async (wdId) => {
    try {
      await dbService.rejectWithdrawal(wdId);
      await refreshAppState();
      notify('Withdrawal rejected. Balance refunded.', 'warning');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleApproveTaskClaim = async (claimId) => {
    try {
      await dbService.approveTaskClaim(claimId);
      await refreshAppState();
      notify('Task claim approved! Reward credited. ✅', 'success');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleRejectTaskClaim = async (claimId) => {
    try {
      await dbService.rejectTaskClaim(claimId);
      await refreshAppState();
      notify('Task claim rejected.', 'warning');
    } catch (err) {
      notify(err.message, 'error');
    }
  };

  const handleApplyTesterChanges = async () => {
    const newBal = parseFloat(testBalance);
    const newRefs = parseInt(testReferrals);
    if (isNaN(newBal) || isNaN(newRefs)) {
      notify('Please enter valid inputs.', 'error');
      return;
    }
    try {
      await dbService.testerUpdateUser(user.id, { balance: newBal, referralCount: newRefs });
      await refreshAppState();
      notify('Session values updated!', 'success');
    } catch (err) {
      notify('Error updating: ' + err.message, 'error');
    }
  };

  const handleResetStreakLock = async () => {
    try {
      await dbService.testerUpdateUser(user.id, { lastCheckIn: null });
      await refreshAppState();
      notify('Streak lock removed! Go claim on Home. 🔥', 'success');
    } catch (err) {
      notify('Error resetting: ' + err.message, 'error');
    }
  };

  const handleSendAnnouncement = async () => {
    if (!annMessage.trim()) {
      notify('Please type a message first.', 'warning');
      return;
    }
    setSendingAnn(true);
    await new Promise(r => setTimeout(r, 600));
    addAnnouncement(annMessage.trim(), 'Admin');
    setAnnMessage('');
    setSendingAnn(false);
    notify('Announcement sent to all users! 📢', 'success');
  };

  // Analytics derived stats
  const pendingRequests = withdrawals.filter(w => w.status === 'Pending');
  const filteredClaims = claimsFilter === 'All'
    ? pendingTaskClaims
    : pendingTaskClaims.filter(c => c.status === claimsFilter);
  const pendingTaskClaimsList = pendingTaskClaims.filter(c => c.status === 'Pending');
  const approvedWithdrawals = withdrawals.filter(w => w.status === 'Approved');
  const totalApprovedAmount = approvedWithdrawals.reduce((s, w) => s + w.amount, 0);

  // Fake sparkline data for analytics
  const userSparkData = [3, 5, 4, 7, 9, 8, globalStats.totalUsers];
  const earningSparkData = [0.5, 1.2, 0.8, 2.1, 1.5, 2.8, globalStats.totalUSDT];
  const taskSparkData = [10, 15, 12, 20, 25, 22, globalStats.completedTasks];

  // Gateway breakdown
  const gatewayBreakdown = useMemo(() => {
    const map = {};
    withdrawals.forEach(w => {
      map[w.gateway] = (map[w.gateway] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [withdrawals]);

  if (!isAuthorized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        className="flex flex-col items-center justify-center py-10"
      >
        <div className="w-full max-w-sm glass-card p-6 rounded-2xl relative overflow-hidden glow-purple">
          <div className="absolute right-0 top-0 w-20 h-20 rounded-full bg-pink-500/10 blur-xl -z-10" />
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-3">
              <Settings className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-base font-bold text-white">Admin Access Portal</h3>
            <p className="text-[11px] text-gray-400 mt-1">Enter access password to unlock admin functions</p>
          </div>
          <form onSubmit={handleVerifyPassword} className="space-y-4">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5 text-left">Access Password</label>
              <input
                type="password" placeholder="••••••••"
                value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full py-2.5 px-3 glass-input text-xs font-semibold tracking-widest text-center"
                autoFocus required
              />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white text-xs font-extrabold shadow-md shadow-pink-500/10 active:scale-[0.98] transition-all">
              Unlock Control Panel
            </button>
            {authError && (
              <p className="text-[10px] text-rose-400 text-center font-bold bg-rose-500/10 p-2 rounded-xl border border-rose-500/20">{authError}</p>
            )}
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="p-1 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-pink-400" />
            <span>{t('adminPanel')}</span>
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Manage tasks, payouts, analytics, and broadcast messages.</p>
        </div>
        <button
          onClick={() => { setIsAuthorized(false); setPasswordInput(''); }}
          className="p-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] font-bold hover:bg-pink-500/20 active:scale-95 transition-all"
        >
          Lock Panel
        </button>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-1.5 flex-wrap">
        {[
          { key: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-3 h-3" /> },
          { key: 'taskApprovals', label: 'Task Approvals', icon: <CheckSquare className="w-3 h-3" />, badge: pendingTaskClaimsList.length },
          { key: 'payouts', label: 'Payouts', icon: <DollarSign className="w-3 h-3" />, badge: pendingRequests.length },
          { key: 'announcements', label: 'Broadcast', icon: <Megaphone className="w-3 h-3" /> },
          { key: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-3 h-3" /> },
          { key: 'tester', label: 'Tester', icon: <Wrench className="w-3 h-3" /> },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setAdminSection(s.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all relative ${
              adminSection === s.key
                ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                : 'bg-black/20 border-white/5 text-gray-400 hover:text-gray-200'
            }`}
          >
            {s.icon}
            {s.label}
            {s.badge > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[7px] font-black flex items-center justify-center">
                {s.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── ANALYTICS ── */}
      {adminSection === 'analytics' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-pink-400" />
            {t('analytics')}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Users className="w-4 h-4 text-violet-400" />}
              label="this week"
              value={globalStats.totalUsers}
              subValue="Registered users"
              trend={12}
              color="bg-violet-500/10"
              sparkData={userSparkData}
            />
            <StatCard
              icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
              label="vs last week"
              value={`$${globalStats.totalUSDT.toFixed(2)}`}
              subValue="Total distributed USDT"
              trend={8}
              color="bg-emerald-500/10"
              sparkData={earningSparkData}
            />
            <StatCard
              icon={<CheckSquare className="w-4 h-4 text-indigo-400" />}
              label="this week"
              value={globalStats.completedTasks}
              subValue="Tasks completed"
              trend={25}
              color="bg-indigo-500/10"
              sparkData={taskSparkData}
            />
            <StatCard
              icon={<AlertCircle className="w-4 h-4 text-amber-400" />}
              label="pending"
              value={pendingTaskClaimsList.length}
              subValue="Task claims awaiting review"
              trend={pendingTaskClaimsList.length > 0 ? -5 : 0}
              color="bg-amber-500/10"
            />
          </div>

          {/* Withdrawal breakdown by gateway */}
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="w-4 h-4 text-pink-400" />
              <h4 className="text-xs font-bold text-white">Withdrawal Gateway Breakdown</h4>
            </div>
            {gatewayBreakdown.length === 0 ? (
              <p className="text-[10px] text-gray-500 text-center py-2">No withdrawal data yet.</p>
            ) : (
              <div className="space-y-2">
                {gatewayBreakdown.map(([gw, count]) => {
                  const total = withdrawals.length;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={gw}>
                      <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                        <span className="font-semibold text-white">{gw}</span>
                        <span>{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Approved vs Pending */}
          <div className="grid grid-cols-3 gap-2">
            <div className="glass-card p-3 rounded-xl text-center">
              <span className="text-[8px] text-gray-500 block uppercase font-bold mb-0.5">Approved</span>
              <span className="text-sm font-black text-emerald-400">{approvedWithdrawals.length}</span>
            </div>
            <div className="glass-card p-3 rounded-xl text-center">
              <span className="text-[8px] text-gray-500 block uppercase font-bold mb-0.5">Pending</span>
              <span className="text-sm font-black text-amber-400">{pendingRequests.length}</span>
            </div>
            <div className="glass-card p-3 rounded-xl text-center">
              <span className="text-[8px] text-gray-500 block uppercase font-bold mb-0.5">Paid Out</span>
              <span className="text-sm font-black text-white">${totalApprovedAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TASK APPROVALS ── */}
      {adminSection === 'taskApprovals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Task Claims ({filteredClaims.length})</h3>
            <div className="flex gap-1">
              {['All', 'Pending', 'Approved', 'Rejected'].map(f => (
                <button
                  key={f}
                  onClick={() => setClaimsFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all ${
                    claimsFilter === f
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-300'
                      : 'bg-black/20 border-white/5 text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
            {filteredClaims.length === 0 ? (
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-xl text-center text-xs text-gray-500">
                No {claimsFilter === 'All' ? '' : claimsFilter.toLowerCase()} task claims found.
              </div>
            ) : (
              filteredClaims.map((claim) => (
                <div key={claim.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex flex-col gap-3 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <img
                        src={claim.userPhoto}
                        alt={claim.userName}
                        className="w-9 h-9 rounded-full border border-violet-500/30 object-cover bg-slate-800 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{claim.userName}</span>
                          <span className="text-[8px] text-gray-400 font-bold bg-white/5 px-1.5 py-0.2 rounded uppercase">{claim.taskCategory}</span>
                          <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${
                            claim.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' :
                            claim.status === 'Rejected' ? 'bg-rose-500/20 text-rose-400' :
                            'bg-amber-500/20 text-amber-400'
                          }`}>{claim.status}</span>
                        </div>
                        <p className="text-[10px] text-gray-300 mt-0.5 max-w-[200px] truncate">{claim.taskTitle}</p>
                        <p className="text-[10px] font-extrabold text-emerald-400 mt-1">
                          Reward: ${claim.earnedAmount.toFixed(4)} USDT (x{claim.multiplier.toFixed(1)} boost)
                        </p>
                        <p className="text-[8px] text-gray-600 mt-0.5">{new Date(claim.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    {claim.status === 'Pending' && (
                      <div className="flex flex-col gap-1.5">
                        <button onClick={() => handleApproveTaskClaim(claim.id)} className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg active:scale-95 transition-all">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRejectTaskClaim(claim.id)} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg active:scale-95 transition-all">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  {claim.proofImage && (
                    <div className="mt-1">
                      <p className="text-[9px] text-gray-400 font-bold mb-1.5 uppercase">Proof Screenshot:</p>
                      <img
                        src={claim.proofImage}
                        alt="Task Proof"
                        className="w-full max-h-[180px] object-cover rounded-lg border border-white/10 cursor-pointer hover:border-violet-500/40 transition-all"
                        onClick={() => window.open(claim.proofImage, '_blank')}
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── PAYOUTS ── */}
      {adminSection === 'payouts' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">Withdrawal Approvals ({pendingRequests.length} pending)</h3>
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
            {pendingRequests.length === 0 ? (
              <div className="p-8 bg-white/[0.02] border border-white/5 rounded-xl text-center text-xs text-gray-500">
                No pending payout requests.
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div key={req.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{req.userName}</span>
                      <span className="text-[8px] text-gray-400 font-bold bg-white/5 px-1.5 py-0.2 rounded uppercase">{req.gateway}</span>
                    </div>
                    <p className="text-[10px] font-extrabold text-emerald-400 mt-1">Amount: ${req.amount.toFixed(2)} USDT</p>
                    <p className="text-[9px] text-gray-500 truncate max-w-[210px] mt-0.5">Address: {req.walletAddress}</p>
                    <p className="text-[8px] text-gray-600 mt-0.5">{new Date(req.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <button onClick={() => handleApprovePayout(req.id)} className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg active:scale-95 transition-all">
                      <Check className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleRejectPayout(req.id)} className="p-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 rounded-lg active:scale-95 transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ── ANNOUNCEMENTS ── */}
      {adminSection === 'announcements' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-pink-400" />
              <h3 className="text-sm font-bold text-white">{t('announcements')}</h3>
            </div>
            <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
              Send a broadcast message visible to all users in the Home tab notification bell.
            </p>
            <textarea
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder={t('announcementPlaceholder')}
              rows={4}
              className="w-full py-2.5 px-3 glass-input text-xs font-semibold resize-none leading-relaxed"
            />
            <button
              onClick={handleSendAnnouncement}
              disabled={sendingAnn || !annMessage.trim()}
              className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 text-white text-xs font-bold shadow-md shadow-pink-500/10 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sendingAnn ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Send className="w-4 h-4" /><span>{t('sendAnnouncement')}</span></>
              )}
            </button>
          </div>
          <div className="glass-card p-4 rounded-2xl">
            <h4 className="text-xs font-bold text-white mb-3">Announcement Tips</h4>
            <div className="space-y-2">
              {[
                '📢 Use clear, concise language',
                '🎁 Announce new tasks, events, or bonuses',
                '⚠️ Send maintenance or downtime notices',
                '🔥 Motivate users with earnings milestones',
              ].map((tip, i) => (
                <div key={i} className="text-[10px] text-gray-400 bg-black/20 p-2 rounded-lg border border-white/5">{tip}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TASKS ── */}
      {adminSection === 'tasks' && (
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3">{t('taskCreator')}</h3>
            <form onSubmit={handleAddTask} className="space-y-3 mb-5 pb-5 border-b border-white/5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Task Title</label>
                  <input type="text" placeholder="e.g. Join our Telegram Channel"
                    value={title} onChange={(e) => setTitle(e.target.value)}
                    className="w-full py-2 px-3 glass-input text-xs font-semibold" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Social Link (URL)</label>
                  <input type="url" placeholder="https://..."
                    value={url} onChange={(e) => setUrl(e.target.value)}
                    className="w-full py-2 px-3 glass-input text-xs font-semibold" required />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <div className="col-span-2">
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Category</label>
                  <select
                    value={category} onChange={(e) => setCategory(e.target.value)}
                    className="w-full py-2 px-3 bg-black/40 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-semibold"
                  >
                    <option value="Telegram">Telegram</option>
                    <option value="Twitter">Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Reward</label>
                  <input type="number" step="0.001" placeholder="0.05"
                    value={reward} onChange={(e) => setReward(e.target.value)}
                    className="w-full py-2 px-2 glass-input text-xs font-semibold" required />
                </div>
                <div>
                  <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Timer(s)</label>
                  <input type="number" placeholder="10"
                    value={timer} onChange={(e) => setTimer(e.target.value)}
                    className="w-full py-2 px-2 glass-input text-xs font-semibold" required />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Target Limit (Users)</label>
                <input type="number" placeholder="500"
                  value={targetLimit} onChange={(e) => setTargetLimit(e.target.value)}
                  className="w-full py-2 px-3 glass-input text-xs font-semibold" required />
              </div>
              {/* Proof required toggle */}
              <div className="flex items-center gap-3 p-2.5 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                <button
                  type="button"
                  onClick={() => setRequiresProof(!requiresProof)}
                  className={`w-10 h-5 rounded-full border transition-all relative flex-shrink-0 ${
                    requiresProof ? 'bg-amber-500/40 border-amber-500/60' : 'bg-black/40 border-white/10'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${requiresProof ? 'left-5' : 'left-0.5'}`} />
                </button>
                <div>
                  <p className="text-[10px] font-bold text-white">Require Screenshot Proof</p>
                  <p className="text-[8px] text-gray-500">Users must upload a proof image before claiming reward</p>
                </div>
              </div>
              <button
                type="submit" disabled={addingTask}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>{addingTask ? 'Creating...' : 'Create Micro Task'}</span>
              </button>
            </form>

            <h4 className="text-xs font-bold text-white mb-2.5">Existing Tasks ({tasks.length})</h4>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
              {tasks.map((task) => (
                <div key={task.id} className="p-2.5 bg-black/20 border border-white/5 rounded-xl flex items-center justify-between text-xs gap-3">
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-semibold text-white block truncate max-w-[170px]">{task.title}</span>
                      {task.requiresProof && (
                        <span className="text-[7px] bg-amber-500/20 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded flex-shrink-0">PROOF</span>
                      )}
                    </div>
                    <span className="text-[9px] text-gray-400">
                      ${task.reward.toFixed(3)} | {task.timer}s | {task.claimedCount}/{task.targetLimit}
                    </span>
                  </div>
                  <button onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/20 rounded-lg active:scale-95 transition-all flex-shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TESTER ── */}
      {adminSection === 'tester' && (
        <div className="glass-card p-4 rounded-2xl border-pink-500/20 bg-pink-500/[0.02]">
          <div className="flex items-center gap-2 mb-3">
            <Wrench className="w-4 h-4 text-pink-400" />
            <h3 className="text-sm font-bold text-white">User Session Tester (Sandbox)</h3>
          </div>
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Set USDT Balance</label>
                <input type="number" step="0.01"
                  value={testBalance} onChange={(e) => setTestBalance(e.target.value)}
                  className="w-full py-2 px-3 glass-input text-xs font-semibold" />
              </div>
              <div>
                <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Set Referrals Count</label>
                <input type="number"
                  value={testReferrals} onChange={(e) => setTestReferrals(e.target.value)}
                  className="w-full py-2 px-3 glass-input text-xs font-semibold" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleApplyTesterChanges}
                className="flex-1 py-2 px-3 rounded-xl bg-pink-600/20 border border-pink-500/30 hover:bg-pink-600/35 text-pink-300 text-[10px] font-bold active:scale-[0.98] transition-all">
                Apply Balance & Ref Count
              </button>
              <button onClick={handleResetStreakLock}
                className="py-2 px-3 rounded-xl bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/35 text-violet-300 text-[10px] font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1">
                <RefreshCw className="w-3 h-3" />
                Reset Streak
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default AdminTab;
