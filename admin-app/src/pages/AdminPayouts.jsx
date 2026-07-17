import { useState } from 'react';
import { Check, X, RotateCcw, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminPayouts() {
  const { pendingWithdrawals, allWithdrawals, approveWithdrawal, rejectWithdrawal, refundWithdrawal, addToast } = useStore();
  const [tab, setTab] = useState('pending');
  const [processing, setProcessing] = useState(null);

  const withdrawals = tab === 'pending' ? pendingWithdrawals : allWithdrawals;

  const handleApprove = async (id) => {
    setProcessing(id);
    try { await approveWithdrawal(id); addToast('Payout approved (paid)', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const handleReject = async (id) => {
    if (!confirm('Reject and refund balance to user?')) return;
    setProcessing(id);
    try { await rejectWithdrawal(id); addToast('Payout rejected, balance refunded', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const handleRefund = async (id) => {
    if (!confirm('Refund this completed payout? Balance will be returned to user.')) return;
    setProcessing(id);
    try { await refundWithdrawal(id); addToast('Payout refunded', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const STATUS_ICON = { pending: Clock, paid: CheckCircle, rejected: XCircle, refunded: RotateCcw };
  const STATUS_COLOR = { pending: 'text-amber-400', paid: 'text-emerald-400', rejected: 'text-red-400', refunded: 'text-purple-400' };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Payout Management</h2>

      <div className="flex gap-2">
        {['pending', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${tab === t ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-gray-400 border border-white/[0.08]'}`}>
            {t === 'pending' ? `Pending (${pendingWithdrawals?.length || 0})` : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {withdrawals?.map(w => {
          const Icon = STATUS_ICON[w.status] || Clock;
          return (
            <div key={w.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.03]`}>
                  <Icon className={`w-4 h-4 ${STATUS_COLOR[w.status]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white truncate">{w.userName}</p>
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[w.status]} bg-white/[0.03]`}>{w.status}</span>
                  </div>
                  <p className="text-[9px] text-gray-500">{w.gateway} · {w.phone}</p>
                  <p className="text-[9px] text-gray-500">{new Date(w.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm font-black text-amber-400">৳{w.amount}</span>
                  {w.status === 'pending' && (
                    <div className="flex gap-1">
                      <button onClick={() => handleApprove(w.id)} disabled={processing === w.id} className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 disabled:opacity-40"><Check className="w-3 h-3" /></button>
                      <button onClick={() => handleReject(w.id)} disabled={processing === w.id} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 disabled:opacity-40"><X className="w-3 h-3" /></button>
                    </div>
                  )}
                  {w.status === 'paid' && (
                    <button onClick={() => handleRefund(w.id)} disabled={processing === w.id} className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 disabled:opacity-40"><RotateCcw className="w-3 h-3" /></button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {withdrawals?.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No payouts found</p>}
      </div>
    </div>
  );
}
