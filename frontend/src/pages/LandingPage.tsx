import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cpu, 
  Binary, 
  BarChart3, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [densityDemoVal, setDensityDemoVal] = useState(65);

  const stats = [
    { value: '98.7%', label: 'AI Accuracy Rate' },
    { value: '1.2s', label: 'Analysis Speed' },
    { value: '500k+', label: 'Fabrics Scanned' },
    { value: '300+', label: 'Global Mills Using' },
  ];

  const features = [
    {
      icon: <Binary className="h-6 w-6 text-indigo-500" />,
      title: 'Automated Thread Density',
      desc: 'Count warp and weft threads per inch or centimeter in seconds using high-resolution computer vision algorithms.',
    },
    {
      icon: <Cpu className="h-6 w-6 text-violet-500" />,
      title: 'Weave Structure Identification',
      desc: 'Automatically classify weave styles including Plain, Twill, Satin, Basket, and Denim structures with AI confidence scores.',
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-emerald-500" />,
      title: 'Analytics & QC Insights',
      desc: 'Detect mispicks, tension variations, and structural irregularities to keep manufacturing lines within strict tolerances.',
    },
    {
      icon: <ShieldCheck className="h-6 w-6 text-blue-500" />,
      title: 'Exportable Quality Reports',
      desc: 'Download audit-ready PDF and JSON structure reports to share with operations teams, researchers, or buyers.',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Background decoration */}
      <div className="absolute inset-0 moving-grid-bg opacity-50 z-0"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-3xl z-0 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-15%] w-[600px] h-[600px] bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-3xl z-0 pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-100 dark:border-indigo-900/60 mb-6 animate-pulse">
          <Zap className="h-3.5 w-3.5" />
          <span>Next-Generation Textile inspection</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight max-w-5xl mx-auto bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
          AI-Powered Fabric Analysis & Thread Density Inspection
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed">
          Instantly analyze fabric structures, calculate warp/weft thread counts, identify weave patterns, and download quality control reports with advanced Computer Vision.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/signup"
            className="px-8 py-4 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/25 flex items-center gap-2 group text-base"
          >
            <span>Scan Your Fabric Free</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/pricing"
            className="px-8 py-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 font-bold hover:bg-slate-100 dark:hover:bg-slate-900 hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Interactive Thread Scanning Slider Demo */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 mb-24">
        <div className="glass-panel border rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          <h3 className="text-center font-bold text-lg sm:text-xl mb-6">Interactive AI Thread Inspection Preview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Column: Interactive Fabric Image Preview */}
            <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
              {/* Mock Fabric Background texture using CSS patterns */}
              <div 
                className="absolute inset-0 bg-slate-300 dark:bg-slate-800"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${120 - densityDemoVal}px, rgba(0,0,0,0.15) ${120 - densityDemoVal}px, rgba(0,0,0,0.15) ${122 - densityDemoVal}px),
                                    repeating-linear-gradient(90deg, transparent, transparent ${120 - densityDemoVal}px, rgba(0,0,0,0.15) ${120 - densityDemoVal}px, rgba(0,0,0,0.15) ${122 - densityDemoVal}px)`
                }}
              ></div>
              
              {/* Scanning Overlay (Active as slider is adjusted) */}
              <div className="absolute inset-0 analysis-grid-overlay opacity-60"></div>
              
              {/* Scanning Laser Line */}
              <div className="absolute inset-x-0 scanning-line pointer-events-none"></div>

              {/* Density overlay tags */}
              <div className="absolute bottom-4 left-4 right-4 bg-slate-950/80 backdrop-blur-md border border-white/10 rounded-lg p-3 text-white text-xs flex justify-between">
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Warp Count</span>
                  <span className="text-sm font-bold">{Math.round(densityDemoVal * 1.05)} TPI</span>
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider block">Weft Count</span>
                  <span className="text-sm font-bold">{Math.round(densityDemoVal * 0.95)} TPI</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">Structure</span>
                  <span className="text-sm font-bold text-emerald-400">Denim Weave</span>
                </div>
              </div>
            </div>

            {/* Right Column: Controls & Dynamic Stats */}
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-2xl text-indigo-600 dark:text-indigo-400">
                  {Math.round(densityDemoVal * 2)} TPI²
                </h4>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Combined Thread Density (Total Threads / Inch²)</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Simulate Fabric Thread Spacing</label>
                <input 
                  type="range" 
                  min="40" 
                  max="120" 
                  value={densityDemoVal} 
                  onChange={(e) => setDensityDemoVal(Number(e.target.value))}
                  className="w-full h-2 bg-indigo-200 dark:bg-indigo-950 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                />
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Coarse (e.g. Linen)</span>
                  <span>Fine (e.g. Satin)</span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Real-time orthogonal coordinate tracking</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>Automatic weave orientation detection</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  <span>High-speed pixels-to-tpi density conversion</span>
                </div>
              </div>

              <Link 
                to="/signup" 
                className="block text-center w-full py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold hover:scale-[1.01] active:scale-[0.99] transition-all text-sm shadow-md"
              >
                Scan An Image Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-y border-slate-100 dark:border-slate-900">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center space-y-1">
              <span className="block text-3xl sm:text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">{stat.value}</span>
              <span className="block text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold">Professional SaaS Tools for Quality Control</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            From automated counting to defect checks, ThreadCounty speeds up lab inspections and factory assessments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feat, i) => (
            <div key={i} className="glass-panel border rounded-2xl p-6 sm:p-8 hover:scale-[1.01] transition-transform duration-300 flex items-start gap-5">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex-shrink-0">
                {feat.icon}
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{feat.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-slate-50/50 dark:bg-slate-900/10 rounded-3xl border border-slate-100 dark:border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold">How ThreadCounty Works</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-400">Three simple steps to inspect structures and download official analysis records.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md shadow-indigo-600/20">1</div>
            <h3 className="text-lg font-bold">Upload Fabric Image</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Snap a picture with a macro lens or standard flatbed scanner and drop it into the dashboard.</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md shadow-indigo-600/20">2</div>
            <h3 className="text-lg font-bold">AI Structure Analysis</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">Our neural computer vision scanning network analyzes the spacing, counting warp and weft counts.</p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md shadow-indigo-600/20">3</div>
            <h3 className="text-lg font-bold">Get Quality Reports</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">View interactive densities, download structured PDF documents, or access historical data logs.</p>
          </div>
        </div>
      </section>

      {/* Target Audiences / Benefits */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">Built For Quality Managers, Researchers, and Students</h2>
            <p className="text-slate-600 dark:text-slate-400">
              Lab testing for fabric structures has traditionally been a slow, manual task involving magnifying glasses and needles. ThreadCounty automates this workflow, saving time and removing human counting errors.
            </p>
            
            <div className="space-y-3">
              {[
                { title: 'Textile Manufacturers', detail: 'Verify density specs at fast speeds on production floors.' },
                { title: 'Quality Control Labs', detail: 'Document official yarn alignment and structural tolerances.' },
                { title: 'Students & Academics', detail: 'Study structural geometries and analyze fabric types easily.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-8 text-white relative shadow-xl shadow-indigo-500/10">
            <div className="absolute top-4 right-4 opacity-15">
              <Cpu className="h-32 w-32" />
            </div>
            
            <h3 className="font-extrabold text-2xl mb-4">Launch Fabric Inspection Today</h3>
            <p className="text-sm text-indigo-100 mb-8 leading-relaxed">
              Create an account to start analyzing weaves. Free accounts receive 3 fabric scans per month, with full reports and history logs.
            </p>

            <Link 
              to="/signup" 
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-indigo-600 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg text-sm"
            >
              <span>Create Free Account</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
