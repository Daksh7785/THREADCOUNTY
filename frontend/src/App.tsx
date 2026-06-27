import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';

// Lazy-loaded Public Pages
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const FAQPage = React.lazy(() => import('./pages/FAQPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const PrivacyPage = React.lazy(() => import('./pages/PrivacyPage'));
const TermsPage = React.lazy(() => import('./pages/TermsPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const BlogPage = React.lazy(() => import('./pages/BlogPage'));
const ForumPage = React.lazy(() => import('./pages/ForumPage'));

// Lazy-loaded Auth Pages
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const SignupPage = React.lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/ForgotPasswordPage'));
const VerifyEmailPage = React.lazy(() => import('./pages/VerifyEmailPage'));

// Lazy-loaded Protected Pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const UploadPage = React.lazy(() => import('./pages/UploadPage'));
const AnalysisResultPage = React.lazy(() => import('./pages/AnalysisResultPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AdminUploads = React.lazy(() => import('./pages/AdminUploads'));
const AdminSettings = React.lazy(() => import('./pages/AdminSettings'));
const ComparePage = React.lazy(() => import('./pages/ComparePage'));
import CookieConsent from './components/CookieConsent';
import AIChatbot from './components/AIChatbot';


// CSS Imports
import './App.css';
import './index.css';

// Suspense Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">Loading page...</p>
    </div>
  </div>
);

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Marketing Routes */}
              <Route path="/" element={<PublicRouteLayout><LandingPage /></PublicRouteLayout>} />
              <Route path="/about" element={<PublicRouteLayout><AboutPage /></PublicRouteLayout>} />
              <Route path="/pricing" element={<PublicRouteLayout><PricingPage /></PublicRouteLayout>} />
              <Route path="/faq" element={<PublicRouteLayout><FAQPage /></PublicRouteLayout>} />
              <Route path="/contact" element={<PublicRouteLayout><ContactPage /></PublicRouteLayout>} />
              <Route path="/privacy" element={<PublicRouteLayout><PrivacyPage /></PublicRouteLayout>} />
              <Route path="/terms" element={<PublicRouteLayout><TermsPage /></PublicRouteLayout>} />
              <Route path="/blog" element={<PublicRouteLayout><BlogPage /></PublicRouteLayout>} />
              <Route path="/forum" element={<PublicRouteLayout><ForumPage /></PublicRouteLayout>} />

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
              <Route 
                path="/admin/uploads" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminUploads />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/settings" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminSettings />
                  </ProtectedRoute>
                } 
              />

              {/* Fallback Catch-all Redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          <CookieConsent />
          <AIChatbot />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
