import { useState } from 'react';
import { Wallet, ArrowDownRight, Clock, CheckCircle, XCircle, Copy, Check } from 'lucide-react';
import useStore from '../stores/useStore';

export default function WalletPage() {
  const { userData, withdrawals, requestWithdrawal, addToast, settings } = useStore();
  const [gateway, setGateway] = useState('bKash');
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const myWithdrawals = withdrawals.filter(w => w.userId === userData?.uid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt < settings.minimumWithdrawal) {
      addToast(`Minimum withdrawal is ৳${settings.minimumWithdrawal}`, 'error');
      return;
    }
    if (amt > (userData?.balance || 0)) {
      addToast('Insufficient balance', 'error');
      return;
    }
    setLoading(true);
    try {
      await requestWithdrawal(amt, gateway, phone);
      addToast('Withdrawal request submitted!', 'success');
      setAmount('');
      setPhone('');
    } catch (e) {
      addToast(e.message, 'error');
    }
    setLoading(false);
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(`https://t.me/taskearnbd69_bot?start=${userData?.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const STATUS_ICON = { pending: Clock, paid: CheckCircle, rejected: XCircle };
  const STATUS_COLOR = { pending: 'text-amber-400', paid: 'text-emerald-400', rejected: 'text-red-400' };

  return (
    <div className="space-y-4">
      {/* Balance */}
      <div className="glass-card rounded-2xl p-5 text-center relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
        <Wallet className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Balance</p>
        <p className="text-3xl font-black text-emerald-400">৳{userData?.balance?.toFixed(2) || '0.00'}</p>
        <p className="text-[9px] text-gray-500 mt-1">BDT</p>
      </div>

      {/* Referral */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-xs font-bold text-white mb-2">Invite & Earn ৳0.5</p>
        <div className="flex gap-2">
          <input readOnly value={userData?.referralCode || ''} className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-mono" />
          <button onClick={copyReferral} className="px-3 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold flex items-center gap-1 active:scale-95">
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">Withdraw</p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            {['bKash', 'Nagad'].map(g => (
              <button key={g} type="button" onClick={() => setGateway(g)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${gateway === g ? 'bg-pink-600 text-white' : 'bg-white/[0.05] text-gray-400 border border-white/[0.08]'}`}>{g}</button>
            ))}
          </div>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder={`Min ৳${settings.minimumWithdrawal}`} className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number" className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50" />
          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-black disabled:opacity-40 active:scale-[0.98] transition-all">
            {loading ? 'Processing...' : 'Request Withdrawal'}
          </button>
        </form>
      </div>

      {/* History */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-sm font-bold text-white mb-3">History</p>
        {myWithdrawals.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-4">No withdrawals yet</p>
        ) : (
          <div className="space-y-2">
            {myWithdrawals.map(w => {
              const Icon = STATUS_ICON[w.status] || Clock;
              return (
                <div key={w.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]">
                  <Icon className={`w-4 h-4 ${STATUS_COLOR[w.status]}`} />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-white">৳{w.amount} via {w.gateway}</p>
                    <p className="text-[9px] text-gray-500">{new Date(w.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase ${STATUS_COLOR[w.status]}`}>{w.status}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
