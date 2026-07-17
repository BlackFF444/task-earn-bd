import { useState } from 'react';
import { Check, X, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useStore from '../stores/useStore';

export default function AdminApprovals() {
  const { pendingClaims, approveClaim, rejectClaim, addToast } = useStore();
  const [viewProof, setViewProof] = useState(null);
  const [processing, setProcessing] = useState(null);

  const handleApprove = async (id) => {
    setProcessing(id);
    try { await approveClaim(id); addToast('Claim approved!', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  const handleReject = async (id) => {
    if (!confirm('Reject this claim?')) return;
    setProcessing(id);
    try { await rejectClaim(id); addToast('Claim rejected', 'success'); } catch (e) { addToast(e.message, 'error'); }
    setProcessing(null);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Task Approvals</h2>
      <p className="text-xs text-gray-400">{pendingClaims.length} pending</p>

      {pendingClaims.length === 0 ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm text-gray-400">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingClaims.map(claim => (
            <div key={claim.id} className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={claim.userPhoto || ''} alt="" className="w-10 h-10 rounded-full object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white">{claim.userName}</p>
                  <p className="text-[9px] text-gray-400">{claim.taskTitle}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-emerald-400">৳{claim.earnedAmount}</p>
                  <p className="text-[9px] text-gray-500">{claim.multiplier}x</p>
                </div>
              </div>

              {claim.proofImageUrl && (
                <button onClick={() => setViewProof(claim.proofImageUrl)} className="w-full mb-3 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs text-gray-400 font-bold flex items-center justify-center gap-2 hover:border-violet-500/50">
                  <Eye className="w-3 h-3" /> View Proof
                </button>
              )}

              <div className="flex gap-2">
                <button onClick={() => handleReject(claim.id)} disabled={processing === claim.id} className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-400 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40">
                  <X className="w-3 h-3" /> Reject
                </button>
                <button onClick={() => handleApprove(claim.id)} disabled={processing === claim.id} className="flex-1 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40">
                  <Check className="w-3 h-3" /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {viewProof && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setViewProof(null)}>
            <img src={viewProof} alt="Proof" className="max-w-full max-h-[80vh] rounded-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
