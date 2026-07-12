import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const icons = {
  success: <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />,
  error: <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />,
  info: <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />,
  warning: <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />,
};

const colors = {
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  error: 'bg-rose-500/10 border-rose-500/30 text-rose-300',
  info: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
};

function ToastItem({ notification, onDismiss }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`flex items-start gap-2.5 px-3 py-2.5 rounded-xl border backdrop-blur-xl text-xs font-semibold shadow-xl max-w-[340px] w-full ${colors[notification.type]}`}
    >
      {icons[notification.type]}
      <span className="flex-1 leading-relaxed">{notification.message}</span>
      <button
        onClick={() => onDismiss(notification.id)}
        className="opacity-60 hover:opacity-100 transition-opacity ml-1 mt-0.5 flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const { notifications, dismissNotification } = useApp();

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto w-full">
            <ToastItem notification={n} onDismiss={dismissNotification} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
