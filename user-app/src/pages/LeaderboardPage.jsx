import { Trophy, Medal, Award } from 'lucide-react';
import useStore from '../stores/useStore';

export default function LeaderboardPage() {
  const { leaderboard, userData } = useStore();

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl p-4 text-center">
        <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h2 className="text-lg font-black gradient-text">Leaderboard</h2>
        <p className="text-[10px] text-gray-400">Top 50 earners</p>
      </div>

      <div className="space-y-2">
        {leaderboard.map((user, i) => {
          const isMe = user.uid === userData?.uid;
          const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
          return (
            <div key={user.uid} className={`glass-card rounded-xl p-3 flex items-center gap-3 ${isMe ? 'border-violet-500/40 bg-violet-500/5' : ''}`}>
              <div className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-xs font-black text-gray-400">
                {rankIcon || i + 1}
              </div>
              <img src={user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} alt="" className="w-8 h-8 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{user.name}{isMe ? ' (You)' : ''}</p>
                <p className="text-[9px] text-gray-500">{user.completedTasks?.length || 0} tasks</p>
              </div>
              <span className="text-xs font-black text-emerald-400">৳{user.balance?.toFixed(2)}</span>
            </div>
          );
        })}
        {leaderboard.length === 0 && <p className="text-center py-12 text-gray-500 text-xs">No data yet</p>}
      </div>
    </div>
  );
}
