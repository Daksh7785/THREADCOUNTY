import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const STORAGE_KEY = 'tc_cookie_consent';

export const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEY);
    if (!accepted) {
      // Small delay before showing — feels more natural
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setHiding(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, 'true');
      setVisible(false);
      setHiding(false);
    }, 350);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-350 ${
        hiding ? 'translate-y-full' : 'translate-y-0'
      }`}
      style={{ transitionTimingFunction: 'cubic-bezier(0.4,0,0.2,1)' }}
    >
      <div className="m-4 mb-5 max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          <Cookie className="h-5 w-5" />
        </div>

        {/* Text */}
        <div className="flex-1 text-xs text-slate-600 dark:text-slate-300">
          <p>
            We use cookies to improve your experience, keep you logged in, and understand how ThreadCounty is used.{' '}
            <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
              Learn more →
            </Link>
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleAccept}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow shadow-indigo-600/10"
          >
            Accept All
          </button>
          <button
            onClick={handleAccept}
            aria-label="Dismiss"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
