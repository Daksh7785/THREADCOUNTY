/**
 * GoogleAuthButton.tsx
 *
 * Reusable Google Sign-In button using @react-oauth/google.
 * Sends the Google credential (ID token) to the backend for verification.
 * On success calls onSuccess(token, user) so the caller can log the user in.
 */
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { AlertCircle } from 'lucide-react';
import { API_URL } from '../context/AuthContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

interface GoogleAuthButtonProps {
  label?: string;
  isDark: boolean;
  disabled?: boolean;
  onSuccess: (token: string, user: any) => void;
}

export const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({
  label = 'Continue with Google',
  isDark,
  disabled = false,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isConfigured =
    import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here.apps.googleusercontent.com';

  // Google login flow — uses implicit flow to get an access_token,
  // then we exchange it server-side via the /api/auth/google endpoint.
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError('');
      try {
        // Fetch user info from Google using the access token
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!userInfoRes.ok) throw new Error('Failed to fetch Google user info.');
        const googleUser = await userInfoRes.json();

        // Send to our backend (using the sub as a stable identifier)
        const backendRes = await fetch(`${API_URL}/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            credential: null, // not using id_token path here
            googleUser      // pass raw google user info
          })
        });

        const data = await backendRes.json();
        if (!backendRes.ok) throw new Error(data.error || 'Google login failed.');

        onSuccess(data.token, data.user);
      } catch (err: any) {
        setError(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google login error:', err);
      setError('Google sign-in was cancelled or failed. Please try again.');
    },
    flow: 'implicit'
  });

  const handleClick = () => {
    setError('');
    if (!isConfigured) {
      setError(
        'Google OAuth is not set up yet. Add your Client ID to frontend/.env → VITE_GOOGLE_CLIENT_ID, and to backend/.env → GOOGLE_CLIENT_ID, then restart both servers.'
      );
      return;
    }
    googleLogin();
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold text-sm transition-all disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99] shadow-sm ${
          isDark
            ? 'bg-white text-slate-800 hover:bg-slate-100 border border-white/10'
            : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
        }`}
      >
        {loading ? (
          <div className="h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <GoogleIcon />
        )}
        <span>{loading ? 'Signing in with Google...' : label}</span>
      </button>

      {error && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!isConfigured && !error && (
        <p className={`text-xs text-center ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          ⚙️ Configure <code className="font-mono text-indigo-400">VITE_GOOGLE_CLIENT_ID</code> to enable Google login
        </p>
      )}
    </div>
  );
};

export default GoogleAuthButton;
