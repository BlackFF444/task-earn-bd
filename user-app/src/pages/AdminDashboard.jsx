import { Users, DollarSign, CheckCircle, Settings, Wrench } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminDashboard() {
  const { userData, leaderboard, pendingClaims, withdrawals, settings, updateSettings, addToast } = useStore();

  const totalBalance = leaderboard.reduce((s, u) => s + (u.balance || 0), 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const paidWithdrawals = withdrawals.filter(w => w.status === 'paid');
  const totalPaid = paidWithdrawals.reduce((s, w) => s + w.amount, 0);

  const toggleMaintenance = async () => {
    try {
      await updateSettings({ maintenanceMode: !settings.maintenanceMode });
      addToast(`Maintenance mode ${!settings.maintenanceMode ? 'ON' : 'OFF'}`, 'success');
    } catch (e) {
      addToast(e.message, 'error');
    }
  };

  const statCards = [
    { icon: Users, label: 'Total Users', value: leaderboard.length, color: 'text-blue-400' },
    { icon: DollarSign, label: 'Total Balance', value: `৳${totalBalance.toFixed(2)}`, color: 'text-emerald-400' },
    { icon: CheckCircle, label: 'Pending Claims', value: pendingClaims.length, color: 'text-amber-400' },
    { icon: DollarSign, label: 'Total Paid', value: `৳${totalPaid.toFixed(2)}`, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Dashboard</h2>

      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => (
          <div key={i} className="glass-card rounded-2xl p-4">
            <card.icon className={`w-5 h-5 ${card.color} mb-2`} />
            <p className="text-[10px] text-gray-400 uppercase font-bold">{card.label}</p>
            <p className="text-lg font-black text-white">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-bold text-white">Settings</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Maintenance Mode</span>
            <button onClick={toggleMaintenance} className={`w-12 h-6 rounded-full transition-all ${settings.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Min Withdrawal</span>
            <span className="text-xs font-bold text-white">৳{settings.minimumWithdrawal}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Referral Bonus</span>
            <span className="text-xs font-bold text-white">৳{settings.referralBonus}</span>
          </div>
        </div>
      </div>

      {/* Recent pending */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Pending Claims</p>
        {pendingClaims.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No pending claims</p>
        ) : (
          <div className="space-y-2">
            {pendingClaims.slice(0, 5).map(claim => (
              <div key={claim.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                <img src={claim.userPhoto || ''} alt="" className="w-8 h-8 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{claim.userName}</p>
                  <p className="text-[9px] text-gray-500 truncate">{claim.taskTitle}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">৳{claim.earnedAmount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
