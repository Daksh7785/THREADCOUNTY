import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Eye, X, ChevronDown } from 'lucide-react';

const API = 'http://localhost:5000';

const STATUS_COLORS: Record<string, string> = {
  completed:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  processing: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
  pending:    'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
  failed:     'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
};

export const AdminUploads: React.FC = () => {
  const { token } = useAuth();
  const [uploads, setUploads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUploads();
  }, [token]);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      // Fetch all reports from admin endpoint — each report has an upload record
      const res = await fetch(`${API}/api/admin/reports?page=1&limit=100`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      // Transform reports into upload-centric view
      const uploadRecords = (data.reports || []).map((r: any) => ({
        id: r.id,
        file_name: r.upload?.original_name || 'Unknown',
        uploader: r.user?.name || r.user?.email || 'Unknown User',
        uploader_email: r.user?.email || '',
        file_size: r.upload?.file_size || 0,
        status: 'completed',
        uploaded_at: r.created_at,
        thumbnail: r.upload?.file_path,
        report_id: r.id
      }));
      setUploads(uploadRecords);
    } catch (err) {
      console.error('Failed to load uploads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this upload and its associated report? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/api/admin/reports/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setUploads(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      alert('Failed to delete upload.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const filtered = uploads.filter(u => {
    const matchSearch =
      u.file_name.toLowerCase().includes(search.toLowerCase()) ||
      u.uploader.toLowerCase().includes(search.toLowerCase()) ||
      u.uploader_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading">Upload Inbox</h2>
          <p className="text-xs text-slate-500 mt-0.5">Raw uploaded fabric images — before analysis</p>
        </div>
        <div className="text-xs font-bold text-slate-500">{filtered.length} uploads</div>
      </div>

      {/* Filters */}
      <div className="glass-panel border rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename or uploader…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel border rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <div className="h-7 w-7 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading uploads…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">No uploads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Thumbnail</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Filename</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Uploader</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Size</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Uploaded</th>
                  <th className="text-right px-4 py-3 font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      {u.thumbnail ? (
                        <img
                          src={`${API}/${u.thumbnail}`}
                          alt={u.file_name}
                          className="h-10 w-14 rounded-lg object-cover border border-slate-200 dark:border-slate-700 cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => setPreviewUrl(`${API}/${u.thumbnail}`)}
                        />
                      ) : (
                        <div className="h-10 w-14 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-400 text-[9px]">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-white max-w-[180px] truncate">{u.file_name}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[140px]">{u.uploader}</p>
                      <p className="text-slate-400 text-[10px] truncate">{u.uploader_email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatBytes(u.file_size)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${STATUS_COLORS[u.status] || STATUS_COLORS.pending}`}>
                        {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(u.uploaded_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {u.thumbnail && (
                        <button
                          onClick={() => setPreviewUrl(`${API}/${u.thumbnail}`)}
                          className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-500 transition-all"
                          title="View full image"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u.id)}
                        disabled={deletingId === u.id}
                        className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-500 transition-all"
                        title="Delete upload + report"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Image Preview Modal */}
      {previewUrl && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-4 -right-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-full p-1.5 z-10 shadow-lg hover:bg-rose-50"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={previewUrl}
              alt="Full preview"
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUploads;
