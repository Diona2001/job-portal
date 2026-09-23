import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Bookmark,
  User,
  Building2,
  Users,
  PlusCircle,
  ShieldCheck,
  Search,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavItems = () => {
    if (user?.role === 'Admin') {
      return [
        { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Manage Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { label: 'Manage Companies', path: '/admin/companies', icon: <Building2 className="w-5 h-5" /> },
        { label: 'Manage Jobs', path: '/admin/jobs', icon: <ShieldCheck className="w-5 h-5" /> },
      ];
    }

    if (user?.role === 'Employer') {
      return [
        { label: 'Dashboard', path: '/employer/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: 'Post a Job', path: '/employer/jobs/new', icon: <PlusCircle className="w-5 h-5" /> },
        { label: 'My Posted Jobs', path: '/employer/jobs', icon: <Briefcase className="w-5 h-5" /> },
        { label: 'Candidate Pipeline', path: '/employer/candidates', icon: <Users className="w-5 h-5" /> },
        { label: 'Company Profile', path: '/employer/profile', icon: <Building2 className="w-5 h-5" /> },
      ];
    }

    // JobSeeker
    return [
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'My Profile & Resume', path: '/profile', icon: <User className="w-5 h-5" /> },
      { label: 'My Applications', path: '/applications', icon: <FileText className="w-5 h-5" /> },
      { label: 'Saved Jobs', path: '/saved-jobs', icon: <Bookmark className="w-5 h-5" /> },
      { label: 'Explore Jobs', path: '/jobs', icon: <Search className="w-5 h-5" /> },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm sticky top-28 space-y-6">
            {/* User card info */}
            <div className="flex items-center space-x-3.5 pb-6 border-b border-slate-100">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.fullName}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
              )}
              <div className="overflow-hidden">
                <h4 className="text-sm font-bold text-slate-900 truncate">{user?.fullName}</h4>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-primary-50 text-primary-700">
                  {user?.role}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
