import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  Award, 
  Flame, 
  Gift, 
  Check, 
  Sparkles
} from 'lucide-react';
import { dbService } from '../services/firebase';

const MILESTONES = [
  {
    id: 'm-1',
    title: 'Task Apprentice',
    description: 'Complete 3 social tasks on the platform',
    reward: 0.02,
    type: 'Daily',
    requirement: { type: 'tasks', count: 3 }
  },
  {
    id: 'm-2',
    title: 'Community Builder',
    description: 'Invite 1 friend to join the platform',
    reward: 0.05,
    type: 'Daily',
    requirement: { type: 'referrals', count: 1 }
  },
  {
    id: 'm-3',
    title: 'Task Conqueror',
    description: 'Complete 10 tasks in total',
    reward: 0.10,
    type: 'Achieve',
    requirement: { type: 'tasks', count: 10 }
  },
  {
    id: 'm-4',
    title: 'Task Overlord',
    description: 'Complete 50 tasks in total',
    reward: 0.50,
    type: 'Achieve',
    requirement: { type: 'tasks', count: 50 }
  },
  {
    id: 'm-5',
    title: 'Web3 Networker',
    description: 'Invite 15 friends (Platinum VIP status)',
    reward: 1.00,
    type: 'Achieve',
    requirement: { type: 'referrals', count: 15 }
  },
  {
    id: 'm-6',
    title: 'Launch Event Winner',
    description: 'Join during the platform launch campaign',
    reward: 0.03,
    type: 'Events',
    requirement: { type: 'tasks', count: 1 }
  }
];

