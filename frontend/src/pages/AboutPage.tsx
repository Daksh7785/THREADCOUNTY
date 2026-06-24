import React from 'react';
import { Cpu, Users, Target, Milestone, BrainCircuit } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const team = [
    { name: 'Daksh Kumar', role: 'Lead Architect & CV Researcher', initial: 'D' },
    { name: 'Dr. Elizabeth Vance', role: 'Director of Textile Science', initial: 'E' },
    { name: 'Marcus Brody', role: 'Full Stack Engineer', initial: 'M' }
  ];

  const milestones = [
    { year: '2024', title: 'Research & Dev', desc: 'Partnered with textile laboratories to study pixels-to-TPI calibration models.' },
    { year: '2025', title: 'Beta Launch', desc: 'Deployed early model API serving twill and plain weave counting.' },
    { year: '2026', title: 'ThreadCounty SaaS', desc: 'Released complete SaaS platform with client storage, history logs, and PDF exports.' }
  ];

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">Our Textile Technology Story</h2>
        <p className="text-slate-500 text-sm">
          Bridging the gap between manual lab magnifying tools and machine learning computer vision.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 space-y-16">
        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-panel border rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="h-10 w-10 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold font-heading">Our Mission</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To simplify fabric inspection. We want to enable textile engineers, factory operators, and researchers to verify weave specs, count densities, and document qc checklists in seconds without slow manual magnifying frames.
            </p>
          </div>

          <div className="glass-panel border rounded-2xl p-6 sm:p-8 space-y-4">
            <div className="h-10 w-10 bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <h3 className="text-xl font-bold font-heading">Our Vision</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              We envision a fully automated textile QC line where raw cameras count warp and weft counts at mill speeds, feeding real-time alerts to looms when tension issues or structural thread defects occur.
            </p>
          </div>
        </div>

        {/* Tech Stack overview */}
        <div className="glass-panel border rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-indigo-500" />
            <h3 className="text-lg font-bold font-heading">Technology & Platform Architecture</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            ThreadCounty is built with a highly responsive, modern stack designed for speed and reliability. The frontend is a React TypeScript SPA powered by Vite and styled with Tailwind CSS, utilizing Framer Motion for smooth micro-animations. The backend is an Express Node.js application, integrating Multer for file streaming, JWT tokens for auth sessions, and custom pixels-to-inch spatial calibration models. The database is powered by Supabase with Row Level Security (RLS) policies, falling back to a sandbox JSON engine for offline and local evaluation.
          </p>
        </div>

        {/* Team */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-500" />
            <h3 className="text-lg font-bold font-heading">The ThreadCounty Team</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {team.map((t) => (
              <div key={t.name} className="glass-panel border rounded-xl p-5 text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-bold flex items-center justify-center mx-auto text-lg">
                  {t.initial}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t.name}</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Milestone className="h-6 w-6 text-indigo-500" />
            <h3 className="text-lg font-bold font-heading">Our Timeline</h3>
          </div>

          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-8">
            {milestones.map((m) => (
              <div key={m.year} className="relative">
                <div className="absolute top-1.5 left-[-31px] w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-50 dark:ring-indigo-950/40"></div>
                <div className="space-y-1">
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{m.year}</span>
                  <h4 className="font-bold text-sm text-slate-800 dark:text-white">{m.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AboutPage;
