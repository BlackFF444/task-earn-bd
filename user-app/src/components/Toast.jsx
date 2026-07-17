import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const ICONS = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const COLORS = { success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', error: 'text-red-400 bg-red-500/10 border-red-500/20', info: 'text-blue-400 bg-blue-500/10 border-blue-500/20', warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };

export default function Toast({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[100] space-y-2 max-w-xs">
      <AnimatePresence>
        {toasts.map(toast => {
          const Icon = ICONS[toast.type] || Info;
          return (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 50, scale: 0.9 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 50, scale: 0.9 }} className={`flex items-center gap-2 p-3 rounded-xl border backdrop-blur-xl ${COLORS[toast.type] || COLORS.info}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <p className="text-xs font-bold">{toast.message}</p>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
