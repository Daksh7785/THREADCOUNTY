import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const SECTIONS = [
  {
    id: 'information',
    title: '1. Information We Collect',
    content: `When you create a ThreadCounty account, we collect your email address, full name, and optionally your company name. When you use the platform, we also collect the fabric images you upload for analysis, the analysis reports generated from those images, and usage data such as upload timestamps and plan tier.

We do not collect payment card information directly — all payment processing is handled by our mock payment layer (and in production, by PCI-compliant third-party processors such as Stripe).`
  },
  {
    id: 'usage',
    title: '2. How We Use Your Data',
    content: `Your account information is used to authenticate your session and personalize your experience. Uploaded fabric images are processed exclusively to generate thread density analysis reports — they are not shared with other users or used to train external AI models without your explicit consent.

Usage data helps us improve platform performance, identify issues, and understand which features provide the most value.`
  },
  {
    id: 'storage',
    title: '3. Image & Report Storage',
    content: `Fabric images you upload are stored securely in our cloud storage for the duration of your account. Analysis reports generated from those images are retained indefinitely until you delete them.

When you delete a report — or delete your account — all associated images and report data are permanently removed from our systems within 30 days. Account deletion is irreversible. You can initiate account deletion at any time from your Profile page.`
  },
  {
    id: 'third-party',
    title: '4. Third-Party Services',
    content: `ThreadCounty uses the following third-party services to operate the platform:

• Supabase — database hosting and user authentication (stores your profile and reports in a PostgreSQL database). Supabase is SOC 2 Type II compliant.
• Resend — transactional email delivery (sends you verification emails, password resets, and report notifications).
• Vercel — frontend hosting and CDN delivery.

Each service processes only the minimum data required for its function. We do not sell your data to any third party.`
  },
  {
    id: 'cookies',
    title: '5. Cookies',
    content: `ThreadCounty uses minimal cookies:

• Session cookie — stores your authentication token to keep you logged in.
• Preference cookie — stores your theme preference (light/dark mode) and consent choices.
• Analytics cookies — we may use anonymized analytics (e.g., Vercel Analytics) to understand traffic patterns. No personally identifiable information is included.

You can clear cookies at any time from your browser settings. Note that clearing the session cookie will sign you out.`
  },
  {
    id: 'rights',
    title: '6. Your Rights',
    content: `You have the right to access, export, or delete your personal data at any time.

• Access — view your profile and all reports from your Dashboard.
• Export — download any individual analysis report as a PDF or JSON file from the report page.
• Delete — delete individual reports from your History page, or delete your entire account (and all associated data) from your Profile → Danger Zone.

If you require a full data export or have a deletion request that cannot be completed through the app, contact us at privacy@threadcounty.app.`
  },
  {
    id: 'contact',
    title: '7. Contact for Privacy Concerns',
    content: `For questions, concerns, or requests related to your privacy and personal data, please contact:

Email: privacy@threadcounty.app
Response time: Within 5 business days.

ThreadCounty is committed to handling all privacy inquiries transparently and in accordance with applicable data protection regulations.`
  },
  {
    id: 'updated',
    title: '8. Last Updated',
    content: `This Privacy Policy was last updated on June 24, 2026. We will notify registered users via email if we make material changes to this policy.`
  }
];

export const PrivacyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('information');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
            <Shield className="h-3.5 w-3.5" />
            Legal
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white">Privacy Policy</h1>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            We take your privacy seriously. This policy explains what data we collect, why, and how you can control it.
          </p>
          <p className="text-xs text-slate-400">Last updated: June 24, 2026</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          {/* Table of Contents sidebar */}
          <nav className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-8 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-3 px-2">Contents</p>
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === s.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="lg:col-span-3 space-y-10">
            {SECTIONS.map(s => (
              <section
                key={s.id}
                id={s.id}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 scroll-mt-8"
                onMouseEnter={() => setActiveSection(s.id)}
              >
                <h2 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">{s.title}</h2>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {s.content}
                </div>
              </section>
            ))}

            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center text-sm text-slate-500">
              Have questions? Read our{' '}
              <Link to="/terms" className="text-indigo-600 hover:underline font-semibold">Terms of Service</Link>{' '}
              or{' '}
              <Link to="/contact" className="text-indigo-600 hover:underline font-semibold">contact us</Link>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
