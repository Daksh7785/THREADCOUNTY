import { API_URL, API } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Key, ShieldAlert, AlertCircle, CheckCircle, Activity, UploadCloud, FileText, LogOut, CreditCard } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'danger' | 'activity'>('profile');

  // Activity log
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState<'all' | 'uploads' | 'reports' | 'account' | 'logins'>('all');

  useEffect(() => {
    if (token && activeTab === 'activity' && activities.length === 0) {
      setActivityLoading(true);
      fetch(`${API_URL}/dashboard/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : [])
        .then(data => setActivities(data || []))
        .catch(() => {})
        .finally(() => setActivityLoading(false));
    }
  }, [activeTab, token]);

  // Profile fields state
  const [name, setName] = useState(user?.name || '');
  const [company, setCompany] = useState(user?.company || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status alerts
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoSuccess, setDemoSuccess] = useState('');
  const [demoError, setDemoError] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name) {
      setProfileError('Name is required.');
      return;
    }

    setLoadingProfile(true);

    try {
      const res = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, company, avatar_url: avatarUrl })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile.');
      }

      updateUser(data.user);
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      setProfileError(err.message || 'Unable to update profile.');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setLoadingPassword(true);

    try {
      const res = await fetch(`${API_URL}/user/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update password.');
      }

      setPasswordSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Incorrect current password.');
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleLoadDemo = async () => {
    setDemoLoading(true);
    setDemoSuccess('');
    setDemoError('');
    try {
      const res = await fetch(`${API_URL}/demo/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDemoSuccess('Demo session successfully seeded! Go to Dashboard to check.');
      } else {
        setDemoError(data.error || 'Failed to seed demo data.');
      }
    } catch (err) {
      setDemoError('Could not connect to the server.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleClearDemo = async () => {
    setDemoLoading(true);
    setDemoSuccess('');
    setDemoError('');
    try {
      const res = await fetch(`${API_URL}/demo/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setDemoSuccess('All temporary demo records successfully cleared.');
      } else {
        setDemoError(data.error || 'Failed to clear demo data.');
      }
    } catch (err) {
      setDemoError('Could not connect to the server.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm(
      'WARNING: Are you sure you want to permanently delete your account? This action is irreversible and will delete all your uploads and reports.'
    );
    if (!confirmation) return;

    const doubleConfirmation = window.prompt(
      'Type "DELETE MY ACCOUNT" to confirm deletion:'
    );
    if (doubleConfirmation !== 'DELETE MY ACCOUNT') {
      alert('Confirmation text did not match. Account deletion cancelled.');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/user/delete-account`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('Your account has been deleted successfully.');
        logout();
        navigate('/');
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete account.');
      }
    } catch (e) {
      console.error('Delete account error:', e);
      alert('Failed to connect to server.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {[
          { id: 'profile',  label: 'Profile Info',    icon: <User className="h-3.5 w-3.5" /> },
          { id: 'security', label: 'Security',         icon: <Key className="h-3.5 w-3.5" /> },
          { id: 'danger',   label: 'Account',          icon: <ShieldAlert className="h-3.5 w-3.5" /> },
          { id: 'activity', label: 'Activity',         icon: <Activity className="h-3.5 w-3.5" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-1.5 px-5 py-3 text-xs font-extrabold transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Activity Log
            </h3>
            <select
              value={activityFilter}
              onChange={e => setActivityFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none"
            >
              <option value="all">All Activity</option>
              <option value="uploads">Uploads</option>
              <option value="reports">Reports</option>
              <option value="account">Account Changes</option>
              <option value="logins">Logins</option>
            </select>
          </div>

          {activityLoading ? (
            <div className="glass-panel border rounded-2xl p-10 text-center">
              <div className="h-6 w-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : activities.length === 0 ? (
            <div className="glass-panel border rounded-2xl p-10 text-center text-sm text-slate-400">
              No activity recorded yet. Start by uploading a fabric swatch.
            </div>
          ) : (
            <div className="glass-panel border rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
              {activities
                .filter(a => {
                  if (activityFilter === 'all') return true;
                  if (activityFilter === 'uploads') return a.title?.toLowerCase().includes('upload') || a.message?.toLowerCase().includes('upload');
                  if (activityFilter === 'reports') return a.title?.toLowerCase().includes('report') || a.title?.toLowerCase().includes('analysis');
                  if (activityFilter === 'account') return a.title?.toLowerCase().includes('plan') || a.title?.toLowerCase().includes('profile') || a.title?.toLowerCase().includes('password');
                  if (activityFilter === 'logins') return a.title?.toLowerCase().includes('login') || a.title?.toLowerCase().includes('sign');
                  return true;
                })
                .map((a: any, i: number) => {
                  const Icon = a.title?.toLowerCase().includes('upload') ? UploadCloud
                    : a.title?.toLowerCase().includes('report') || a.title?.toLowerCase().includes('analysis') ? FileText
                    : a.title?.toLowerCase().includes('plan') || a.title?.toLowerCase().includes('subscription') ? CreditCard
                    : a.title?.toLowerCase().includes('login') ? LogOut
                    : Activity;
                  return (
                    <div key={a.id || i} className={`flex items-start gap-4 px-5 py-4 ${
                      !a.is_read ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''
                    }`}>
                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-slate-800 dark:text-white">{a.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{a.message}</p>
                      </div>
                      <div className="text-[10px] text-slate-400 flex-shrink-0 text-right">
                        {new Date(a.created_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                        <br />
                        {new Date(a.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              }
            </div>
          )}
        </div>
      )}

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <User className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-sm">Personal Information</h3>
            </div>

            {profileError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-bold text-slate-500 block">Full Name *</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Daksh Kumar"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Email (Read Only) */}
              <div className="space-y-1 opacity-70">
                <label className="text-xs font-bold text-slate-500 block">Email Address (Cannot change)</label>
                <input
                  type="email"
                  readOnly
                  value={user?.email}
                  className="w-full px-4 py-2 bg-slate-200 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-lg text-xs cursor-not-allowed"
                />
              </div>

              {/* Company */}
              <div className="space-y-1">
                <label htmlFor="company" className="text-xs font-bold text-slate-500 block">Company Name</label>
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Loom & Weave Textiles"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Avatar URL */}
              <div className="space-y-1">
                <label htmlFor="avatar" className="text-xs font-bold text-slate-500 block">Avatar Image URL</label>
                <input
                  id="avatar"
                  type="text"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.png"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Save Button */}
              <button
                type="submit"
                disabled={loadingProfile}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow"
              >
                {loadingProfile ? 'Saving Changes...' : 'Save Profile Details'}
              </button>
            </form>
          </div>

          {/* Demo Data Management Card */}
          <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Activity className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-sm">Demo Session Controls</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Need to showcase ThreadCounty with populated data? Generate 6 realistic mock fabric analyses and reports spread over 15 days. Demo data will be automatically cleaned up after 24 hours.
            </p>
            {demoSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{demoSuccess}</span>
              </div>
            )}
            {demoError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{demoError}</span>
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleLoadDemo}
                disabled={demoLoading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg text-xs transition-all shadow cursor-pointer"
              >
                {demoLoading ? 'Processing...' : 'Seed Sandbox Demo Data'}
              </button>
              <button
                onClick={handleClearDemo}
                disabled={demoLoading}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold rounded-lg text-xs transition-all cursor-pointer"
              >
                Clear All Demo Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Key className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-sm">Security & Password</h3>
            </div>

            {passwordError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Current PW */}
              <div className="space-y-1">
                <label htmlFor="curr-pw" className="text-xs font-bold text-slate-500 block">Current Password</label>
                <input
                  id="curr-pw"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* New PW */}
              <div className="space-y-1">
                <label htmlFor="new-pwd" className="text-xs font-bold text-slate-500 block">New Password</label>
                <input
                  id="new-pwd"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Confirm New PW */}
              <div className="space-y-1">
                <label htmlFor="conf-pw" className="text-xs font-bold text-slate-500 block">Confirm New Password</label>
                <input
                  id="conf-pw"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loadingPassword}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition-all shadow"
              >
                {loadingPassword ? 'Changing Password...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Account Tab (Danger Zone) */}
      {activeTab === 'danger' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="border border-rose-500/20 bg-rose-50/5 dark:bg-rose-950/10 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-rose-200 dark:border-rose-900/40">
              <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              <h3 className="font-bold text-sm text-rose-600 dark:text-rose-400">Danger Zone</h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Deleting your account will permanently wipe all uploaded fabric image swatches, generated thread density reports, and profile records from ThreadCounty. This cannot be undone.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition-all shadow shadow-rose-600/10"
            >
              Delete My Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ProfilePage;
