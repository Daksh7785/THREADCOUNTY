import { API_URL, API } from '../config';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Cpu, AlertCircle, Eye, EyeOff, Sun, Moon,
  ArrowRight, Check, X
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

interface PasswordRule {
  label: string;
  test: (pw: string) => boolean;
}

const passwordRules: PasswordRule[] = [
  { label: 'At least 8 characters', test: pw => pw.length >= 8 },
  { label: 'One uppercase letter', test: pw => /[A-Z]/.test(pw) },
  { label: 'One number', test: pw => /\d/.test(pw) },
  { label: 'One special character', test: pw => /[^A-Za-z0-9]/.test(pw) },
];

const getStrength = (pw: string) => {
  const passed = passwordRules.filter(r => r.test(pw)).length;
  if (passed <= 1) return { level: 0, label: 'Weak', color: 'bg-rose-500' };
  if (passed === 2) return { level: 1, label: 'Fair', color: 'bg-amber-500' };
  if (passed === 3) return { level: 2, label: 'Good', color: 'bg-yellow-400' };
  return { level: 3, label: 'Strong', color: 'bg-emerald-500' };
};

export const SignupPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const strength = getStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) { setError('Please fill in all required fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (passwordRules.filter(r => r.test(password)).length < 3) { setError('Password is too weak. Please follow the requirements.'); return; }
    if (!termsAccepted || !privacyAccepted) { setError('You must accept the Terms of Service and Privacy Policy.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, company })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed.');
      login(data.token, data.user);
      navigate('/verify-email', { state: { email } });
    } catch (err: any) {
      setError(err.message || 'Unable to connect to registration server.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>

      {/* ── Left Branding Panel ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-700">
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] left-[-80px] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 moving-grid-bg opacity-10 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight font-heading">ThreadCounty</span>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight font-heading">
              Start analyzing<br />fabric in seconds
            </h2>
            <p className="mt-3 text-indigo-100 text-base leading-relaxed max-w-sm">
              Join thousands of textile professionals using AI to modernize their quality control process.
            </p>
          </div>

          <div className={`rounded-2xl p-5 border border-white/20 space-y-3 ${isDark ? 'bg-white/10' : 'bg-white/15'} backdrop-blur-sm`}>
            <p className="text-white font-semibold text-sm">What you get for free:</p>
            {['5 fabric analyses per month', 'Thread density detection', 'AI weave classification', 'PDF report generation'].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400/30 flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3 text-emerald-300" />
                </div>
                <span className="text-indigo-100 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-indigo-200 text-xs">
          © 2025 ThreadCounty. All rights reserved.
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-10 relative overflow-y-auto">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-2.5 rounded-xl transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'}`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-full max-w-md py-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-extrabold text-2xl font-heading">
              <div className="p-2 bg-indigo-600 rounded-xl">
                <Cpu className="h-5 w-5 text-white" />
              </div>
              <span className={isDark ? 'text-white' : 'text-slate-900'}>
                Thread<span className="text-indigo-500">County</span>
              </span>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-7">
            <h2 className={`text-2xl sm:text-3xl font-extrabold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Create your account
            </h2>
            <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Free forever. No credit card required.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button */}
          <GoogleAuthButton
            label="Sign up with Google"
            isDark={isDark}
            disabled={loading}
            onSuccess={(token, user) => {
              login(token, user, true); // google logins default to rememberMe = true
              navigate('/dashboard');
            }}
          />

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>or continue with email</span>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name + Company row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="name" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Full Name *</label>
                <input
                  id="name" type="text" required autoComplete="name"
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Daksh Kumar"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="company" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Company</label>
                <input
                  id="company" type="text" autoComplete="organization"
                  value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Loom & Weave"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email Address *</label>
              <input
                id="email" type="email" required autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Password *</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setShowRules(true); }}
                  onBlur={() => setShowRules(false)}
                  placeholder="Create a strong password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'}`}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.level ? strength.color : isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strength.level >= 3 ? 'text-emerald-500' : strength.level >= 2 ? 'text-yellow-500' : 'text-rose-400'}`}>
                    {strength.label}
                  </p>
                  {showRules && (
                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      {passwordRules.map(rule => {
                        const passed = rule.test(password);
                        return (
                          <div key={rule.label} className="flex items-center gap-1.5">
                            {passed
                              ? <Check className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                              : <X className="h-3 w-3 text-slate-500 flex-shrink-0" />}
                            <span className={`text-xs ${passed ? 'text-emerald-500' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>{rule.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm Password *</label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-rose-500'
                      : isDark ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  } ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-rose-400 flex items-center gap-1">
                  <X className="h-3 w-3" /> Passwords do not match
                </p>
              )}
              {confirmPassword && password === confirmPassword && password.length > 0 && (
                <p className="text-xs text-emerald-500 flex items-center gap-1">
                  <Check className="h-3 w-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms & Privacy */}
            <div className="space-y-2.5 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="h-4 w-4 mt-0.5 rounded accent-indigo-600 flex-shrink-0" />
                <span className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  I agree to the{' '}
                  <Link to="/terms" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors" target="_blank">Terms of Service</Link>
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input type="checkbox" checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="h-4 w-4 mt-0.5 rounded accent-indigo-600 flex-shrink-0" />
                <span className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  I have read the{' '}
                  <Link to="/privacy" className="text-indigo-500 hover:text-indigo-400 font-medium transition-colors" target="_blank">Privacy Policy</Link>
                </span>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:scale-[1.01] active:scale-[0.99] mt-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
