import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Settings, Save, ToggleLeft, ToggleRight, AlertTriangle, CheckCircle2 } from 'lucide-react';

const API = '${API}';

interface PlatformSettings {
  planLimits: {
    Free:         { maxUploads: number; maxSizeMb: number; storageCap: number };
    Student:      { maxUploads: number; maxSizeMb: number; storageCap: number };
    Professional: { maxUploads: number; maxSizeMb: number; storageCap: number };
    Enterprise:   { maxUploads: number; maxSizeMb: number; storageCap: number };
  };
  maintenanceMode: boolean;
  featureFlags: {
    aiChatbot:    boolean;
    voiceSearch:  boolean;
    forumEnabled: boolean;
    blogEnabled:  boolean;
  };
}

const DEFAULT_SETTINGS: PlatformSettings = {
  planLimits: {
    Free:         { maxUploads: 3,   maxSizeMb: 5,   storageCap: 0.5  },
    Student:      { maxUploads: 25,  maxSizeMb: 20,  storageCap: 5    },
    Professional: { maxUploads: 200, maxSizeMb: 50,  storageCap: 50   },
    Enterprise:   { maxUploads: 9999,maxSizeMb: 200, storageCap: 1000 }
  },
  maintenanceMode: false,
  featureFlags: {
    aiChatbot:    true,
    voiceSearch:  true,
    forumEnabled: false,
    blogEnabled:  false
  }
};

export const AdminSettings: React.FC = () => {
  const { token } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : DEFAULT_SETTINGS)
      .then(data => setSettings({ ...DEFAULT_SETTINGS, ...data }))
      .catch(() => setSettings(DEFAULT_SETTINGS))
      .finally(() => setLoading(false));
  }, [token]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch(`${API}/api/admin/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const updatePlanLimit = (plan: keyof PlatformSettings['planLimits'], key: string, val: number) => {
    setSettings(prev => ({
      ...prev,
      planLimits: {
        ...prev.planLimits,
        [plan]: { ...prev.planLimits[plan], [key]: val }
      }
    }));
  };

  const toggleFlag = (flag: keyof PlatformSettings['featureFlags']) => {
    setSettings(prev => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [flag]: !prev.featureFlags[flag] }
    }));
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="h-7 w-7 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const PLAN_COLORS: Record<string, string> = {
    Free: 'border-slate-300 dark:border-slate-700',
    Student: 'border-indigo-300 dark:border-indigo-700',
    Professional: 'border-violet-300 dark:border-violet-700',
    Enterprise: 'border-emerald-300 dark:border-emerald-700'
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Platform Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure upload limits, maintenance mode, and feature flags</p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-extrabold transition-all shadow ${
            saved
              ? 'bg-emerald-500 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/10'
          }`}
        >
          {saving ? (
            <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
          ) : saved ? (
            <><CheckCircle2 className="h-4 w-4" />Saved!</>
          ) : (
            <><Save className="h-4 w-4" />Save Changes</>
          )}
        </button>
      </div>

      {/* Maintenance Mode */}
      <div className={`glass-panel border-2 rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4 ${
        settings.maintenanceMode
          ? 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <AlertTriangle className={`h-6 w-6 flex-shrink-0 ${settings.maintenanceMode ? 'text-amber-500' : 'text-slate-400'}`} />
          <div>
            <h3 className="font-extrabold text-sm">Maintenance Mode</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings.maintenanceMode
                ? 'ACTIVE — Users see a maintenance banner and new uploads are blocked.'
                : 'Inactive — Platform running normally.'}
            </p>
          </div>
        </div>
        <button onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}>
          {settings.maintenanceMode
            ? <ToggleRight className="h-8 w-8 text-amber-500 transition-all" />
            : <ToggleLeft className="h-8 w-8 text-slate-400 transition-all" />}
        </button>
      </div>

      {/* Plan Limits */}
      <div className="glass-panel border rounded-2xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          Upload Limits per Plan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(settings.planLimits) as Array<keyof PlatformSettings['planLimits']>).map(plan => (
            <div key={plan} className={`border-2 ${PLAN_COLORS[plan]} rounded-xl p-4 space-y-3`}>
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">{plan} Plan</h4>
              <div className="space-y-2">
                {[
                  { key: 'maxUploads', label: 'Max Uploads / Month' },
                  { key: 'maxSizeMb', label: 'Max File Size (MB)' },
                  { key: 'storageCap', label: 'Storage Cap (GB)' }
                ].map(field => (
                  <div key={field.key} className="flex items-center justify-between gap-3">
                    <label className="text-[11px] text-slate-500 font-semibold flex-1">{field.label}</label>
                    <input
                      type="number"
                      min={0}
                      value={settings.planLimits[plan][field.key as keyof typeof settings.planLimits[typeof plan]]}
                      onChange={e => updatePlanLimit(plan, field.key, Number(e.target.value))}
                      className="w-24 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-right focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags */}
      <div className="glass-panel border rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm flex items-center gap-2 mb-4">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          Feature Flags
        </h3>
        {(Object.entries(settings.featureFlags) as [keyof PlatformSettings['featureFlags'], boolean][]).map(([flag, enabled]) => {
          const labels: Record<string, string> = {
            aiChatbot:    'AI Chatbot Assistant',
            voiceSearch:  'Voice Search (Web Speech API)',
            forumEnabled: 'Community Forum',
            blogEnabled:  'Blog / Announcements'
          };
          const descriptions: Record<string, string> = {
            aiChatbot:    'Displays the AI help chat bubble in the dashboard.',
            voiceSearch:  'Enables microphone search on the History page.',
            forumEnabled: 'Enables the public Community Forum at /forum.',
            blogEnabled:  'Enables the Blog section at /blog.'
          };
          return (
            <div key={flag} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
              <div>
                <p className="font-bold text-sm text-slate-800 dark:text-white">{labels[flag]}</p>
                <p className="text-xs text-slate-500 mt-0.5">{descriptions[flag]}</p>
              </div>
              <button onClick={() => toggleFlag(flag)}>
                {enabled
                  ? <ToggleRight className="h-7 w-7 text-indigo-500" />
                  : <ToggleLeft className="h-7 w-7 text-slate-400" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Email Templates read-only preview */}
      <div className="glass-panel border rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="font-extrabold text-sm flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Email Templates (Read-only Preview)
        </h3>
        {[
          { name: 'Signup Confirmation', subject: 'Welcome to ThreadCounty — Verify Your Email', trigger: 'On new user signup' },
          { name: 'Password Reset',      subject: 'Reset Your ThreadCounty Password',           trigger: 'On forgot-password request' },
          { name: 'Report Ready',        subject: 'Your Fabric Analysis Report is Ready! 🧵',   trigger: 'On analysis completion' },
          { name: 'Plan Upgraded',       subject: 'Your ThreadCounty plan has been updated',    trigger: 'On subscription checkout' }
        ].map(tpl => (
          <div key={tpl.name} className="flex items-start justify-between gap-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <div>
              <p className="font-bold text-xs text-slate-800 dark:text-white">{tpl.name}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Subject: <em>{tpl.subject}</em></p>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">{tpl.trigger}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
