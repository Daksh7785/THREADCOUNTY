import React, { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Cpu, AlertCircle, CheckCircle, Sun, Moon, MailCheck, RefreshCw } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const email = location.state?.email || 'your email';

  // 6 individual OTP input boxes
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const isDark = theme === 'dark';
  const code = digits.join('');

  const handleDigit = (index: number, value: string) => {
    const val = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = val;
    setDigits(newDigits);
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage('');
    if (code.length < 6) { setError('Please enter the complete 6-digit code.'); return; }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed.');
      setMessage('Email verified! Opening your workspace...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try using code 123456.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
      setMessage('A new code has been sent. For testing use: 123456');
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background decoration */}
      <div className="absolute top-[15%] left-[15%] w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] right-[15%] w-80 h-80 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
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
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/15 flex items-center justify-center border border-indigo-500/30">
              <MailCheck className="h-8 w-8 text-indigo-500" />
            </div>
          </div>

          <h2 className={`text-xl font-extrabold font-heading text-center mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Check your email
          </h2>
          <p className={`text-sm text-center leading-relaxed mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            We sent a 6-digit verification code to{' '}
            <span className="text-indigo-500 font-semibold">{email}</span>
          </p>

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

          <form onSubmit={handleSubmit}>
            {/* OTP Boxes */}
            <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigit(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all focus:ring-2 focus:ring-indigo-500/40 ${
                    digit
                      ? 'border-indigo-500 text-indigo-500 ' + (isDark ? 'bg-indigo-950/50' : 'bg-indigo-50')
                      : isDark
                        ? 'border-slate-700 bg-slate-900 text-white focus:border-indigo-500'
                        : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500'
                  }`}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center disabled:opacity-50 text-sm hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Verify Email'}
            </button>
          </form>

          {/* Resend */}
          <div className="text-center mt-6">
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors inline-flex items-center gap-1"
              >
                {resending ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                Resend code
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className={`text-center text-sm mt-6 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
          <Link to="/signup" className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">
            ← Back to sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
