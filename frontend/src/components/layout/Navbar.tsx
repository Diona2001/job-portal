import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Briefcase,
  Bell,
  User as UserIcon,
  LogOut,
  LayoutDashboard,
  FileText,
  Bookmark,
  PlusCircle,
  Menu,
  X,
  Check,
  Building2,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { formatDate } from '../../utils/format';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'Admin') return '/admin/dashboard';
    if (user.role === 'Employer') return '/employer/dashboard';
    return '/dashboard';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary-700 via-primary-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
              Career<span className="text-primary-600">Pulse</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5">
              Recruitment Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition">
            Home
          </Link>
          <Link to="/jobs" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition">
            Find Jobs
          </Link>
          <Link to="/companies" className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition">
            Companies
          </Link>
          {isAuthenticated && (
            <Link
              to={getDashboardLink()}
              className="text-sm font-semibold text-slate-600 hover:text-primary-600 transition"
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {user?.role === 'Employer' ? (
            <Link
              to="/employer/jobs/new"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 font-bold text-sm hover:bg-primary-100 transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post a Job</span>
            </Link>
          ) : !isAuthenticated ? (
            <Link
              to="/register?role=Employer"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition"
            >
              <Building2 className="w-4 h-4" />
              <span>Employer Portal</span>
            </Link>
          ) : null}

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {isNotifOpen && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in duration-200">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-800 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 text-xs font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-primary-600 hover:text-primary-800 flex items-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark all read</span>
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => !n.isRead && markAsRead(n.id)}
                            className={`p-4 hover:bg-slate-50 transition cursor-pointer ${
                              !n.isRead ? 'bg-primary-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <h5 className="text-xs font-bold text-slate-900">{n.title}</h5>
                              <span className="text-[10px] text-slate-400">{formatDate(n.createdAt)}</span>
                            </div>
                            <p className="text-xs text-slate-600 line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile Dropdown */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-3 p-1.5 pr-3 rounded-2xl hover:bg-slate-100 transition"
                >
                  {user?.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.fullName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user?.fullName}</p>
                    <span className="text-[10px] font-semibold text-primary-600 uppercase">
                      {user?.role}
                    </span>
                  </div>
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 animate-in fade-in duration-200">
                    <div className="px-4 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-bold text-slate-800">{user?.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to={getDashboardLink()}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </Link>

                    {user?.role === 'JobSeeker' && (
                      <>
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <UserIcon className="w-4 h-4" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          to="/applications"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <FileText className="w-4 h-4" />
                          <span>My Applications</span>
                        </Link>
                        <Link
                          to="/saved-jobs"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <Bookmark className="w-4 h-4" />
                          <span>Saved Jobs</span>
                        </Link>
                      </>
                    )}

                    {user?.role === 'Employer' && (
                      <>
                        <Link
                          to="/employer/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Company Profile</span>
                        </Link>
                        <Link
                          to="/employer/jobs"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>My Jobs</span>
                        </Link>
                        <Link
                          to="/employer/candidates"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <Users className="w-4 h-4" />
                          <span>Candidates</span>
                        </Link>
                      </>
                    )}

                    {user?.role === 'Admin' && (
                      <>
                        <Link
                          to="/admin/users"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <Users className="w-4 h-4" />
                          <span>Manage Users</span>
                        </Link>
                        <Link
                          to="/admin/companies"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <Building2 className="w-4 h-4" />
                          <span>Manage Companies</span>
                        </Link>
                        <Link
                          to="/admin/jobs"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 transition"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Manage Jobs</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Link
                to="/login"
                className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-primary-600 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-700 shadow-md shadow-primary-500/20 transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 py-2"
          >
            Home
          </Link>
          <Link
            to="/jobs"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 py-2"
          >
            Find Jobs
          </Link>
          <Link
            to="/companies"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block text-sm font-semibold text-slate-700 py-2"
          >
            Companies
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-sm font-semibold text-primary-600 py-2"
              >
                Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left text-sm font-semibold text-rose-600 py-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-primary-600 text-white text-sm font-bold"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
