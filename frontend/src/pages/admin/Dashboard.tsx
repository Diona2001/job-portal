import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { AdminDashboardStats } from '../../types';
import { StatCard } from '../../components/dashboard/StatCard';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Video,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await adminApi.getDashboard();
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const sampleMonthlyData = [
    { month: 'Apr 2026', count: 12 },
    { month: 'May 2026', count: 18 },
    { month: 'Jun 2026', count: 24 },
    { month: 'Jul 2026', count: 32 },
    { month: 'Aug 2026', count: 45 },
    { month: 'Sep 2026', count: 58 },
  ];

  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-purple-200 mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Platform Administrator Console</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black">Platform Analytics & Management</h1>
        <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
          Supervise candidate registrations, employer verifications, job moderation, and platform throughput.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          icon={<Users className="w-5 h-5 text-primary-600" />}
          subtitle={`${stats?.totalJobSeekers || 0} job seekers`}
        />
        <StatCard
          title="Companies"
          value={stats?.totalCompanies || 0}
          icon={<Building2 className="w-5 h-5 text-indigo-600" />}
          subtitle="Registered businesses"
        />
        <StatCard
          title="Total Jobs"
          value={stats?.totalJobs || 0}
          icon={<Briefcase className="w-5 h-5 text-emerald-600" />}
          subtitle={`${stats?.activeJobs || 0} currently active`}
        />
        <StatCard
          title="Applications"
          value={stats?.totalApplications || 0}
          icon={<FileText className="w-5 h-5 text-amber-600" />}
          subtitle={`${stats?.totalInterviews || 0} interviews held`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Application Velocity (Last 6 Months)</h3>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              +38% MoM
            </span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sampleMonthlyData}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Jobs Posted per Month</h3>
            <span className="text-xs font-semibold text-slate-400">Monthly Volume</span>
          </div>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sampleMonthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
