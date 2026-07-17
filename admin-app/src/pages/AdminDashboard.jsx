import { Users, CheckSquare, Clock, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminDashboard() {
  const { stats, pendingClaims, pendingWithdrawals, settings } = useStore();

  const cards = stats ? [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: CheckSquare, label: 'Active Tasks', value: stats.activeTasks, color: 'text-violet-400', bg: 'bg-violet-500/10' },
    { icon: Clock, label: 'Pending Claims', value: stats.pendingClaims, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { icon: DollarSign, label: 'Pending Payouts', value: stats.pendingWithdrawals, color: 'text-pink-400', bg: 'bg-pink-500/10' },
    { icon: TrendingUp, label: 'Total Paid Out', value: `৳${stats.totalPaidOut?.toLocaleString()}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { icon: Users, label: 'Total Balance', value: `৳${stats.totalBalance?.toLocaleString()}`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  ] : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-white">Dashboard</h2>
        {settings.maintenanceMode && (
          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Maintenance ON
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((card, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${card.bg}`}>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </div>
            </div>
            <p className="text-lg font-black text-white">{card.value}</p>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Pending Claims */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Pending Claims ({pendingClaims?.length || 0})</h3>
        {pendingClaims?.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No pending claims</p>
        ) : (
          <div className="space-y-2">
            {pendingClaims?.slice(0, 5).map(claim => (
              <div key={claim.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                <img src={claim.userPhoto || ''} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{claim.userName}</p>
                  <p className="text-[9px] text-gray-500">{claim.taskTitle}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">৳{claim.earnedAmount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Pending Payouts */}
      <div className="glass-card rounded-2xl p-4">
        <h3 className="text-sm font-bold text-white mb-3">Pending Payouts ({pendingWithdrawals?.length || 0})</h3>
        {pendingWithdrawals?.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No pending payouts</p>
        ) : (
          <div className="space-y-2">
            {pendingWithdrawals?.slice(0, 5).map(w => (
              <div key={w.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-pink-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{w.userName}</p>
                  <p className="text-[9px] text-gray-500">{w.gateway} - {w.phone}</p>
                </div>
                <span className="text-xs font-bold text-amber-400">৳{w.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
