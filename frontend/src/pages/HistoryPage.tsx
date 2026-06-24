import { API_URL, API } from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Trash2, 
  Download, 
  Calendar,
  GitCompareArrows,
  Mic
} from 'lucide-react';


// ─── Voice Search Mic Button ──────────────────────────────────────────────────
// Uses the browser-native Web Speech API. Gracefully hidden in unsupported browsers.
const VoiceMicButton: React.FC<{ onTranscript: (text: string) => void }> = ({ onTranscript }) => {
  const [listening, setListening] = React.useState(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setListening(false);
    };

    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
  };

  return (
    <button
      onClick={startListening}
      disabled={listening}
      title={listening ? 'Listening…' : 'Search by voice'}
      className={`flex-shrink-0 p-2 rounded-lg border transition-all ${
        listening
          ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 animate-pulse'
          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 hover:text-indigo-500 hover:border-indigo-300'
      }`}
    >
      <Mic className="h-4 w-4" />
    </button>
  );
};

export const HistoryPage: React.FC = () => {
  const { token, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, density-desc, confidence-desc

  useEffect(() => {
    if (token) {
      loadReports();
    }
  }, [token]);

  const loadReports = async () => {
    try {
      const res = await fetch('${API_URL}/report/list', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid navigating when clicking delete button
    
    if (!window.confirm('Are you sure you want to permanently delete this analysis report and its image file?')) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/report/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setReports(prev => prev.filter(r => r.id !== id));
        refreshUser();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete report.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Get unique fabric types for filter dropdown
  const fabricTypes = ['All', ...new Set(reports.map(r => r.fabric_type))];

  // Process search, filters, and sorting
  const processedReports = reports
    .filter(r => {
      const nameMatch = r.upload?.original_name.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const typeMatch = r.fabric_type.toLowerCase().includes(searchTerm.toLowerCase());
      const searchMatch = nameMatch || typeMatch;

      const typeFilterMatch = filterType === 'All' || r.fabric_type === filterType;

      return searchMatch && typeFilterMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === 'density-desc') {
        return b.thread_density - a.thread_density;
      }
      if (sortBy === 'confidence-desc') {
        return b.confidence - a.confidence;
      }
      return 0;
    });

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-semibold">Loading inspection history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading">Inspection History</h2>
          <p className="text-xs text-slate-500">Search and manage previous fabric analysis reports</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/compare"
            className="px-4 py-2.5 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold transition-all hover:bg-indigo-100 flex items-center gap-1.5"
          >
            <GitCompareArrows className="h-4 w-4" />
            <span>Compare Fabrics</span>
          </Link>
          <Link 
            to="/upload" 
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow shadow-indigo-600/10 flex items-center gap-1.5"
          >
            <span>Scan New Swatch</span>
          </Link>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="glass-panel border rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        {/* Search + Voice */}
        <div className="md:col-span-2 relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id="history-search"
              placeholder="Search by file name or weave type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>
          {/* Voice Search — only shown in supported browsers */}
          {typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) && (
            <VoiceMicButton onTranscript={setSearchTerm} />
          )}
        </div>

        {/* Filter type */}
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer font-semibold"
          >
            {fabricTypes.map(t => (
              <option key={t} value={t}>{t === 'All' ? 'All Weave Styles' : t}</option>
            ))}
          </select>
        </div>

        {/* Sort select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:border-indigo-500 transition-colors appearance-none cursor-pointer font-semibold"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="density-desc">Sort: Density (High to Low)</option>
            <option value="confidence-desc">Sort: Confidence (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Reports Listing */}
      {processedReports.length === 0 ? (
        <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-sm text-slate-500 bg-white dark:bg-slate-900/40">
          <Search className="h-10 w-10 mx-auto text-slate-400 mb-3" />
          <p className="font-semibold mb-1">No reports match your filters</p>
          <p className="text-xs text-slate-400">Try modifying your search keywords or adjusting sorting values.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedReports.map((rep) => (
            <div 
              key={rep.id} 
              onClick={() => navigate(`/report/${rep.id}`)}
              className="glass-panel border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col justify-between"
            >
              {/* Card Thumbnail */}
              <div className="aspect-[4/3] w-full bg-slate-950 relative overflow-hidden flex items-center justify-center border-b">
                {rep.upload ? (
                  <img 
                    src={`${API}/${rep.upload.file_path}`} 
                    alt={rep.upload.original_name} 
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                ) : (
                  <div className="text-slate-500 text-xs">Image unavailable</div>
                )}
                
                {/* Confidence Badge overlay */}
                <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-emerald-400">
                  {(rep.confidence * 100).toFixed(0)}% AI Conf.
                </div>
              </div>

              {/* Card Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider block">
                    {rep.fabric_type}
                  </span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white truncate" title={rep.upload?.original_name}>
                    {rep.upload?.original_name || 'Fabric Inspection'}
                  </h4>
                </div>

                {/* Density numbers */}
                <div className="grid grid-cols-3 gap-2 border-y border-slate-100 dark:border-slate-800/40 py-2.5 text-center text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Warp</span>
                    <span className="font-bold text-slate-800 dark:text-white">{rep.warp_count} TPI</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold uppercase">Weft</span>
                    <span className="font-bold text-slate-800 dark:text-white">{rep.weft_count} TPI</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-indigo-500 dark:text-indigo-400 block font-bold uppercase">Total</span>
                    <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{rep.thread_density} TPI</span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                  </span>

                  <div className="flex gap-1">
                    {/* Download */}
                    <a 
                      href={`${API_URL}/report/${rep.id}/download?format=json&token=${token}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      title="Download JSON Data"
                    >
                      <Download className="h-4.5 w-4.5" />
                    </a>

                    {/* Delete */}
                    <button 
                      onClick={(e) => handleDelete(rep.id, e)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      title="Delete Report"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default HistoryPage;
