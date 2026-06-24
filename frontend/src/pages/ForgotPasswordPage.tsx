import { API_URL, API } from '../config';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Cpu, AlertCircle, CheckCircle, Sun, Moon, ArrowLeft, Mail, Eye, EyeOff } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [step, setStep] = useState(1); // 1 = Request, 2 = Verify & Reset
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const isDark = theme === 'dark';

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!email) { setError('Please input your email address.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to request reset.');
      setMessage('A reset code has been sent to your email. For testing use: 528491');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Unable to connect to auth server.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (!code || !newPassword) { setError('Please fill in all fields.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed.');
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm outline-none border transition-all focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
    isDark
      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600'
      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  const labelClass = `block text-xs font-semibold uppercase tracking-wide mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background decoration */}
      <div className="absolute top-[15%] left-[10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] right-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 moving-grid-bg opacity-10 pointer-events-none" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`absolute top-6 right-6 p-2.5 rounded-xl transition-all z-10 ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'}`}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 font-extrabold text-2xl font-heading">
            <div className="p-2 bg-indigo-600 rounded-xl">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <span className={isDark ? 'text-white' : 'text-slate-900'}>
              Thread<span className="text-indigo-500">County</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className={`rounded-2xl p-8 shadow-xl border transition-colors ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>1</div>
              <span className={`text-xs font-medium ${step === 1 ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-500' : 'text-slate-400'}`}>Request Reset</span>
            </div>
            <div className={`flex-1 h-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-400'}`}>2</div>
              <span className={`text-xs font-medium ${step === 2 ? (isDark ? 'text-white' : 'text-slate-900') : isDark ? 'text-slate-500' : 'text-slate-400'}`}>Set New Password</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className={`text-xl font-extrabold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {step === 1 ? 'Reset your password' : 'Create new password'}
            </h2>
            <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {step === 1
                ? 'Enter your email and we\'ll send a verification code.'
                : `We sent a code to ${email}. Enter it below to reset your password.`}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label htmlFor="email" className={labelClass}>Email Address</label>
                <div className="relative">
                  <input
                    id="email" type="email" required
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className={inputClass + ' pl-10'}
                  />
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center disabled:opacity-50 text-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Send Reset Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP Code */}
              <div>
                <label htmlFor="code" className={labelClass}>Verification Code</label>
                <input
                  id="code" type="text" required maxLength={6}
                  value={code} onChange={e => setCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className={inputClass + ' text-center font-bold tracking-[0.4em] text-lg'}
                />
              </div>

              {/* New Password */}
              <div>
                <label htmlFor="new-pw" className={labelClass}>New Password</label>
                <div className="relative">
                  <input
                    id="new-pw"
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className={inputClass + ' pr-11'}
                  />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirm-pw" className={labelClass}>Confirm Password</label>
                <input
                  id="confirm-pw" type="password" required
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat your password"
                  className={inputClass}
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center disabled:opacity-50 text-sm hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify & Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setMessage(''); setCode(''); }}
                className={`w-full flex items-center justify-center gap-1.5 text-sm font-medium transition-colors ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Use a different email
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          Remembered your password?{' '}
          <Link to="/login" className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
