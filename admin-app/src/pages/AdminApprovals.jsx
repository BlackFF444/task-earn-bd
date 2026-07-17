import { useState } from 'react';
import { Check, X, Eye, Image } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../stores/useStore';

export default function AdminApprovals() {
  const { pendingClaims, approveClaim, rejectClaim, allClaims, addToast } = useStore();
  const [tab, setTab] = useState('pending');
  const [viewProof, setViewProof] = useState(null);
  const [processing, setProcessing] = useState(null);

  const claims = tab === 'pending' ? pendingClaims : allClaims;

  const handleApprove = async (claimId) => {
    setProcessing(claimId);
    try { await approveClaim(claimId); addToast('Claim approved', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const handleReject = async (claimId) => {
    if (!confirm('Reject this claim?')) return;
    setProcessing(claimId);
    try { await rejectClaim(claimId); addToast('Claim rejected', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const STATUS_COLOR = { pending: 'text-amber-400 bg-amber-500/10', approved: 'text-emerald-400 bg-emerald-500/10', rejected: 'text-red-400 bg-red-500/10' };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Claim Approvals</h2>

      <div className="flex gap-2">
        {['pending', 'all'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${tab === t ? 'bg-violet-600 text-white' : 'bg-white/[0.05] text-gray-400 border border-white/[0.08]'}`}>
            {t === 'pending' ? `Pending (${pendingClaims?.length || 0})` : 'All'}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {claims?.map(claim => (
          <div key={claim.id} className="glass-card rounded-xl p-3">
            <div className="flex items-center gap-3">
              <img src={claim.userPhoto || ''} alt="" className="w-9 h-9 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-white truncate">{claim.userName}</p>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${STATUS_COLOR[claim.status]}`}>{claim.status}</span>
                </div>
                <p className="text-[9px] text-gray-500">{claim.taskTitle} · {claim.category}</p>
                <p className="text-[9px] text-gray-500">৳{claim.earnedAmount} ({claim.multiplier}x multiplier)</p>
              </div>
              <div className="flex items-center gap-1">
                {claim.proofImageUrl && (
                  <button onClick={() => setViewProof(claim.proofImageUrl)} className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400"><Eye className="w-3 h-3" /></button>
                )}
                {claim.status === 'pending' && (
                  <>
                    <button onClick={() => handleApprove(claim.id)} disabled={processing === claim.id} className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 disabled:opacity-40"><Check className="w-3 h-3" /></button>
                    <button onClick={() => handleReject(claim.id)} disabled={processing === claim.id} className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 disabled:opacity-40"><X className="w-3 h-3" /></button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {claims?.length === 0 && <p className="text-xs text-gray-500 text-center py-8">No claims found</p>}
      </div>

      <AnimatePresence>
        {viewProof && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setViewProof(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <img src={viewProof} alt="Proof" className="w-full rounded-2xl" />
              <button onClick={() => setViewProof(null)} className="mt-3 w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-bold">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
