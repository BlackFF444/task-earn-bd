import { useState } from 'react';
import { Check, X, Clock, CheckCircle, XCircle } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminPayouts() {
  const { withdrawals, approveWithdrawal, rejectWithdrawal, addToast } = useStore();
  const [processing, setProcessing] = useState(null);

  const pending = withdrawals.filter(w => w.status === 'pending');
  const processed = withdrawals.filter(w => w.status !== 'pending');

  const handleApprove = async (id) => {
    setProcessing(id);
    try { await approveWithdrawal(id); addToast('Withdrawal approved!', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const handleReject = async (id) => {
    if (!confirm('Reject and refund?')) return;
    setProcessing(id);
    try { await rejectWithdrawal(id); addToast('Rejected & refunded', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const STATUS_ICON = { pending: Clock, paid: CheckCircle, rejected: XCircle };
  const STATUS_COLOR = { pending: 'text-amber-400', paid: 'text-emerald-400', rejected: 'text-red-400' };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Payouts</h2>

      {pending.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-amber-400">Pending ({pending.length})</p>
          {pending.map(w => (
            <div key={w.id} className="glass-card rounded-xl p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{w.userName}</p>
                  <p className="text-[9px] text-gray-500">{w.phone} · {w.gateway}</p>
                </div>
                <span className="text-sm font-black text-emerald-400">৳{w.amount}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleReject(w.id)} disabled={processing === w.id} className="flex-1 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40">
                  <X className="w-3 h-3" /> Reject
                </button>
                <button onClick={() => handleApprove(w.id)} disabled={processing === w.id} className="flex-1 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40">
                  <Check className="w-3 h-3" /> Paid
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {processed.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold text-gray-400">History</p>
          {processed.map(w => {
            const Icon = STATUS_ICON[w.status] || Clock;
            return (
              <div key={w.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <Icon className={`w-4 h-4 ${STATUS_COLOR[w.status]}`} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-white">{w.userName}</p>
                  <p className="text-[9px] text-gray-500">{w.gateway} · {new Date(w.timestamp).toLocaleDateString()}</p>
                </div>
                <span className="text-xs font-black text-emerald-400">৳{w.amount}</span>
              </div>
            );
          })}
        </div>
      )}

      {pending.length === 0 && processed.length === 0 && (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-sm text-gray-400">No withdrawal requests</p>
        </div>
      )}
    </div>
  );
}
