import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Copy, Check, ArrowUpRight, History,
  LogOut, CheckCircle, XCircle, Clock, DollarSign, Share2
} from 'lucide-react';
import { dbService } from '../services/firebase';
import { useApp } from '../context/AppContext';

function ProfileTab({ user, refreshAppState, onLogout, withdrawals }) {
  const { t, notify } = useApp();

  const [copied, setCopied] = useState(false);
  const [gateway, setGateway] = useState('bKash');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const handleCopyLink = () => {
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

  const handleShareLink = () => {
    const link = `https://t.me/taskearnbd69_bot?start=${user.referralCode}`;
    const tg = window.Telegram?.WebApp;
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join Task Earn BD and earn BDT!')}`);
    } else {
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join Task Earn BD and earn BDT!')}`, '_blank');
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 50) {
      notify('Minimum withdrawal is ৳50 BDT.', 'error');
      return;
    }
    if (numAmount > user.balance) {
      notify('Insufficient balance.', 'error');
      return;
    }
    if (!address.trim()) {
      notify('Please enter a valid wallet address or mobile number.', 'error');
      return;
    }
    setWithdrawing(true);
    try {
      await dbService.requestWithdrawal(user.id, numAmount, gateway, address.trim());
      await refreshAppState();
      setAmount('');
      setAddress('');
      notify(`Withdrawal of ৳${numAmount.toFixed(2)} submitted! Status: Pending. ⏳`, 'success');
    } catch (err) {
      notify(err.message || 'Withdrawal failed.', 'error');
    } finally {
      setWithdrawing(false);
    }
  };

  const userWithdrawals = withdrawals
    .filter(w => w.userId === user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-5"
    >
      {/* Profile Header */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={user.photoURL} alt={user.name} className="w-12 h-12 rounded-full border-2 border-violet-500/20 bg-slate-900 object-cover" />
          <div>
            <h3 className="text-sm font-bold text-white">{user.name}</h3>
            <p className="text-[10px] text-gray-400">{user.telegramUsername ? `@${user.telegramUsername}` : user.name}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 active:scale-95 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Referral Section */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-bold text-white">Invite Friends</h3>
          </div>
          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full uppercase">
            10% Commission
          </span>
        </div>
        <div className="bg-black/35 rounded-xl p-3 border border-white/5 flex items-center justify-between gap-3 mb-4">
          <div className="truncate text-xs font-mono text-gray-300">{user.referralCode}</div>
          <div className="flex gap-1.5 flex-shrink-0">
            <button
              onClick={handleCopyLink}
              className={`py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border ${
                copied
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-violet-500/25 border-violet-500/30 text-violet-300 hover:bg-violet-500/40'
              }`}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /><span>{t('copied')}</span></> : <><Copy className="w-3.5 h-3.5" /><span>{t('copyLink')}</span></>}
            </button>
            <button
              onClick={handleShareLink}
              className="py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border bg-indigo-500/25 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/40"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">{t('totalInvites')}</span>
            <span className="text-base font-extrabold text-white">{user.referralCount}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">{t('commission')}</span>
            <span className="text-base font-extrabold text-emerald-400">৳{(user.referralCount * 5).toFixed(2)} <span className="text-[10px] text-gray-400">BDT</span></span>
          </div>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white">{t('withdrawal')}</h3>
        </div>
        <form onSubmit={handleWithdrawSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Select Network/Gateway</label>
            <div className="grid grid-cols-3 gap-1">
              {['bKash', 'Nagad'].map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setGateway(net)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all flex-1 ${
                    gateway === net
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300 shadow-sm'
                      : 'bg-black/20 border-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Amount (BDT)</label>
              <div className="relative">
                <input
                  type="number" step="1" min="50" placeholder="Min ৳50"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full py-2 px-3 glass-input text-xs font-semibold" required
                />
                <span className="text-gray-500 absolute left-2 top-2.5 text-xs font-bold">৳</span>
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                Mobile Number
              </label>
              <input
                type="text"
                placeholder="017XXXXXXXX"
                value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full py-2 px-3 glass-input text-xs font-semibold" required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={withdrawing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-violet-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
          >
            {withdrawing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><ArrowUpRight className="w-4 h-4" /><span>Submit Withdrawal Request</span></>
            )}
          </button>
        </form>
      </div>

      {/* Withdrawal History */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-3.5">
          <History className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white">{t('withdrawHistory')}</h3>
        </div>
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-0.5">
          {userWithdrawals.length === 0 ? (
            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl text-center text-xs text-gray-500">
              No transactions recorded yet.
            </div>
          ) : (
            userWithdrawals.map((item) => (
              <div key={item.id} className="p-3 bg-black/25 border border-white/5 rounded-xl flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">৳{item.amount.toFixed(2)} BDT</span>
                    <span className="text-[9px] text-gray-400 font-bold bg-white/5 px-2 py-0.2 rounded border border-white/5 uppercase">{item.gateway}</span>
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1 truncate max-w-[190px]">To: {item.walletAddress}</p>
                  <p className="text-[8px] text-gray-500 mt-0.5">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  {item.status === 'Approved' && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />Approved
                    </span>
                  )}
                  {item.status === 'Rejected' && (
                    <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                      <XCircle className="w-3 h-3" />Rejected
                    </span>
                  )}
                  {item.status === 'Pending' && (
                    <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" />Pending
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ProfileTab;
