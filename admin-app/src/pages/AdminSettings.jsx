import { useState, useEffect } from 'react';
import { Save, AlertTriangle, Info } from 'lucide-react';
import useStore from '../stores/useStore';

export default function AdminSettings() {
  const { settings, updateSettings, addToast } = useStore();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(form);
      addToast('Settings saved!', 'success');
    } catch (e) { addToast(e.message, 'error'); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-black text-white">Master Settings</h2>

      <div className="glass-card rounded-2xl p-4 space-y-4">
        {/* Minimum Withdrawal */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">Minimum Withdrawal (BDT)</label>
          <input
            type="number"
            value={form.minimumWithdrawal || ''}
            onChange={e => setForm({ ...form, minimumWithdrawal: parseFloat(e.target.value) || 0 })}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Referral Bonus */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">Referral Bonus (BDT)</label>
          <input
            type="number"
            step="0.1"
            value={form.referralBonus || ''}
            onChange={e => setForm({ ...form, referralBonus: parseFloat(e.target.value) || 0 })}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50"
          />
        </div>

        {/* App Version */}
        <div>
          <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1 block">App Version</label>
          <input
            value={form.appVersion || ''}
            onChange={e => setForm({ ...form, appVersion: e.target.value })}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white text-xs font-bold outline-none focus:border-violet-500/50"
          />
        </div>

        {/* Maintenance Mode */}
        <div className="flex items-center justify-between py-3 border-t border-white/[0.04]">
          <div>
            <p className="text-xs font-bold text-white">Maintenance Mode</p>
            <p className="text-[9px] text-gray-500">Disable task claiming and withdrawals for all users</p>
          </div>
          <button
            onClick={() => setForm({ ...form, maintenanceMode: !form.maintenanceMode })}
            className={`relative w-12 h-6 rounded-full transition-all ${form.maintenanceMode ? 'bg-amber-500' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${form.maintenanceMode ? 'left-[26px]' : 'left-0.5'}`} />
          </button>
        </div>

        {form.maintenanceMode && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-[10px] text-amber-400 font-bold">Maintenance mode is ON. Users cannot claim tasks or request withdrawals.</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-gray-400 font-bold">Firestore Collections</p>
            <p className="text-[9px] text-gray-500 mt-1">users, tasks, claims, withdrawals, app_settings (global)</p>
            <p className="text-[9px] text-gray-500">All data is shared with the user app via the same Firebase project.</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl gradient-btn text-white text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.98] transition-all"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}
