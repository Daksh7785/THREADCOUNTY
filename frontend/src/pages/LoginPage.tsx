import { API_URL, API } from '../config';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  Cpu, AlertCircle, Eye, EyeOff, Sun, Moon,
  ArrowRight, Sparkles, Shield, Zap, BarChart3
} from 'lucide-react';
import GoogleAuthButton from '../components/GoogleAuthButton';

const features = [
  { icon: Sparkles, label: 'AI Fabric Analysis', desc: 'Instant thread density & weave detection' },
  { icon: BarChart3, label: 'Analytics Dashboard', desc: 'In-depth quality control insights' },
  { icon: Shield, label: 'Enterprise Security', desc: 'SOC 2 compliant data protection' },
  { icon: Zap, label: 'Real-time Reports', desc: 'Downloadable PDF analysis reports' },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const res = await fetch('${API_URL}/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed.');
      login(data.token, data.user, rememberMe);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Unable to connect to auth server.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      
      {/* ── Left Branding Panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
        {/* Decorative blobs */}
        <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 moving-grid-bg opacity-10 pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
            <Cpu className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-extrabold text-white tracking-tight font-heading">ThreadCounty</span>
        </div>

        {/* Hero Text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight font-heading">
              AI-Powered<br />Fabric Intelligence
            </h1>
            <p className="mt-4 text-indigo-100 text-lg leading-relaxed max-w-sm">
              Analyze thread density, detect weave patterns, and generate comprehensive quality reports in seconds.
            </p>
          </div>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3.5 group">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-indigo-200 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-indigo-200 text-xs">Trusted by 500+ textile manufacturers worldwide</p>
          <div className="flex gap-1 mt-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="h-4 w-4 text-yellow-300 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.163c.969 0 1.372 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.951-.69l1.287-3.957z" /></svg>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`absolute top-6 right-6 p-2.5 rounded-xl transition-all ${isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-slate-600 hover:bg-slate-100 shadow-sm border border-slate-200'}`}
          aria-label="Toggle theme"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="w-full max-w-md">
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
          <div className="mb-8">
            <h2 className={`text-2xl sm:text-3xl font-extrabold font-heading ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome back
            </h2>
            <p className={`mt-1.5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Sign in to your ThreadCounty workspace
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Button (Primary CTA) */}
          <GoogleAuthButton
            isDark={isDark}
            disabled={loading}
            onSuccess={(token, user) => {
              login(token, user, true); // Google login defaults to remember me
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
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className={`w-full px-4 py-3 rounded-xl text-sm transition-all outline-none border focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
                  isDark
                    ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                }`}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className={`block text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-400 font-medium transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`w-full px-4 py-3 pr-11 rounded-xl text-sm transition-all outline-none border focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 ${
                    isDark
                      ? 'bg-slate-900 border-slate-700 text-white placeholder:text-slate-600'
                      : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-400 accent-indigo-600"
              />
              <label htmlFor="remember" className={`text-sm select-none cursor-pointer ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Remember me for 30 days
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 text-sm hover:scale-[1.01] active:scale-[0.99] mt-1"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className={`text-center text-sm mt-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
            Don't have an account?{' '}
            <Link to="/signup" className="text-indigo-500 hover:text-indigo-400 font-semibold transition-colors">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
