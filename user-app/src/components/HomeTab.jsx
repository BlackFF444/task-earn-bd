import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2, TrendingUp, CheckSquare, Calendar, Flame,
  Star, Share2, Copy, Check, Users, Info, Zap, Bell
} from 'lucide-react';
import { dbService, getMultiplier, getVIPLevelName } from '../services/firebase';
import { useApp } from '../context/AppContext';

  const STREAK_REWARDS = [0.5, 1, 1.5, 2, 2.5, 3.5, 5];

// Simple mini bar chart component
function MiniBarChart({ data, color = '#a855f7' }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => d.value), 0.001);
  return (
    <div className="flex items-end gap-1 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <div
            className="w-full rounded-t-sm transition-all duration-500"
            style={{
              height: `${Math.max((d.value / max) * 56, 2)}px`,
              background: `linear-gradient(to top, ${color}90, ${color}40)`,
              border: `1px solid ${color}50`,
            }}
          />
          <span className="text-[7px] text-gray-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function HomeTab({ user, refreshAppState, tasks }) {
  const { t, notify, announcements, markAnnouncementRead, markAllRead, unreadCount } = useApp();

  const [checkingIn, setCheckingIn] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [activeSection, setActiveSection] = useState('home'); // 'home' | 'stats' | 'referral'

  // Stats data
  const [earningsData] = useState(() => {
    // Generate last 7 days of simulated earnings data
    const today = new Date().getDay(); // 0=Sun
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return Array.from({ length: 7 }, (_, i) => {
      const dayIdx = (today - 6 + i + 7) % 7;
      return {
        label: dayNames[dayIdx].slice(0, 1),
        value: i === 6 ? user.balance * 0.3 : Math.random() * 0.08,
      };
    });
  });

  // Streak countdown
  useEffect(() => {
    if (!user || !user.lastCheckIn) return;
    const updateCountdown = () => {
      const lastCheckInTime = new Date(user.lastCheckIn).getTime();
      const nextAvailableTime = lastCheckInTime + 24 * 60 * 60 * 1000;
      const diff = nextAvailableTime - Date.now();
      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining(
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      } else {
        setTimeRemaining('');
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleCheckIn = async () => {
    setCheckingIn(true);
    try {
      const result = await dbService.claimStreak(user.id);
      await refreshAppState();
      notify(
        result.isStreakBroken
          ? `Streak reset! Day 1 reward: ৳${result.reward} BDT! 🔥`
          : `Day ${result.streakCount} claimed! Got ৳${result.reward} BDT! 🎉`,
        'success'
      );
    } catch (err) {
      notify(err.message || 'Check-in failed.', 'error');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCopyReferral = () => {
    const link = `https://t.me/taskearnbd69_bot?start=${user.referralCode}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = link;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      });
    } else {
      const ta = document.createElement('textarea');
      ta.value = link;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    notify('Referral link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareReferral = () => {
    const link = `https://t.me/taskearnbd69_bot?start=${user.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: 'Task Earn BD', text: 'Join Task Earn BD and earn BDT!', url: link }).catch(() => {});
    } else {
      navigator.clipboard.writeText(link).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {});
    }
  };

  const multiplier = getMultiplier(user.referralCount);
  const vipName = getVIPLevelName(user.referralCount);
  const completedTasksCount = user.completedTasks?.length || 0;
  const taskProgress = tasks.length > 0 ? (completedTasksCount / tasks.length) * 100 : 0;
  const alreadyCheckedInToday = timeRemaining !== '';

  // Referral tier
  let nextTierRefNeed = 0, nextTierName = '';
  if (user.referralCount < 5) { nextTierRefNeed = 5 - user.referralCount; nextTierName = 'Gold Club (x1.5)'; }
  else if (user.referralCount < 15) { nextTierRefNeed = 15 - user.referralCount; nextTierName = 'Platinum VIP (x2.0)'; }

  const referralLink = `https://t.me/taskearnbd69_bot?start=${user.referralCode}`;
  const commissionEarned = (user.referralCount * 5).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-4"
    >
      {/* Welcome Banner + Section Switcher */}
      <div className="flex items-center justify-between p-1">
        <div>
          <h2 className="text-xl font-bold text-white">{t('hello')}, {user.name.split(' ')[0]} 👋</h2>
          <p className="text-xs text-gray-400">{t('welcomeBack')}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          <button
            onClick={() => setShowAnnouncements(!showAnnouncements)}
            className="relative w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center active:scale-95 transition-all"
          >
            <Bell className="w-4 h-4 text-indigo-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[8px] font-black flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {/* VIP Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Zap className="w-3 h-3 text-indigo-400 fill-indigo-400/30" />
            <span className="text-[9px] font-bold text-indigo-300 uppercase tracking-wide">x{multiplier.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Announcements Panel */}
      <AnimatePresence>
        {showAnnouncements && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5" />
                  Admin Announcements
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[9px] text-gray-400 hover:text-white transition-colors">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {announcements.length === 0 ? (
                  <p className="text-[10px] text-gray-500 text-center py-3">No announcements yet.</p>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann.id}
                      onClick={() => markAnnouncementRead(ann.id)}
                      className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                        ann.read
                          ? 'bg-black/20 border border-white/5 text-gray-400'
                          : 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-200'
                      }`}
                    >
                      <p className="font-semibold">{ann.message}</p>
                      <p className="text-[8px] text-gray-500 mt-1">
                        From {ann.author} · {new Date(ann.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sub-navigation pills */}
      <div className="flex gap-2">
        {[
          { key: 'home', label: 'Overview', icon: <Flame className="w-3 h-3" /> },
          { key: 'stats', label: t('myStats'), icon: <BarChart2 className="w-3 h-3" /> },
          { key: 'referral', label: 'Referral', icon: <Users className="w-3 h-3" /> },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
              activeSection === s.key
                ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                : 'bg-black/20 border-white/5 text-gray-400 hover:text-gray-200'
            }`}
          >
            {s.icon}
            {s.label}
          </button>
        ))}
      </div>

      {/* ── SECTION: OVERVIEW ── */}
      {activeSection === 'home' && (
        <>
          {/* VIP & Multiplier Card */}
          <div className="glass-card p-4 rounded-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-violet-600/10 blur-xl -z-10" />
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center shadow-lg glow-purple">
                <Zap className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{vipName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Referral-based reward booster</p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Multiplier level:</span>
                <span className="font-bold text-white">x{multiplier.toFixed(1)} Earnings</span>
              </div>
              {nextTierRefNeed > 0 ? (
                <div>
                  <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                    <span>Next: {nextTierName}</span>
                    <span>{user.referralCount} / {user.referralCount < 5 ? 5 : 15}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
                      style={{ width: `${(user.referralCount / (user.referralCount < 5 ? 5 : 15)) * 100}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-indigo-400 mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3 flex-shrink-0" />
                    Invite {nextTierRefNeed} more to unlock x{user.referralCount < 5 ? '1.5' : '2.0'}!
                  </p>
                </div>
              ) : (
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Maximum multiplier (Platinum VIP) unlocked!
                </p>
              )}
            </div>
          </div>

          {/* Streak Check-In Card */}
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">{t('dailyStreak')}</h3>
              </div>
              <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                {user.streakCount} {t('dayStreak')}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 mb-4">
              {STREAK_REWARDS.map((reward, idx) => {
                const dayNum = idx + 1;
                const isCompleted = dayNum <= user.streakCount;
                const isNextToClaim = !alreadyCheckedInToday && (
                  (user.streakCount === 0 && dayNum === 1) ||
                  (user.streakCount > 0 && dayNum === (user.streakCount % 7) + 1)
                );
                const isLocked = dayNum > user.streakCount && !isNextToClaim;
                return (
                  <div
                    key={idx}
                    className={`relative rounded-xl py-2.5 flex flex-col items-center justify-between border text-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : isNextToClaim
                          ? 'bg-violet-500/20 border-violet-500/50 text-violet-300 scale-105 shadow-md shadow-violet-500/10 glow-purple animate-pulse'
                          : 'bg-black/20 border-white/5 text-gray-500'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider block mb-1">D{dayNum}</span>
                    <div className="my-1.5 flex items-center justify-center">
                      {isCompleted ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                        </div>
                      ) : isLocked ? (
                        <span className="text-gray-600 text-xs">🔒</span>
                      ) : (
                        <Zap className="w-4 h-4 text-violet-400 fill-violet-400/20" />
                      )}
                    </div>
                    <span className="text-[8px] font-bold mt-1 text-gray-300">৳{reward.toFixed(3)}</span>
                  </div>
                );
              })}
            </div>
            {alreadyCheckedInToday ? (
              <button disabled className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-400 flex items-center justify-center gap-2 cursor-not-allowed">
                <span>{t('nextReward')}:</span>
                <span className="font-mono text-violet-400 font-bold bg-black/30 px-2 py-0.5 rounded border border-white/5">{timeRemaining}</span>
              </button>
            ) : (
              <button
                onClick={handleCheckIn}
                disabled={checkingIn}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-xs font-bold shadow-lg shadow-violet-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                {checkingIn ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>{t('claimDay')} {(user.streakCount % 7) + 1} {t('streakReward')}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Task Progress */}
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-white">{t('yourTaskProgress')}</h3>
              </div>
              <span className="text-[10px] text-gray-400 font-semibold">{completedTasksCount} / {tasks.length} {t('completed')}</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-black/40 overflow-hidden relative border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 ease-out glow-purple"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2.5 text-[10px] text-gray-400">
              <span>Overall platform completeness</span>
              <span className="text-violet-300 font-bold">{Math.round(taskProgress)}% {t('completed')}</span>
            </div>
          </div>
        </>
      )}

      {/* ── SECTION: PERSONAL STATS ── */}
      {activeSection === 'stats' && (
        <div className="space-y-4">
          {/* Balance Card */}
          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">{t('earningsGraph')}</h3>
            </div>
            <div className="mb-2">
              <span className="text-2xl font-black text-white">৳{user.balance.toFixed(2)}</span>
              <span className="text-xs text-gray-400 ml-2">BDT Total</span>
            </div>
            <MiniBarChart data={earningsData} color="#a855f7" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('taskHistory')}</span>
              </div>
              <span className="text-xl font-black text-white">{completedTasksCount}</span>
              <p className="text-[9px] text-gray-500 mt-0.5">Tasks completed</p>
            </div>
            <div className="glass-card p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t('streakCalendar')}</span>
              </div>
              <span className="text-xl font-black text-white">{user.streakCount}</span>
              <p className="text-[9px] text-gray-500 mt-0.5">Days streak</p>
            </div>
            <div className="glass-card p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Referrals</span>
              </div>
              <span className="text-xl font-black text-white">{user.referralCount}</span>
              <p className="text-[9px] text-gray-500 mt-0.5">Friends invited</p>
            </div>
            <div className="glass-card p-3.5 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">VIP Level</span>
              </div>
              <span className="text-sm font-black text-white leading-tight">{vipName}</span>
              <p className="text-[9px] text-gray-500 mt-0.5">x{multiplier} multiplier</p>
            </div>
          </div>

          {/* Streak Calendar - last 7 days heatmap */}
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">{t('streakCalendar')}</h3>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }, (_, i) => {
                const dayActive = i < (user.streakCount % 7 || (user.streakCount >= 7 ? 7 : user.streakCount));
                const dayNames = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className={`w-full aspect-square rounded-lg border transition-all ${
                      dayActive
                        ? 'bg-violet-500/30 border-violet-500/50 shadow-[0_0_8px_rgba(168,85,247,0.3)]'
                        : 'bg-black/20 border-white/5'
                    }`} />
                    <span className="text-[8px] text-gray-500">{dayNames[i]}</span>
                  </div>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 mt-2 text-center">
              Current streak: <span className="text-violet-300 font-bold">{user.streakCount} days</span>
            </p>
          </div>
        </div>
      )}

      {/* ── SECTION: REFERRAL SYSTEM ── */}
      {activeSection === 'referral' && (
        <div className="space-y-4">
          {/* Hero Referral Card */}
          <div className="glass-card p-4 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-violet-500/5 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">{t('referralSystem')}</h3>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full ml-auto uppercase">
                10% Bonus
              </span>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-black/25 border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider mb-1">{t('totalInvites')}</span>
                <span className="text-2xl font-black text-white">{user.referralCount}</span>
              </div>
              <div className="bg-black/25 border border-white/5 p-3 rounded-xl text-center">
                <span className="text-[9px] text-gray-500 block uppercase font-bold tracking-wider mb-1">{t('commission')}</span>
                <span className="text-2xl font-black text-emerald-400">৳{commissionEarned}</span>
                <span className="text-[8px] text-gray-500 block">BDT</span>
              </div>
            </div>

            {/* Referral Link Box */}
            <div className="mb-3">
              <label className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">{t('yourReferralLink')}</label>
              <div className="bg-black/35 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3">
                <div className="truncate text-[10px] font-mono text-gray-300 flex-1">
                  {referralLink}
                </div>
                <button
                  onClick={handleCopyReferral}
                  className={`py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border flex-shrink-0 ${
                    copied
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-violet-500/25 border-violet-500/30 text-violet-300 hover:bg-violet-500/40'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? t('copied') : t('copyLink')}</span>
                </button>
                <button
                  onClick={handleShareReferral}
                  className="py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border flex-shrink-0 bg-indigo-500/25 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/40"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Referral Code */}
            <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-3 rounded-xl text-center">
              <p className="text-[9px] text-gray-400 mb-1 uppercase tracking-wider font-bold">Your Referral Code</p>
              <p className="text-lg font-black text-white tracking-widest">{user.referralCode}</p>
            </div>
          </div>

          {/* How it works */}
          <div className="glass-card p-4 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3">How Referrals Work</h3>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Share your unique referral link with friends', icon: '🔗' },
                { step: '2', text: 'Friend joins using your link and starts earning', icon: '👥' },
                { step: '3', text: 'You earn 10% bonus + multiplier level increases', icon: '💰' },
                { step: '4', text: '5 referrals → Gold x1.5 | 15 referrals → Platinum x2.0', icon: '🏆' },
              ].map(item => (
                <div key={item.step} className="flex items-center gap-3 p-2.5 bg-black/20 rounded-xl border border-white/5">
                  <span className="text-base">{item.icon}</span>
                  <p className="text-xs text-gray-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default HomeTab;
