import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { jobsApi } from '../../api/jobsApi';
import { applicationsApi } from '../../api/applicationsApi';
import { interviewsApi } from '../../api/interviewsApi';
import { companiesApi } from '../../api/companiesApi';
import { Application, Company, Interview, Job } from '../../types';
import { StatCard } from '../../components/dashboard/StatCard';
import { ApplicationStatusBadge } from '../../components/jobs/ApplicationStatusBadge';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Video,
  Award,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { formatDate } from '../../utils/format';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const EmployerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [jobsRes, appsRes, intRes, compRes] = await Promise.all([
          jobsApi.getMyJobs(),
          applicationsApi.getCompanyApplications(),
          interviewsApi.getInterviews(),
          companiesApi.getMyCompany(),
        ]);

        if (jobsRes.success && jobsRes.data) setJobs(jobsRes.data);
        if (appsRes.success && appsRes.data) setApplications(appsRes.data);
        if (intRes.success && intRes.data) setInterviews(intRes.data);
        if (compRes.success && compRes.data) setCompany(compRes.data);
      } catch (err) {
        console.error('Failed to load employer dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const shortlistedCount = applications.filter((a) => a.status === 'Shortlisted').length;
  const hiresCount = applications.filter((a) => a.status === 'Selected').length;

  // Chart Data: Status distribution
  const statusDistribution = [
    { name: 'Applied', value: applications.filter((a) => a.status === 'Applied').length, color: '#3b82f6' },
    { name: 'Under Review', value: applications.filter((a) => a.status === 'Under Review').length, color: '#f59e0b' },
    { name: 'Shortlisted', value: shortlistedCount, color: '#8b5cf6' },
    { name: 'Interview', value: applications.filter((a) => a.status === 'Interview').length, color: '#6366f1' },
    { name: 'Selected', value: hiresCount, color: '#10b981' },
    { name: 'Rejected', value: applications.filter((a) => a.status === 'Rejected').length, color: '#ef4444' },
  ].filter((d) => d.value > 0);

  // Fallback for visual demonstration if fewer records
  const displayStatusData = statusDistribution.length > 0 ? statusDistribution : [
    { name: 'Applied', value: 3, color: '#3b82f6' },
    { name: 'Review', value: 2, color: '#f59e0b' },
    { name: 'Interview', value: 2, color: '#6366f1' },
    { name: 'Selected', value: 1, color: '#10b981' },
  ];

  // Applications Per Job Bar Chart Data
  const jobAppsData = jobs.slice(0, 5).map((j) => ({
    title: j.title.length > 18 ? j.title.substring(0, 18) + '...' : j.title,
    applications: j.applicationsCount || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-primary-700 to-primary-900 rounded-3xl p-8 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
            Employer Command Center
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">
            {company?.companyName || 'Company Portal'}
          </h1>
          <p className="text-sm text-indigo-100 max-w-lg mt-1">
            Manage your recruitment pipeline, review candidate resumes, and schedule candidate interview rounds.
          </p>
        </div>

        <Link
          to="/employer/jobs/new"
          className="px-6 py-3 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm hover:bg-indigo-50 transition shadow-md flex items-center space-x-2 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Jobs"
          value={activeJobsCount}
          icon={<Briefcase className="w-5 h-5 text-primary-600" />}
        />
        <StatCard
          title="Total Applications"
          value={applications.length}
          icon={<Users className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Shortlisted"
          value={shortlistedCount}
          icon={<CheckCircle2 className="w-5 h-5 text-purple-600" />}
        />
        <StatCard
          title="Interviews"
          value={interviews.length}
          icon={<Video className="w-5 h-5 text-amber-600" />}
        />
        <StatCard
          title="Hired Candidates"
          value={hiresCount}
          icon={<Award className="w-5 h-5 text-emerald-600" />}
        />
      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Chart: Job Performance */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Job Performance (Applications)</h3>
            <span className="text-xs font-semibold text-slate-400">Top Postings</span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobAppsData.length > 0 ? jobAppsData : [{ title: 'No Jobs', applications: 0 }]}>
                <XAxis dataKey="title" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="applications" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Pipeline Status Breakdown */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Applicant Status Breakdown</h3>
            <span className="text-xs font-semibold text-slate-400">Pipeline Ratio</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {displayStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-3 text-xs pt-2">
            {displayStatusData.map((item) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-600 font-medium">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Candidate Applications */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Candidate Applications</h3>
            <p className="text-xs text-slate-500">Review candidates who applied recently</p>
          </div>
          <Link
            to="/employer/candidates"
            className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center space-x-1"
          >
            <span>Manage All Candidates</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No candidates have applied yet. Ensure your posted jobs are published and active!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  {app.applicantProfileImage ? (
                    <img
                      src={app.applicantProfileImage}
                      alt={app.applicantName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold">
                      {app.applicantName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.applicantName}</h4>
                    <p className="text-xs text-slate-500">
                      Applied for <span className="font-semibold text-slate-700">{app.jobTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-400">{formatDate(app.appliedAt)}</span>
                  <ApplicationStatusBadge status={app.status} />
                  <Link
                    to="/employer/candidates"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-primary-600 hover:bg-slate-50"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
