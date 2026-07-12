import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet, Copy, Check, HelpCircle, ArrowUpRight, History,
  LogOut, CheckCircle, XCircle, Clock, DollarSign, Share2
} from 'lucide-react';
import { dbService } from '../services/firebase';
import { useApp } from '../context/AppContext';

const QUIZ_QUESTIONS = [
  { question: "Which cryptocurrency is known as the 'Digital Gold'?", options: ["Bitcoin", "Ethereum", "Solana", "Cardano"], correctAnswer: 0 },
  { question: "What does HODL stand for in the crypto community?", options: ["Hold On for Dear Life", "Hold On Don't Leave", "Heaven of Digital Loot", "High Option Derivative Leverage"], correctAnswer: 0 },
  { question: "Who is the anonymous creator of Bitcoin?", options: ["Satoshi Nakamoto", "Vitalik Buterin", "Charles Hoskinson", "Elon Musk"], correctAnswer: 0 },
  { question: "Solana uses which consensus mechanism primarily?", options: ["Proof of History", "Proof of Work", "Proof of Burn", "Proof of Authority"], correctAnswer: 0 },
  { question: "In what year was Bitcoin launched?", options: ["2008", "2009", "2010", "2015"], correctAnswer: 1 },
];

function ProfileTab({ user, refreshAppState, onLogout, withdrawals }) {
  const { t, notify } = useApp();

  const [canTakeQuiz, setCanTakeQuiz] = useState(true);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  const [copied, setCopied] = useState(false);
  const [gateway, setGateway] = useState('TRC20');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    const allowed = dbService.canTakeQuiz(user.id);
    setCanTakeQuiz(allowed);
    const dayOfMonth = new Date().getDate();
    setQuizQuestion(QUIZ_QUESTIONS[dayOfMonth % QUIZ_QUESTIONS.length]);
  }, [user]);

  const handleCopyLink = () => {
    const link = `https://t.me/task_earn_bd_bot?start=${user.referralCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    notify('Referral link copied! 🔗', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleQuizSubmit = async () => {
    if (selectedOption === null) return;
    setQuizSubmitted(true);
    try {
      const isCorrect = selectedOption === quizQuestion.correctAnswer;
      const res = await dbService.submitQuizAnswer(user.id, isCorrect);
      await refreshAppState();
      setQuizResult(res);
      setCanTakeQuiz(false);
      if (res.correct) {
        notify(`Correct! +$${res.reward.toFixed(3)} USDT earned! 🎉`, 'success');
      } else {
        notify('Incorrect answer. Better luck tomorrow!', 'warning');
      }
    } catch (err) {
      notify(err.message || 'Quiz error.', 'error');
      setQuizSubmitted(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 0.50) {
      notify('Minimum withdrawal is $0.50 USDT.', 'error');
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
      notify(`Withdrawal of $${numAmount.toFixed(2)} submitted! Status: Pending. ⏳`, 'success');
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
            <p className="text-[10px] text-gray-400">{user.email}</p>
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
          <button
            onClick={handleCopyLink}
            className={`py-1.5 px-3 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border flex-shrink-0 ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                : 'bg-violet-500/25 border-violet-500/30 text-violet-300 hover:bg-violet-500/40'
            }`}
          >
            {copied ? <><Check className="w-3.5 h-3.5" /><span>{t('copied')}</span></> : <><Copy className="w-3.5 h-3.5" /><span>{t('copyLink')}</span></>}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">{t('totalInvites')}</span>
            <span className="text-base font-extrabold text-white">{user.referralCount}</span>
          </div>
          <div className="bg-white/[0.02] border border-white/5 p-3 rounded-xl text-center">
            <span className="text-[10px] text-gray-500 block uppercase font-bold tracking-wider mb-1">{t('commission')}</span>
            <span className="text-base font-extrabold text-emerald-400">${(user.referralCount * 0.05).toFixed(2)} <span className="text-[10px] text-gray-400">USDT</span></span>
          </div>
        </div>
      </div>

      {/* Daily Crypto Quiz */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-bold text-white">{t('dailyQuiz')}</h3>
        </div>
        {canTakeQuiz && quizQuestion ? (
          <div className="space-y-3">
            <p className="text-xs text-violet-200 bg-violet-500/5 border border-violet-500/10 p-3 rounded-xl">
              {quizQuestion.question}
            </p>
            <div className="space-y-2">
              {quizQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs text-left border transition-all ${
                    selectedOption === idx
                      ? 'bg-violet-500/15 border-violet-500 text-white font-bold'
                      : 'bg-black/20 border-white/5 text-gray-400 hover:text-gray-200 hover:border-white/10'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={handleQuizSubmit}
              disabled={selectedOption === null || quizSubmitted}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-xs font-bold shadow-md shadow-violet-500/10 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {quizSubmitted ? 'Submitting...' : t('submitAnswer')}
            </button>
          </div>
        ) : (
          <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center">
            {quizResult ? (
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                  {quizResult.correct ? (
                    <><CheckCircle className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">Correct Answer!</span></>
                  ) : (
                    <><XCircle className="w-4 h-4 text-rose-400" /><span className="text-rose-400">Incorrect Answer</span></>
                  )}
                </p>
                <p className="text-[10px] text-gray-400">
                  {quizResult.correct
                    ? `You earned $${quizResult.reward.toFixed(3)} USDT bonus!`
                    : 'Better luck tomorrow! Keep studying.'}
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5 py-1">
                <Clock className="w-4 h-4 text-violet-400 animate-pulse" />
                <span>Daily Quiz taken! Come back tomorrow.</span>
              </p>
            )}
          </div>
        )}
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
              {['TRC20', 'TON', 'ERC20', 'bKash', 'Nagad', 'Rocket'].map((net) => (
                <button
                  key={net}
                  type="button"
                  onClick={() => setGateway(net)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all ${
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
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Amount (USDT)</label>
              <div className="relative">
                <input
                  type="number" step="0.01" min="0.50" placeholder="Min $0.50"
                  value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full py-2 px-3 pl-7 glass-input text-xs font-semibold" required
                />
                <DollarSign className="w-3.5 h-3.5 text-gray-500 absolute left-2 top-2.5" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">
                {['bKash', 'Nagad', 'Rocket'].includes(gateway) ? 'Mobile Number' : 'Crypto Address'}
              </label>
              <input
                type="text"
                placeholder={['bKash', 'Nagad', 'Rocket'].includes(gateway) ? '017XXXXXXXX' : '0x... or U...'}
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
                    <span className="font-extrabold text-white">${item.amount.toFixed(2)} USDT</span>
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
