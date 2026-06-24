import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import FAQPage from './pages/FAQPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CheckoutPage from './pages/CheckoutPage';

// Auth Pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import VerifyEmailPage from './pages/VerifyEmailPage';

// Protected Pages
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import AnalysisResultPage from './pages/AnalysisResultPage';
import HistoryPage from './pages/HistoryPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import ComparePage from './pages/ComparePage';
import CookieConsent from './components/CookieConsent';
import AIChatbot from './components/AIChatbot';

// CSS Imports
import './App.css';
import './index.css';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ 
  children, 
  requireAdmin = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-semibold">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};

// Public Route Wrapper with Navbar & Footer
const PublicRouteLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />
      <div className="flex-1">
        {children}
      </div>
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
            <span>ThreadCounty AI</span>
          </div>
          <p>&copy; {new Date().getFullYear()} ThreadCounty. All rights reserved. Hackathon Submission.</p>
          <div className="flex gap-6 flex-wrap justify-center">
            <a href="/about" className="hover:text-indigo-600">About</a>
            <a href="/pricing" className="hover:text-indigo-600">Pricing</a>
            <a href="/faq" className="hover:text-indigo-600">FAQs</a>
            <a href="/contact" className="hover:text-indigo-600">Contact Us</a>
            <a href="/privacy" className="hover:text-indigo-600">Privacy</a>
            <a href="/terms" className="hover:text-indigo-600">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Marketing Routes */}
            <Route path="/" element={<PublicRouteLayout><LandingPage /></PublicRouteLayout>} />
            <Route path="/about" element={<PublicRouteLayout><AboutPage /></PublicRouteLayout>} />
            <Route path="/pricing" element={<PublicRouteLayout><PricingPage /></PublicRouteLayout>} />
            <Route path="/faq" element={<PublicRouteLayout><FAQPage /></PublicRouteLayout>} />
            <Route path="/contact" element={<PublicRouteLayout><ContactPage /></PublicRouteLayout>} />
            <Route path="/privacy" element={<PublicRouteLayout><PrivacyPage /></PublicRouteLayout>} />
            <Route path="/terms" element={<PublicRouteLayout><TermsPage /></PublicRouteLayout>} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Standalone pages (no nav) */}
            <Route path="/checkout/:plan" element={<CheckoutPage />} />

            {/* Protected User Workspace Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/upload" 
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/report/:id" 
              element={
                <ProtectedRoute>
                  <AnalysisResultPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/history" 
              element={
                <ProtectedRoute>
                  <HistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/compare" 
              element={
                <ProtectedRoute>
                  <ComparePage />
                </ProtectedRoute>
              } 
            />

            {/* Protected Admin Console Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Fallback Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <CookieConsent />
          <AIChatbot />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
