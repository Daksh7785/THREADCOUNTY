import { API_URL, API } from '../config';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users, 
  UploadCloud, 
  FileText, 
  MessageSquare, 
  Trash2, 
  ShieldAlert, 
  Mail
} from 'lucide-react';
import AdminUploads from './AdminUploads';
import AdminSettings from './AdminSettings';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'inquiries' | 'uploads' | 'settings'>('users');

  useEffect(() => {
    if (token) {
      loadAdminData();
    }
  }, [token]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // 1. Load Stats
      const statsRes = await fetch(`${API_URL}/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // 2. Load Users
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData);
      }

      // 3. Load Contact Messages
      const msgRes = await fetch(`${API_URL}/contact`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (msgRes.ok) {
        const msgData = await msgRes.json();
        setInquiries(msgData);
      }

    } catch (err) {
      console.error('Error loading admin control panel data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Are you sure you want to change this user's role to ${nextRole}?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole })
      });

      if (res.ok) {
        setUsersList(prev => 
          prev.map(u => u.id === userId ? { ...u, role: nextRole } : u)
        );
        loadAdminData(); // Refresh aggregate counts
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to modify role.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlanChange = async (userId: string, plan: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ plan })
      });

      if (res.ok) {
        setUsersList(prev => 
          prev.map(u => u.id === userId ? { ...u, plan } : u)
        );
        loadAdminData(); // Refresh aggregate counts
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to modify plan.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete this user and all their fabric uploads and reports? This cannot be undone.')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
        loadAdminData(); // Refresh aggregate counts
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete user.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !stats) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-semibold">Updating administrative catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Ribbon */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-50/10 dark:bg-indigo-950/10 flex gap-3 text-xs items-center">
        <ShieldAlert className="h-5 w-5 text-indigo-500 flex-shrink-0" />
        <p className="text-slate-600 dark:text-slate-300">
          <span className="font-bold">Administrative Console:</span> You are logged in as <span className="font-semibold underline">{user?.name}</span>. You can manage roles, subscription overrides, and inspect contact records.
        </p>
      </div>

      {/* Platform Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats.totalUsers}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            Free: {stats.activePlans.Free} | Student: {stats.activePlans.Student} | Pro: {stats.activePlans.Professional}
          </div>
        </div>

        {/* Total Uploads */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Images</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats.totalUploads}</h3>
            </div>
            <div className="p-2.5 bg-violet-50 dark:bg-violet-950/40 rounded-lg text-violet-600">
              <UploadCloud className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            Fabric swatch uploads in cloud storage
          </div>
        </div>

        {/* Total Reports */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QC Reports</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats.totalReports}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            AI analysis models compiled successfully
          </div>
        </div>

        {/* Contact messages */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Inquiries</span>
              <h3 className="text-3xl font-extrabold mt-1">{stats.totalMessages}</h3>
            </div>
            <div className="p-2.5 bg-pink-50 dark:bg-pink-950/40 rounded-lg text-pink-600">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-bold">
            Guest contact forms waiting response
          </div>
        </div>
      </div>

      {/* Tabs selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'users' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          User Directory ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-5 py-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'inquiries' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Contact Messages ({inquiries.length})
        </button>
        <button
          onClick={() => setActiveTab('uploads')}
          className={`px-5 py-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'uploads' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Upload Inbox
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3 text-xs font-extrabold transition-all border-b-2 ${
            activeTab === 'settings' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Settings
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'users' && (
        <div className="glass-panel border rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-sm mb-4">User Profiles & Subscription Control</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">User Details</th>
                  <th className="pb-3 font-semibold">Company</th>
                  <th className="pb-3 font-semibold text-center">Plan Tier</th>
                  <th className="pb-3 font-semibold text-center">System Role</th>
                  <th className="pb-3 font-semibold text-center">Storage Used</th>
                  <th className="pb-3 font-semibold">Joined Date</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold block">{u.name}</span>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-slate-500">{u.company || 'N/A'}</td>
                    
                    {/* Subscription changer */}
                    <td className="py-3 text-center">
                      <select
                        value={u.plan}
                        onChange={(e) => handlePlanChange(u.id, e.target.value)}
                        className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[11px] font-semibold cursor-pointer focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Free">Free</option>
                        <option value="Student">Student</option>
                        <option value="Professional">Professional</option>
                        <option value="Enterprise">Enterprise</option>
                      </select>
                    </td>

                    {/* Role changer */}
                    <td className="py-3 text-center">
                      <button
                        onClick={() => handleRoleChange(u.id, u.role)}
                        disabled={u.id === user?.id}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                          u.role === 'admin' 
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        } disabled:opacity-50`}
                      >
                        {u.role.toUpperCase()}
                      </button>
                    </td>

                    <td className="py-3 text-center font-semibold text-slate-500">
                      {(u.storage_used / (1024 * 1024)).toFixed(2)} MB
                    </td>
                    <td className="py-3 text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    
                    {/* Delete */}
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={u.id === user?.id}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 disabled:opacity-30"
                        title="Delete User Account"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="glass-panel border rounded-xl shadow-sm overflow-hidden p-5">
          <h3 className="font-bold text-sm mb-4">Support Requests & Contact Log</h3>

          {inquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              <Mail className="h-8 w-8 mx-auto text-slate-400 mb-2" />
              <p>No contact messages submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                    <th className="pb-3 font-semibold">Sender Details</th>
                    <th className="pb-3 font-semibold">Subject</th>
                    <th className="pb-3 font-semibold">Message Content</th>
                    <th className="pb-3 font-semibold">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {inquiries.map((msg) => (
                    <tr key={msg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="py-3">
                        <span className="font-bold block text-slate-800 dark:text-white">{msg.name}</span>
                        <span className="text-[10px] text-slate-400">{msg.email}</span>
                      </td>
                      <td className="py-3 font-semibold text-indigo-600 dark:text-indigo-400">{msg.subject}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300 max-w-sm whitespace-pre-wrap leading-relaxed">
                        {msg.message}
                      </td>
                      <td className="py-3 text-slate-400">
                        {new Date(msg.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'uploads' && <AdminUploads />}
      {activeTab === 'settings' && <AdminSettings />}
    </div>
  );
};
export default AdminDashboard;
