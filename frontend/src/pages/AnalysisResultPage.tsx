import { API_URL, API } from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Download, 
  Share2, 
  Check, 
  Binary, 
  Activity, 
  Grid,
  Info,
  ChevronLeft
} from 'lucide-react';

export const AnalysisResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScannerGrid, setShowScannerGrid] = useState(true);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (token && id) {
      loadReport();
    }
  }, [token, id]);

  const loadReport = async () => {
    try {
      const res = await fetch(`${API_URL}/report/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const reportData = await res.json();
        setData(reportData);
      }
    } catch (err) {
      console.error('Error fetching report details:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    const sharableUrl = `${window.location.origin}/report/${id}`;
    navigator.clipboard.writeText(sharableUrl);
    setShareCopied(true);
    setTimeout(() => {
      setShareCopied(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-semibold">Retrieving inspection data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 space-y-4">
        <h3 className="text-lg font-bold">Report not found</h3>
        <p className="text-sm text-slate-500">The report you are looking for does not exist or has been deleted.</p>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const { report, upload } = data;

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold transition-all">
          <ChevronLeft className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>

        {/* Action Header */}
        <div className="flex gap-2">
          {/* Share */}
          <button 
            onClick={copyShareLink}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
          >
            {shareCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
            <span>{shareCopied ? 'Link Copied' : 'Share Report'}</span>
          </button>

          {/* Download Print/PDF View */}
          <a
            href={`${API_URL}/report/${report.id}/download?format=pdf&token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow shadow-indigo-600/10"
          >
            <Download className="h-4 w-4" />
            <span>Download Report</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Left Swatch Scan, Right Density Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Visual Swatch Grid Overlay */}
        <div className="glass-panel border rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base">Fabric Swatch Scan</h3>
              <p className="text-xs text-slate-500">{upload?.original_name || 'Fabric Swatch'}</p>
            </div>
            {/* Toggle Overlay Grid Button */}
            <button 
              onClick={() => setShowScannerGrid(!showScannerGrid)}
              className={`p-2 rounded-lg border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showScannerGrid 
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <Grid className="h-4 w-4" />
              <span>{showScannerGrid ? 'Scanner Overlay Active' : 'Show Scanner Overlay'}</span>
            </button>
          </div>

          {/* Scan Box Container */}
          <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 relative flex items-center justify-center">
            {upload ? (
              <img 
                src={`${API}/${upload.file_path}`} 
                alt={upload.original_name} 
                className="h-full w-full object-cover" 
              />
            ) : (
              <div className="text-slate-500 text-xs">Image unavailable</div>
            )}
            
            {showScannerGrid && (
              <>
                <div className="absolute inset-0 analysis-grid-overlay opacity-60"></div>
                <div className="absolute inset-x-0 scanning-line pointer-events-none"></div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider justify-center">
            <Info className="h-3.5 w-3.5 text-slate-400" />
            <span>Mouse over the preview to verify coordinate details</span>
          </div>
        </div>

        {/* Right Column: Density metrics & Suggestions */}
        <div className="space-y-6">
          {/* Quick Metrics cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* Fabric Type */}
            <div className="glass-panel border rounded-xl p-4 shadow-sm flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fabric Type</span>
              <h3 className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400 truncate mt-1">{report.fabric_type}</h3>
              <span className="text-[10px] text-slate-400 font-bold">Structural classification</span>
            </div>

            {/* Confidence */}
            <div className="glass-panel border rounded-xl p-4 shadow-sm flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence</span>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{(report.confidence * 100).toFixed(1)}%</h3>
              <span className="text-[10px] text-slate-400 font-bold">Analysis certainty score</span>
            </div>

            {/* Warp */}
            <div className="glass-panel border rounded-xl p-4 shadow-sm flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Warp Thread Count</span>
              <h3 className="text-2xl font-extrabold mt-1">{report.warp_count} <span className="text-xs text-slate-400 font-normal">TPI</span></h3>
              <span className="text-[10px] text-slate-400 font-bold">Vertical (longitudinal) yarn</span>
            </div>

            {/* Weft */}
            <div className="glass-panel border rounded-xl p-4 shadow-sm flex flex-col justify-between h-28">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Weft Thread Count</span>
              <h3 className="text-2xl font-extrabold mt-1">{report.weft_count} <span className="text-xs text-slate-400 font-normal">TPI</span></h3>
              <span className="text-[10px] text-slate-400 font-bold">Horizontal (transverse) yarn</span>
            </div>
          </div>

          {/* Combined Density Card */}
          <div className="glass-panel border border-indigo-500/20 rounded-xl p-5 shadow-sm bg-indigo-50/10 dark:bg-indigo-950/10 flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">Combined Thread Density</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white">
                {report.thread_density} <span className="text-base font-normal text-slate-500">Threads / Inch²</span>
              </h2>
            </div>
            <div className="p-3 bg-indigo-600 text-white rounded-xl shadow-md">
              <Binary className="h-6 w-6" />
            </div>
          </div>

          {/* AI QC recommendations */}
          <div className="glass-panel border rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
              <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm">AI Quality Control Recommendations</h3>
            </div>

            <ul className="space-y-3">
              {report.suggestions.map((suggestion: string, idx: number) => (
                <li key={idx} className="text-xs leading-relaxed flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 flex-shrink-0 mt-1.5"></span>
                  <span className="text-slate-600 dark:text-slate-300">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AnalysisResultPage;
