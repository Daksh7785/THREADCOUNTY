import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  UploadCloud, 
  History, 
  GitCompareArrows,
  CreditCard, 
  User, 
  ShieldAlert, 
  LogOut,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { to: '/upload', label: 'Upload Fabric', icon: <UploadCloud className="h-5 w-5" /> },
    { to: '/history', label: 'Analysis History', icon: <History className="h-5 w-5" /> },
    { to: '/compare', label: 'Compare Fabrics', icon: <GitCompareArrows className="h-5 w-5" /> },
    { to: '/pricing', label: 'Pricing Plans', icon: <CreditCard className="h-5 w-5" /> },
    { to: '/profile', label: 'My Profile', icon: <User className="h-5 w-5" /> },
  ];

  return (
    <aside className="w-64 glass-panel border-r min-h-screen flex flex-col justify-between hidden md:flex">
      <div>
        {/* Header/Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
          <NavLink to="/" className="flex items-center gap-2 font-bold text-lg text-indigo-600 dark:text-indigo-400">
            <Cpu className="h-5 w-5 animate-pulse" />
            <span>Thread<span className="text-slate-900 dark:text-white">County</span></span>
          </NavLink>
        </div>

        {/* User Quick Info */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/20">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                user?.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="font-semibold text-sm text-slate-800 dark:text-white truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.company || 'No Company'}</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}

          {/* Admin Section */}
          {user?.role === 'admin' && (
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase">Administration</span>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-l-4 border-emerald-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                <ShieldAlert className="h-5 w-5" />
                <span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </nav>
      </div>

      {/* Log out section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout Account</span>
        </button>
      </div>
    </aside>
  );
};
export default Sidebar;
