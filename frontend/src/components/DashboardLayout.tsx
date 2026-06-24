import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Bell, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  User, 
  LogOut, 
  ShieldAlert,
  LayoutDashboard,
  UploadCloud,
  History,
  CreditCard,
  Check
} from 'lucide-react';

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token, logout, refreshUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Fetch notifications
  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Periodically refresh stats and notifications (every 30 seconds)
      const timer = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [token]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/dashboard/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        refreshUser();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard Overview';
      case '/upload': return 'Fabric Analyzer';
      case '/history': return 'Analysis History';
      case '/pricing': return 'Subscription Plans';
      case '/profile': return 'Profile Settings';
      case '/admin': return 'Platform Admin Control';
      default: 
        if (location.pathname.startsWith('/report/')) return 'Fabric Structure Report';
        return 'ThreadCounty';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 glass-panel border-b flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white md:block hidden">{pageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* Notifications Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all relative"
                aria-label="View notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping"></span>
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {notifDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setNotifDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-80 glass-panel border rounded-xl shadow-xl z-40 overflow-hidden py-1 max-h-96 flex flex-col">
                    <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                      <span className="font-bold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} unread
                        </span>
                      )}
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            className={`p-3 border-b border-slate-100 dark:border-slate-800/40 text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/20 ${
                              !n.is_read ? 'bg-indigo-50/30 dark:bg-indigo-950/10' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <span className={`font-semibold ${!n.is_read ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {n.title}
                              </span>
                              {!n.is_read && (
                                <button
                                  onClick={() => markAsRead(n.id)}
                                  className="text-[10px] text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-0.5"
                                  title="Mark as read"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Avatar Quick-link */}
            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
                ) : (
                  user?.name.charAt(0).toUpperCase()
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Page Title display */}
        <div className="px-6 pt-4 md:hidden">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white">{pageTitle()}</h1>
        </div>

        {/* Page Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}></div>
          <div className="fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 p-4 flex flex-col justify-between md:hidden animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Bell className="h-5 w-5 animate-pulse" />
                  <span>ThreadCounty</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    user?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-semibold text-sm truncate">{user?.name}</h4>
                  <p className="text-xs text-slate-500 truncate">{user?.company || 'No Company'}</p>
                </div>
              </div>

              <nav className="space-y-1">
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    location.pathname === '/dashboard' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/upload"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    location.pathname === '/upload' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <UploadCloud className="h-5 w-5" />
                  <span>Upload Fabric</span>
                </Link>
                <Link
                  to="/history"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    location.pathname === '/history' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <History className="h-5 w-5" />
                  <span>Analysis History</span>
                </Link>
                <Link
                  to="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    location.pathname === '/pricing' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Pricing Plans</span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                    location.pathname === '/profile' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <User className="h-5 w-5" />
                  <span>My Profile</span>
                </Link>

                {user?.role === 'admin' && (
                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold ${
                        location.pathname === '/admin' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <ShieldAlert className="h-5 w-5" />
                      <span>Admin Panel</span>
                    </Link>
                  </div>
                )}
              </nav>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout Account</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default DashboardLayout;
