import { API_URL, API, getImageUrl } from '../config';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  UploadCloud, 
  HardDrive, 
  Clock, 
  ArrowUpRight,
  TrendingUp,
  FileText,
  FileBarChart
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [demoLoading, setDemoLoading] = useState(false);
  const [hasDemoData, setHasDemoData] = useState(false);

  useEffect(() => {
    if (token) {
      loadStats();
    }
  }, [token]);

  const loadStats = async () => {
    try {
      const res = await fetch(`${API_URL}/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        const hasDemo = data.recentReports?.some((r: any) => r.is_demo) || false;
        setHasDemoData(hasDemo);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch(`${API_URL}/demo/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        await loadStats();
      }
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleClearDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch(`${API_URL}/demo/clear`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        await loadStats();
      }
    } catch (err) {
      console.error('Error clearing demo data:', err);
    } finally {
      setDemoLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-semibold">Updating dashboard...</p>
        </div>
      </div>
    );
  }

  const { summary, recentReports, timeline, trends = [] } = stats;

  const points = trends.map((t: any, i: number) => {
    const x = 50 + i * (400 / 6);
    const clampedDensity = Math.max(0, Math.min(160, t.density));
    const y = 130 - (clampedDensity / 160) * 110;
    return { x, y, day: t.day, density: t.density };
  });

  const getPathD = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const cpX1 = curr.x + (next.x - curr.x) / 2;
      const cpY1 = curr.y;
      const cpX2 = curr.x + (next.x - curr.x) / 2;
      const cpY2 = next.y;
      d += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${next.x},${next.y}`;
    }
    return d;
  };

  const pathD = getPathD();

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const storagePercentage = Math.min(100, (summary.storageUsed / summary.storageLimit) * 100);

  return (
    <div className="space-y-6">
      {/* Welcome Card banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white relative overflow-hidden shadow-lg shadow-indigo-600/10">
        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back, {user?.name}!</h2>
          <p className="text-indigo-100 text-sm max-w-xl">
            You are currently on the <span className="font-bold underline">{summary.plan} Plan</span>. Ready to scan? Drag and drop fabric swatches to count density instantly.
          </p>
        </div>
        <div className="absolute right-6 bottom-[-20px] opacity-15 pointer-events-none">
          <FileBarChart className="h-44 w-44" />
        </div>
      </div>

      {/* Demo Data Control Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 dark:border-indigo-950/40 dark:bg-indigo-950/20 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-pulse"></span>
          <p className="text-slate-600 dark:text-slate-300">
            {hasDemoData ? (
              <>
                <strong>Demo Session Active:</strong> 6 realistic fabric reports are seeded. They will auto-expire and purge in 24 hours.
              </>
            ) : (
              <>
                <strong>Showcase Mode:</strong> Initialize the dashboard with a set of 6 preloaded fabric scans to experience the platform instantly.
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleLoadDemo}
            disabled={demoLoading}
            className="flex-1 sm:flex-none px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-lg transition-colors shadow-sm text-xs cursor-pointer"
          >
            {demoLoading ? 'Processing...' : hasDemoData ? 'Regenerate Demo' : 'Load Demo Data'}
          </button>
          {hasDemoData && (
            <button
              onClick={handleClearDemo}
              disabled={demoLoading}
              className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-bold rounded-lg transition-colors text-xs cursor-pointer"
            >
              Clear Demo
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Uploads */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Uploads</span>
              <h3 className="text-3xl font-extrabold mt-1">{summary.totalUploads}</h3>
            </div>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg text-indigo-600 dark:text-indigo-400">
              <UploadCloud className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-semibold">
            <Clock className="h-3.5 w-3.5" />
            <span>Updates in real-time</span>
          </div>
        </div>

        {/* Total Reports */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">QC Reports</span>
              <h3 className="text-3xl font-extrabold mt-1">{summary.totalReports}</h3>
            </div>
            <div className="p-2.5 bg-violet-50 dark:bg-violet-950/40 rounded-lg text-violet-600 dark:text-violet-400">
              <FileText className="h-5 w-5" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>100% processed successfully</span>
          </div>
        </div>

        {/* Storage Quota */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4 sm:col-span-2">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cloud Storage Quota</span>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold">{formatBytes(summary.storageUsed)}</h3>
                <span className="text-xs text-slate-500">/ {formatBytes(summary.storageLimit)}</span>
              </div>
            </div>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-600 dark:text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          
          <div className="space-y-1.5">
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-bold">
              <span>{storagePercentage.toFixed(1)}% Used</span>
              <span>Remaining: {formatBytes(summary.storageLimit - summary.storageUsed)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Charts / Right Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Line Chart */}
        <div className="lg:col-span-2 glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base">Thread Analysis Trends</h3>
              <p className="text-xs text-slate-500">Overview of recent fabric scans by density TPI</p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-md">Weekly Metrics</span>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="relative h-48 w-full flex items-end">
            {/* Y Axis Guides */}
            <div className="absolute inset-y-0 left-0 w-full flex flex-col justify-between pointer-events-none text-[10px] text-slate-400">
              <div className="border-b border-slate-100 dark:border-slate-800/40 w-full text-right pr-2">160 TPI</div>
              <div className="border-b border-slate-100 dark:border-slate-800/40 w-full text-right pr-2">120 TPI</div>
              <div className="border-b border-slate-100 dark:border-slate-800/40 w-full text-right pr-2">80 TPI</div>
              <div className="border-b border-slate-100 dark:border-slate-800/40 w-full text-right pr-2">40 TPI</div>
            </div>

            {/* SVG Line Graph */}
            <svg className="w-full h-full pt-4 pb-2 z-10" viewBox="0 0 500 150">
              {/* Grid Lines */}
              <line x1="50" y1="10" x2="450" y2="10" stroke="rgba(148, 163, 184, 0.05)" strokeDasharray="4" />
              <line x1="50" y1="50" x2="450" y2="50" stroke="rgba(148, 163, 184, 0.05)" strokeDasharray="4" />
              <line x1="50" y1="90" x2="450" y2="90" stroke="rgba(148, 163, 184, 0.05)" strokeDasharray="4" />
              <line x1="50" y1="130" x2="450" y2="130" stroke="rgba(148, 163, 184, 0.05)" strokeDasharray="4" />

              {/* Glowing gradient definitions */}
              <defs>
                <linearGradient id="chart-glow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
              </defs>

              {/* Data Path Line */}
              {pathD && (
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#chart-glow)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Dots on nodes */}
              {points.map((p, idx) => {
                const colors = ['#4f46e5', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#22c55e'];
                return (
                  <g key={idx} className="group/node cursor-pointer">
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill={colors[idx % colors.length]}
                      stroke="white"
                      strokeWidth="1.5"
                      className="transition-all duration-200 hover:r-7"
                    />
                    <title>{`${p.day}: ${p.density} TPI`}</title>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-bold px-2 pt-1">
            {points.map((p, idx) => (
              <span key={idx} className="w-8 text-center">{p.day}</span>
            ))}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base">Activity Timeline</h3>
            <p className="text-xs text-slate-500">Recent workspace occurrences</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-56 pr-1">
            {timeline.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8">No activity logged.</div>
            ) : (
              timeline.map((evt: any) => (
                <div key={evt.id} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-100 dark:ring-indigo-950/40"></div>
                    <div className="w-[1px] flex-1 bg-slate-200 dark:bg-slate-800 mt-1"></div>
                  </div>
                  <div className="space-y-0.5 pb-2">
                    <span className="font-semibold block text-slate-800 dark:text-white">{evt.title}</span>
                    <p className="text-slate-500 dark:text-slate-400">{evt.description}</p>
                    <span className="text-[10px] text-slate-400 block">
                      {new Date(evt.timestamp).toLocaleDateString()} at {new Date(evt.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">Recent Analysis Reports</h3>
            <p className="text-xs text-slate-500">Your latest textile inspection results</p>
          </div>
          <Link 
            to="/history" 
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center text-sm text-slate-500">
            <UploadCloud className="h-10 w-10 mx-auto text-slate-400 mb-3" />
            <p className="font-semibold mb-1">No fabric scans yet</p>
            <p className="text-xs text-slate-400 mb-4">Upload fabric swatches to generate warp and weft counts.</p>
            <Link to="/upload" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm shadow-indigo-600/15">
              Upload First Fabric
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold">
                  <th className="pb-3 font-semibold">Image Thumbnail</th>
                  <th className="pb-3 font-semibold">Fabric Type</th>
                  <th className="pb-3 font-semibold text-center">Warp Count</th>
                  <th className="pb-3 font-semibold text-center">Weft Count</th>
                  <th className="pb-3 font-semibold text-center">TPI Density</th>
                  <th className="pb-3 font-semibold text-center">AI Confidence</th>
                  <th className="pb-3 font-semibold">Inspection Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {recentReports.map((rep: any) => (
                  <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    <td className="py-3">
                      {rep.upload ? (
                        <img 
                          src={getImageUrl(rep.upload.file_path)} 
                          alt={rep.upload.original_name} 
                          className="h-10 w-12 rounded object-cover border border-slate-200 dark:border-slate-800"
                        />
                      ) : (
                        <div className="h-10 w-12 rounded bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800"></div>
                      )}
                    </td>
                    <td className="py-3 font-semibold">
                      {rep.fabric_type}
                      {rep.is_demo && (
                        <span className="ml-2 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[9px] uppercase tracking-wider">
                          Demo
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-center">{rep.warp_count}</td>
                    <td className="py-3 text-center">{rep.weft_count}</td>
                    <td className="py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">{rep.thread_density}</td>
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        rep.confidence >= 0.95 
                          ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400'
                      }`}>
                        {(rep.confidence * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3 text-slate-500">{new Date(rep.created_at).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <button 
                        onClick={() => navigate(`/report/${rep.id}`)}
                        className="px-3 py-1.5 rounded bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold hover:text-indigo-600 text-[11px]"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
