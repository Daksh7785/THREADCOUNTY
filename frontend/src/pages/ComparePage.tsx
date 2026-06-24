import { API } from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GitCompareArrows,
  ChevronDown,
  UploadCloud,
  ArrowLeftRight,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Info,
  Download,
  Zap,
  Grid
} from 'lucide-react';

// ─── helpers ─────────────────────────────────────────────────────────────────



const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

// Returns a coloured delta indicator
const Delta: React.FC<{ a: number; b: number; label: string; unit?: string }> = ({
  a, b, unit = ''
}) => {
  const diff = b - a;
  const pct = a === 0 ? 0 : Math.abs((diff / a) * 100);

  if (Math.abs(diff) < 0.001) {
    return (
      <span className="inline-flex items-center gap-1 text-slate-400 text-[10px] font-bold">
        <Minus className="h-3 w-3" /> Equal
      </span>
    );
  }
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
        <TrendingUp className="h-3 w-3" />+{pct.toFixed(1)}% {unit}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-rose-500 text-[10px] font-bold">
      <TrendingDown className="h-3 w-3" />{pct.toFixed(1)}% {unit}
    </span>
  );
};

// Horizontal bar used for visual comparison
const Bar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => (
  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
    <div
      className={`h-full rounded-full transition-all duration-700 ${color}`}
      style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
    />
  </div>
);

// ─── Report Picker dropdown ───────────────────────────────────────────────────

interface PickerProps {
  reports: any[];
  selected: any | null;
  onSelect: (r: any) => void;
  side: 'A' | 'B';
  locked?: any | null; // the other side's selection (can't pick same)
}