function LeaderboardTab({ user, refreshAppState }) {
  const { t, notify } = useApp();
  const [subTab, setSubTab] = useState('leaderboard'); // leaderboard or milestones
  const [milestoneType, setMilestoneType] = useState('All'); // All, Achieve, Daily, Events
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [claimingId, setClaimingId] = useState(null);
  const [claimedAlert, setClaimedAlert] = useState('');

  // Fetch leaderboard data
  const loadLeaderboard = async () => {
    try {
      const data = await dbService.getLeaderboard();
      setLeaderboardData(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  // Calculate current user progress for milestones
  const getMilestoneProgress = (requirement) => {
    if (requirement.type === 'tasks') {
      return user.completedTasks ? user.completedTasks.length : 0;
    }
    if (requirement.type === 'referrals') {
      return user.referralCount || 0;
    }
    return 0;
  };

  const handleClaimMilestone = async (milestone) => {
    setClaimingId(milestone.id);
    try {
      // Load current user's claimed milestones (mock field initialize)
      const claimedList = user.claimedMilestones || [];
      if (claimedList.includes(milestone.id)) {
        notify('Milestone already claimed!', 'warning');
        return;
      }

      // Calculate progress to verify
      const progress = getMilestoneProgress(milestone.requirement);
      if (progress < milestone.requirement.count) {
        notify('You have not met the requirements for this milestone yet!', 'warning');
        return;
      }

      // Add reward to balance and update claimedMilestones list
      const updatedClaimedList = [...claimedList, milestone.id];
      const updatedBalance = parseFloat((user.balance + milestone.reward).toFixed(4));
      
      await dbService.testerUpdateUser(user.id, {
        balance: updatedBalance,
        claimedMilestones: updatedClaimedList
      });

      await refreshAppState();
      setClaimedAlert(`+$${milestone.reward.toFixed(3)} USDT Milestone Bonus Claimed!`);
      setTimeout(() => setClaimedAlert(''), 3000);
    } catch (err) {
      notify('Error claiming milestone: ' + err.message, 'error');
    } finally {
      setClaimingId(null);
    }
  };

  // Filter milestones based on milestoneType tab
  const filteredMilestones = MILESTONES.filter(m => {
    if (milestoneType === 'All') return true;
    return m.type.toLowerCase() === milestoneType.toLowerCase();
  });

  // Find user's ranking
  const userRankIndex = leaderboardData.findIndex(u => u.id === user.id);
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : '-';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-4"
    >
      {/* Sub tabs switches */}
      <div className="grid grid-cols-2 p-1 bg-black/35 rounded-2xl border border-white/5">
        <button
          onClick={() => setSubTab('leaderboard')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            subTab === 'leaderboard'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-md shadow-violet-500/5'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Leaderboard</span>
        </button>
        <button
          onClick={() => setSubTab('milestones')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            subTab === 'milestones'
              ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-md shadow-violet-500/5'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Milestones</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {subTab === 'leaderboard' ? (
          /* Leaderboard Screen */
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-4"
          >
            {/* Header description */}
            <div className="p-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>Global Live Rankings</span>
              </h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Top performing earners on Task Earn Bd</p>
            </div>

            {/* Leaderboard Table list */}
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-white/5 max-h-[360px] overflow-y-auto">
              {leaderboardData.map((leadUser, index) => {
                const rank = index + 1;
                const isSelf = leadUser.id === user.id;

                let rankBadge = null;
                if (rank === 1) rankBadge = <span className="text-xl">🥇</span>;
                else if (rank === 2) rankBadge = <span className="text-xl">🥈</span>;
                else if (rank === 3) rankBadge = <span className="text-xl">🥉</span>;
                else rankBadge = <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-gray-400 font-bold">{rank}</span>;

                return (
                  <div 
                    key={leadUser.id}
                    className={`p-3 flex items-center justify-between transition-colors ${
                      isSelf 
                        ? 'bg-violet-500/10 border-y border-violet-500/30' 
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 flex justify-center">{rankBadge}</div>
                      
                      <img 
                        src={leadUser.photoURL} 
                        alt={leadUser.name}
                        className="w-8 h-8 rounded-full border border-white/10 object-cover bg-slate-900"
                      />

                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{leadUser.name}</span>
                          {isSelf && (
                            <span className="text-[8px] bg-violet-500 text-white font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <span>{leadUser.completedTasks?.length || 0} Tasks Done</span>
                          <span>•</span>
                          <span>{leadUser.referralCount || 0} Invites</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-extrabold text-emerald-400">
                        ${leadUser.balance.toFixed(3)}
                      </div>
                      <div className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">USDT</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky/Bottom Profile rankings banner */}
            <div className="p-3 bg-gradient-to-r from-violet-950/40 to-indigo-950/40 border border-violet-500/30 rounded-2xl flex items-center justify-between glow-purple">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex flex-col items-center justify-center font-bold">
                  <span className="text-[8px] text-violet-400 uppercase tracking-widest leading-none mb-0.5">Rank</span>
                  <span className="text-sm text-white leading-none font-extrabold">#{userRank}</span>
                </div>
                
                <div>
                  <h4 className="text-xs font-bold text-white">Your Global Position</h4>
                  <p className="text-[10px] text-violet-300">Boost tasks to overtake top ranks</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-black text-emerald-400">${user.balance.toFixed(3)}</div>
                <div className="text-[8px] text-gray-400 uppercase font-bold tracking-wider">USDT Balance</div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Milestones Screen */
          <motion.div
            key="milestones"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-4"
          >
            {/* Header info & category switches */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">🎯 Task Milestones</h3>
                <p className="text-[11px] text-gray-400">Claim extra rewards on milestones completion</p>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {['All', 'Achieve', 'Daily', 'Events'].map(type => (
                <button
                  key={type}
                  onClick={() => setMilestoneType(type)}
                  className={`py-1 px-3 rounded-lg text-[10px] font-semibold transition-all border ${
                    milestoneType === type
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-black/20 border-white/5 text-gray-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Claimed Toast inside Milestones */}
            {claimedAlert && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-center text-xs text-emerald-400 font-bold glow-green">
                {claimedAlert}
              </div>
            )}

            {/* Milestones list */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-0.5">
              {filteredMilestones.map((milestone) => {
                const claimedList = user.claimedMilestones || [];
                const isClaimed = claimedList.includes(milestone.id);
                
                const progress = getMilestoneProgress(milestone.requirement);
                const target = milestone.requirement.count;
                const isCompleted = progress >= target;
                const progressPct = Math.min((progress / target) * 100, 100);

                const isClaiming = claimingId === milestone.id;

                return (
                  <div 
                    key={milestone.id}
                    className={`glass-card p-3 rounded-2xl border transition-all ${
                      isClaimed 
                        ? 'border-white/5 opacity-60' 
                        : isCompleted 
                          ? 'border-violet-500/40 bg-violet-500/5 glow-purple' 
                          : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                          isClaimed 
                            ? 'bg-black/20 border-white/5' 
                            : isCompleted 
                              ? 'bg-violet-500/20 border-violet-500/30' 
                              : 'bg-black/40 border-white/10'
                        }`}>
                          {milestone.type === 'Daily' ? (
                            <Flame className={`w-5 h-5 ${isCompleted && !isClaimed ? 'text-orange-400' : 'text-gray-500'}`} />
                          ) : milestone.type === 'Events' ? (
                            <Gift className={`w-5 h-5 ${isCompleted && !isClaimed ? 'text-pink-400' : 'text-gray-500'}`} />
                          ) : (
                            <Award className={`w-5 h-5 ${isCompleted && !isClaimed ? 'text-amber-400' : 'text-gray-500'}`} />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs font-bold text-white">{milestone.title}</h4>
                            <span className="text-[8px] text-gray-400 uppercase font-bold bg-white/5 px-1.5 py-0.2 rounded border border-white/5">
                              {milestone.type}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 leading-relaxed">
                            {milestone.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-extrabold text-emerald-400 block">
                          +${milestone.reward.toFixed(3)}
                        </span>
                        <span className="text-[8px] text-gray-500 uppercase font-bold tracking-wider">USDT</span>
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                          <span>Progress: {progress} / {target}</span>
                          <span>{Math.round(progressPct)}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isClaimed 
                                ? 'bg-gray-600' 
                                : isCompleted 
                                  ? 'bg-violet-500' 
                                  : 'bg-indigo-600/50'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        {isClaimed ? (
                          <div className="text-[9px] text-gray-500 font-bold bg-white/5 border border-white/5 px-3 py-1 rounded-xl flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Claimed</span>
                          </div>
                        ) : isCompleted ? (
                          <button
                            onClick={() => handleClaimMilestone(milestone)}
                            disabled={isClaiming}
                            className="text-[9px] font-bold text-white bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-600 px-3.5 py-1 rounded-xl active:scale-95 transition-all shadow-md shadow-violet-500/20"
                          >
                            {isClaiming ? 'Claiming...' : 'Claim Bonus'}
                          </button>
                        ) : (
                          <div className="text-[9px] text-gray-500 font-bold bg-black/20 border border-white/5 px-3 py-1 rounded-xl">
                            <span>Locked</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default LeaderboardTab;
