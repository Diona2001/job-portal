import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { applicationsApi } from '../../api/applicationsApi';
import { savedJobsApi } from '../../api/savedJobsApi';
import { interviewsApi } from '../../api/interviewsApi';
import { jobsApi } from '../../api/jobsApi';
import { Application, Interview, Job } from '../../types';
import { StatCard } from '../../components/dashboard/StatCard';
import { ApplicationStatusBadge } from '../../components/jobs/ApplicationStatusBadge';
import { JobCard } from '../../components/jobs/JobCard';
import {
  FileText,
  Clock,
  Video,
  Bookmark,
  Sparkles,
  ArrowRight,
  Building2,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../../utils/format';

export const JobSeekerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [appsRes, savedRes, interviewsRes, recRes] = await Promise.all([
          applicationsApi.getMyApplications(),
          savedJobsApi.getSavedJobs(),
          interviewsApi.getInterviews(),
          jobsApi.getRecommendedJobs(4),
        ]);

        if (appsRes.success && appsRes.data) setApplications(appsRes.data);
        if (savedRes.success && savedRes.data) setSavedJobs(savedRes.data);
        if (interviewsRes.success && interviewsRes.data) setInterviews(interviewsRes.data);
        if (recRes.success && recRes.data) setRecommendedJobs(recRes.data);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const pendingCount = applications.filter((a) => a.status === 'Applied' || a.status === 'Under Review').length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-600 via-indigo-600 to-primary-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-primary-200">Candidate Hub</span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">Welcome back, {user?.fullName}!</h1>
          <p className="text-sm text-primary-100 max-w-xl mt-1">
            Track your job applications, view upcoming interview schedules, and explore tailored job matches.
          </p>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Applications Sent"
          value={applications.length}
          icon={<FileText className="w-5 h-5 text-primary-600" />}
          subtitle="Total submitted"
        />
        <StatCard
          title="Pending Review"
          value={pendingCount}
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          subtitle="Under evaluation"
        />
        <StatCard
          title="Interviews"
          value={interviewCount}
          icon={<Video className="w-5 h-5 text-indigo-600" />}
          subtitle="Rounds scheduled"
        />
        <StatCard
          title="Saved Jobs"
          value={savedJobs.length}
          icon={<Bookmark className="w-5 h-5 text-purple-600" />}
          subtitle="In your wishlist"
        />
      </div>

      {/* Upcoming Interviews Alert */}
      {interviews.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">
                Upcoming Scheduled Interviews
              </h3>
            </div>
            <span className="text-xs font-semibold text-indigo-600">{interviews.length} Scheduled</span>
          </div>

          <div className="space-y-3">
            {interviews.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{item.jobTitle}</h4>
                  <p className="text-xs text-slate-500">{item.companyName}</p>
                  <div className="flex items-center space-x-3 text-xs text-indigo-700 font-semibold mt-1">
                    <span>📅 {new Date(item.interviewDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>⏰ {item.interviewTime}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50">{item.interviewType}</span>
                  </div>
                </div>

                {item.meetingLink && (
                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold text-center transition"
                  >
                    Join Meeting
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recent Applications</h3>
            <p className="text-xs text-slate-500">Your latest submissions and active progress</p>
          </div>
          <Link
            to="/applications"
            className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center space-x-1"
          >
            <span>View All Applications</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            You haven't submitted any job applications yet.
            <div className="mt-3">
              <Link to="/jobs" className="text-primary-600 font-bold hover:underline text-xs">
                Explore Available Jobs →
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 4).map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  {app.companyLogoUrl ? (
                    <img
                      src={app.companyLogoUrl}
                      alt={app.companyName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.jobTitle}</h4>
                    <p className="text-xs text-slate-500">{app.companyName} • {app.jobLocation}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs text-slate-400">Applied {formatDate(app.appliedAt)}</span>
                  <ApplicationStatusBadge status={app.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-bold text-slate-900">Recommended for Your Profile</h3>
          </div>
          <Link to="/jobs" className="text-xs font-bold text-primary-600 hover:text-primary-800">
            Browse More →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
};
