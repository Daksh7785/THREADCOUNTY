import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      category: 'Platform & Operations',
      q: 'What is ThreadCounty and how does it work?',
      a: 'ThreadCounty is a full-stack SaaS platform utilizing artificial intelligence and computer vision to inspect textile structures. Users upload high-resolution macro shots of fabrics, and our algorithms analyze thread spacing to calculate warp and weft counts per inch (TPI/Tpc) in seconds.'
    },
    {
      category: 'Platform & Operations',
      q: 'What type of camera or hardware is needed?',
      a: 'For best results, we recommend using a standard flatbed scanner (1200+ DPI) or a smartphone equipped with a clip-on macro lens. The image should be captured under flat, direct lighting and perpendicular to the fabric plane.'
    },
    {
      category: 'AI Analysis',
      q: 'What fabric weave structures can the AI identify?',
      a: 'The AI model is currently trained on major weave styles: Plain Weave (e.g. linen, cotton shirting), Twill Weave (e.g. denim, gabardine), Satin Weave (e.g. silk sheets), and Basket Weave (e.g. canvas).'
    },
    {
      category: 'AI Analysis',
      q: 'How accurate is the warp and weft thread count?',
      a: 'In validated lab testing, ThreadCounty achieves an average accuracy of 98.7% for TPI calculations on standard woven structures. Fine textures (like satin floats >140 TPI) or hairy fabrics may experience slight deviations.'
    },
    {
      category: 'Pricing & Accounts',
      q: 'What are the limits on the Free plan?',
      a: 'Free plans include 3 fabric scans per month, basic plain weave classification, JSON report exports, and 10MB of secure cloud storage. Student plans increase quotas to 25 scans per month and add twill weave identification.'
    },
    {
      category: 'Pricing & Accounts',
      q: 'How do I upgrade or change my subscription plan?',
      a: 'You can modify your subscription at any time via the Pricing Plans panel. Tiers like Student or Professional activate instantly upon selection with automatic quota extensions.'
    }
  ];

  const toggleFaq = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors py-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-16 px-4">
        <h2 className="text-3xl sm:text-4xl font-extrabold font-heading">Frequently Asked Questions</h2>
        <p className="text-slate-500 text-sm">
          Everything you need to know about fabric inspection, AI models, and pricing plans.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div 
              key={idx}
              className="glass-panel border rounded-xl overflow-hidden transition-all duration-300 shadow-sm"
            >
              {/* Question toggle header */}
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors font-bold text-sm"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="h-4.5 w-4.5 text-indigo-500 flex-shrink-0" />
                  <span>{faq.q}</span>
                </div>
                {isOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </button>

              {/* Answer content (animated reveal) */}
              {isOpen && (
                <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/40 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase text-[9px] mb-2">
                    {faq.category}
                  </span>
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default FAQPage;