const ReportPicker: React.FC<PickerProps> = ({ reports, selected, onSelect, side, locked }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const accentA = 'from-indigo-500 to-violet-600';
  const accentB = 'from-emerald-500 to-teal-600';
  const accent = side === 'A' ? accentA : accentB;
  const borderColor = side === 'A'
    ? 'border-indigo-400 dark:border-indigo-700'
    : 'border-emerald-400 dark:border-emerald-700';
  const activeBg = side === 'A'
    ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400'
    : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400';

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const available = reports.filter(r => r.id !== locked?.id);

  return (
    <div ref={ref} className="relative flex-1">
      {/* Label pill */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold text-white mb-2 bg-gradient-to-r ${accent}`}>
        <span>Swatch {side}</span>
      </div>

      {/* Trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl border-2 bg-white dark:bg-slate-900 text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
          selected ? borderColor : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        {selected ? (
          <div className="flex items-center gap-3 min-w-0">
            {selected.upload && (
              <img
                src={`${API}/${selected.upload.file_path}`}
                alt=""
                className="h-9 w-12 rounded-lg object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
              />
            )}
            <div className="min-w-0 text-left">
              <p className="font-bold text-slate-800 dark:text-white truncate text-xs">
                {selected.upload?.original_name || 'Fabric Swatch'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">{selected.fabric_type}</p>
            </div>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">Click to choose a fabric report…</span>
        )}
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full mt-2 left-0 right-0 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {available.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">No other reports available.</div>
          ) : (
            available.map(rep => (
              <button
                key={rep.id}
                onClick={() => { onSelect(rep); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors text-left border-b last:border-0 border-slate-100 dark:border-slate-800 ${
                  selected?.id === rep.id ? activeBg : ''
                }`}
              >
                {rep.upload && (
                  <img
                    src={`${API}/${rep.upload.file_path}`}
                    alt=""
                    className="h-9 w-12 rounded object-cover flex-shrink-0 border border-slate-200 dark:border-slate-700"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 dark:text-white truncate text-xs">
                    {rep.upload?.original_name || 'Fabric Swatch'}
                  </p>
                  <p className="text-[10px] text-slate-500">{rep.fabric_type} — {rep.thread_density} TPI</p>
                </div>
                {selected?.id === rep.id && <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// ─── Swatch Viewer ────────────────────────────────────────────────────────────

const SwatchViewer: React.FC<{ report: any; side: 'A' | 'B' }> = ({ report, side }) => {
  const [overlay, setOverlay] = useState(true);
  const borderGrad = side === 'A'
    ? 'border-indigo-500/30'
    : 'border-emerald-500/30';
  const badgeColor = side === 'A'
    ? 'bg-indigo-600'
    : 'bg-emerald-600';

  return (
    <div className={`glass-panel border ${borderGrad} rounded-2xl overflow-hidden shadow-md flex flex-col`}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-slate-950 flex items-center justify-center">
        {report.upload ? (
          <img
            src={`${API}/${report.upload.file_path}`}
            alt={report.upload.original_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="text-slate-500 text-xs">Image unavailable</div>
        )}

        {overlay && (
          <>
            <div className="absolute inset-0 analysis-grid-overlay opacity-50 pointer-events-none" />
            <div className="absolute inset-x-0 scanning-line pointer-events-none" />
          </>
        )}

        {/* Side badge */}
        <div className={`absolute top-3 left-3 ${badgeColor} text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow`}>
          Swatch {side}
        </div>

        {/* Confidence badge */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-white/10 text-emerald-400 text-[10px] font-extrabold px-2.5 py-1 rounded-full">
          {(report.confidence * 100).toFixed(0)}% AI
        </div>

        {/* Toggle overlay */}
        <button
          onClick={() => setOverlay(p => !p)}
          className="absolute bottom-3 right-3 bg-slate-950/70 backdrop-blur-sm border border-white/10 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 hover:bg-slate-800 transition-all"
        >
          <Grid className="h-3 w-3" />
          {overlay ? 'Hide Grid' : 'Show Grid'}
        </button>
      </div>

      {/* Quick metrics */}
      <div className="p-4 space-y-2">
        <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider truncate">
          {report.upload?.original_name || 'Fabric Swatch'}
        </p>
        <h3 className={`font-extrabold text-sm ${side === 'A' ? 'text-indigo-600 dark:text-indigo-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {report.fabric_type}
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          {[
            { label: 'Warp', value: report.warp_count },
            { label: 'Weft', value: report.weft_count },
            { label: 'Density', value: report.thread_density }
          ].map(m => (
            <div key={m.label} className="bg-slate-50 dark:bg-slate-800/40 rounded-lg py-1.5">
              <span className="text-[9px] text-slate-400 block font-bold uppercase">{m.label}</span>
              <span className="font-extrabold text-slate-800 dark:text-white">{m.value}</span>
              <span className="text-[8px] text-slate-400"> TPI</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-slate-400">Scanned {formatDate(report.created_at)}</p>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export const ComparePage: React.FC = () => {
  const { token } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [repA, setRepA] = useState<any | null>(null);
  const [repB, setRepB] = useState<any | null>(null);
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    if (token) {
      fetch(`${API}/api/report/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.ok ? r.json() : [])
        .then(setReports)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [token]);

  const handleSwap = () => {
    setSwapped(p => !p);
    setRepA(repB);
    setRepB(repA);
  };

  const bothSelected = repA !== null && repB !== null;

  // Compute comparison stats when both are selected
  const maxDensity = bothSelected
    ? Math.max(repA.thread_density, repB.thread_density, 1) * 1.2
    : 200;

  const winner = bothSelected
    ? repA.thread_density >= repB.thread_density ? 'A' : 'B'
    : null;

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-semibold">Loading fabric reports…</p>
        </div>
      </div>
    );
  }

  if (reports.length < 2) {
    return (
      <div className="text-center py-20 space-y-4">
        <GitCompareArrows className="h-14 w-14 mx-auto text-slate-300 dark:text-slate-700" />
        <h3 className="text-lg font-extrabold">Not enough reports to compare</h3>
        <p className="text-sm text-slate-500 max-w-xs mx-auto">
          You need at least <strong>2</strong> analysis reports before you can use the comparison tool.
          Upload and scan another fabric swatch to get started.
        </p>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow shadow-indigo-600/20 transition-all"
        >
          <UploadCloud className="h-4 w-4" />
          Upload Fabric Swatch
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading flex items-center gap-2">
            <GitCompareArrows className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Fabric Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select two reports below to compare warp, weft, and thread density side-by-side
          </p>
        </div>
        {bothSelected && (
          <a
            href={`${API}/api/report/${repA.id}/download?format=pdf&token=${token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow shadow-indigo-600/10 transition-all"
          >
            <Download className="h-4 w-4" />
            Export Report A
          </a>
        )}
      </div>

      {/* ── Pickers row ── */}
      <div className="glass-panel border rounded-2xl p-5 shadow-sm">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Choose Two Fabric Reports
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
          <ReportPicker
            reports={reports}
            selected={repA}
            onSelect={setRepA}
            side="A"
            locked={repB}
          />

          {/* Swap button */}
          <button
            onClick={handleSwap}
            disabled={!bothSelected}
            title="Swap A and B"
            className={`flex-shrink-0 p-3 rounded-xl border transition-all ${
              bothSelected
                ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm'
                : 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-700 cursor-not-allowed'
            } ${swapped ? 'rotate-180' : ''} transition-transform duration-300`}
          >
            <ArrowLeftRight className="h-5 w-5" />
          </button>

          <ReportPicker
            reports={reports}
            selected={repB}
            onSelect={setRepB}
            side="B"
            locked={repA}
          />
        </div>
      </div>

      {/* ── Comparison content ── */}
      {!bothSelected ? (
        <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-16 text-center text-sm text-slate-400 bg-white/50 dark:bg-slate-900/30">
          <GitCompareArrows className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">Select both swatches above to see the comparison</p>
          <p className="text-xs mt-1 text-slate-400">The analysis panel will appear here automatically</p>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">

          {/* Winner banner */}
          <div className={`rounded-2xl p-5 border flex items-center gap-4 ${
            winner === 'A'
              ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
              : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
          }`}>
            <div className={`p-3 rounded-xl text-white ${winner === 'A' ? 'bg-indigo-600' : 'bg-emerald-600'}`}>
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Highest Thread Density</p>
              <h3 className={`font-extrabold text-base ${winner === 'A' ? 'text-indigo-700 dark:text-indigo-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                Swatch {winner} wins — {winner === 'A' ? repA.thread_density : repB.thread_density} TPI
              </h3>
              <p className="text-xs text-slate-500">
                {winner === 'A' ? repA.fabric_type : repB.fabric_type} · Scanned {formatDate(winner === 'A' ? repA.created_at : repB.created_at)}
              </p>
            </div>
          </div>

          {/* Swatches side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SwatchViewer report={repA} side="A" />
            <SwatchViewer report={repB} side="B" />
          </div>

          {/* Metric comparison table */}
          <div className="glass-panel border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-indigo-500" />
              <h3 className="font-bold text-base">Side-by-Side Metrics</h3>
            </div>

            {/* Header row */}
            <div className="grid grid-cols-[1fr_auto_1fr] gap-4 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-indigo-500">Swatch A</span>
              <span>Metric</span>
              <span className="text-emerald-500">Swatch B</span>
            </div>

            {/* Metric rows */}
            {[
              {
                label: 'Warp Count',
                a: repA.warp_count,
                b: repB.warp_count,
                unit: 'TPI',
                max: Math.max(repA.warp_count, repB.warp_count, 1) * 1.3
              },
              {
                label: 'Weft Count',
                a: repA.weft_count,
                b: repB.weft_count,
                unit: 'TPI',
                max: Math.max(repA.weft_count, repB.weft_count, 1) * 1.3
              },
              {
                label: 'Thread Density',
                a: repA.thread_density,
                b: repB.thread_density,
                unit: 'TPI',
                max: maxDensity
              },
              {
                label: 'AI Confidence',
                a: parseFloat((repA.confidence * 100).toFixed(1)),
                b: parseFloat((repB.confidence * 100).toFixed(1)),
                unit: '%',
                max: 100
              }
            ].map(row => (
              <div key={row.label} className="space-y-2">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* A side */}
                  <div className="text-right space-y-1">
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">{row.a} <span className="text-xs font-normal text-slate-400">{row.unit}</span></p>
                    <Delta a={row.b} b={row.a} label={row.label} unit={row.unit} />
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">{row.label}</span>
                  </div>

                  {/* B side */}
                  <div className="text-left space-y-1">
                    <p className="font-extrabold text-slate-800 dark:text-white text-sm">{row.b} <span className="text-xs font-normal text-slate-400">{row.unit}</span></p>
                    <Delta a={row.a} b={row.b} label={row.label} unit={row.unit} />
                  </div>
                </div>

                {/* Dual bars */}
                <div className="grid grid-cols-[1fr_28px_1fr] gap-2 items-center">
                  <div className="flex justify-end">
                    <div className="w-full max-w-[200px]">
                      <Bar value={row.a} max={row.max} color="bg-indigo-500" />
                    </div>
                  </div>
                  <div />
                  <div>
                    <Bar value={row.b} max={row.max} color="bg-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* AI Suggestions comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[{ rep: repA, side: 'A', color: 'indigo' }, { rep: repB, side: 'B', color: 'emerald' }].map(({ rep, side, color }) => (
              <div key={side} className={`glass-panel border border-${color}-500/20 rounded-2xl p-5 shadow-sm space-y-4`}>
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className={`w-2.5 h-2.5 rounded-full bg-${color}-500`} />
                  <h4 className="font-bold text-sm">Swatch {side} — AI Recommendations</h4>
                </div>
                <ul className="space-y-2.5">
                  {rep.suggestions.map((s: string, i: number) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs">
                      <span className={`w-1.5 h-1.5 rounded-full bg-${color}-500 flex-shrink-0 mt-1.5`} />
                      <span className="text-slate-600 dark:text-slate-300 leading-relaxed">{s}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={`${API}/api/report/${rep.id}/download?format=pdf&token=${token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 text-xs font-bold text-${color}-600 dark:text-${color}-400 hover:underline`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Full Report PDF
                </a>
              </div>
            ))}
          </div>

          {/* Fabric type callout */}
          <div className="glass-panel border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-slate-400" />
              <h4 className="font-bold text-sm">Weave Classification Summary</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 space-y-1">
                <p className="font-bold text-indigo-600 dark:text-indigo-400 text-[10px] uppercase tracking-wider">Swatch A Classification</p>
                <p className="font-extrabold text-slate-800 dark:text-white">{repA.fabric_type}</p>
                <p className="text-slate-500">{repA.thread_density} TPI total · {(repA.confidence * 100).toFixed(0)}% confidence</p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 space-y-1">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 text-[10px] uppercase tracking-wider">Swatch B Classification</p>
                <p className="font-extrabold text-slate-800 dark:text-white">{repB.fabric_type}</p>
                <p className="text-slate-500">{repB.thread_density} TPI total · {(repB.confidence * 100).toFixed(0)}% confidence</p>
              </div>
            </div>
            {repA.fabric_type === repB.fabric_type && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-2">
                <Info className="h-4 w-4 flex-shrink-0" />
                Both swatches are classified as the same weave type — density difference is likely due to yarn count or loom tension variation.
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default ComparePage;
