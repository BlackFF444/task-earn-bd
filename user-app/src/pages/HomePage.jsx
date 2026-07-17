import { useState } from 'react';
import { BarChart2, Calendar, Copy, Check, Share2 } from 'lucide-react';
import useStore from '../stores/useStore';

const STREAK_REWARDS = [0.5, 1, 1.5, 2, 2.5, 3.5, 5];

export default function HomePage() {
  const { userData, tasks, claimStreak, addToast } = useStore();
  const [copied, setCopied] = useState(false);
  const [streakLoading, setStreakLoading] = useState(false);

  if (!userData) return null;

  const completedCount = userData.completedTasks?.length || 0;
  const taskProgress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const multiplier = (userData.referralCount || 0) >= 15 ? 2.0 : (userData.referralCount || 0) >= 5 ? 1.5 : 1.0;
  const nextStreakDay = (userData.streakCount % 7) + 1;

  const canCheckIn = () => {
    if (!userData.lastCheckIn) return true;
    const diff = (new Date() - new Date(userData.lastCheckIn)) / (1000 * 60 * 60);
    return diff >= 24;
  };

  const handleCheckIn = async () => {
    setStreakLoading(true);
    try {
      const result = await claimStreak();
      addToast(`Streak day ${result.streakCount}! Earned ৳${result.reward}`, 'success');
    } catch (e) {
      addToast(e.message, 'error');
    }
    setStreakLoading(false);
  };

  const copyReferral = () => {
    const link = `https://t.me/taskearnbd69_bot?start=${userData.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast('Referral link copied!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* VIP Card */}
      <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">VIP Level</p>
            <p className="text-lg font-black gradient-text">{getVIPName(userData.referralCount)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Multiplier</p>
            <p className="text-lg font-black text-emerald-400">{multiplier}x</p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min((userData.referralCount / 15) * 100, 100)}%` }} />
        </div>
        <p className="text-[9px] text-gray-500 mt-1">{userData.referralCount || 0}/15 referrals to Platinum</p>
      </div>

      {/* Daily Streak */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-400" />
            <p className="text-sm font-bold text-white">Daily Streak</p>
          </div>
          <span className="text-xs font-bold text-amber-400">Day {userData.streakCount % 7}/7</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-3">
          {STREAK_REWARDS.map((reward, i) => (
            <div key={i} className={`text-center p-1.5 rounded-lg text-[9px] font-bold ${i < (userData.streakCount % 7) ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.03] text-gray-600'}`}>
              <div>Day {i + 1}</div>
              <div>৳{reward}</div>
            </div>
          ))}
        </div>
        <button
          onClick={handleCheckIn}
          disabled={!canCheckIn() || streakLoading}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-black disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
        >
          {streakLoading ? 'Claiming...' : canCheckIn() ? 'Check In Now' : 'Come back tomorrow'}
        </button>
      </div>

      {/* Task Progress */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="w-4 h-4 text-violet-400" />
          <p className="text-sm font-bold text-white">Task Progress</p>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{completedCount}/{tasks.length} completed</span>
          <span className="text-xs font-bold text-violet-400">{Math.round(taskProgress)}%</span>
        </div>
        <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all" style={{ width: `${taskProgress}%` }} />
        </div>
      </div>

      {/* Referral */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-2">Referral System</p>
        <p className="text-[10px] text-gray-400 mb-3">Invite friends and earn ৳0.5 per referral</p>
        <div className="flex gap-2">
          <input readOnly value={userData.referralCode || ''} className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-mono" />
          <button onClick={copyReferral} className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition-all">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  );
}

function getVIPName(count = 0) {
  if (count >= 15) return 'Platinum VIP';
  if (count >= 5) return 'Gold Club';
  return 'Member';
}
