import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Job } from '../../types';
import { useToast } from '../../context/ToastContext';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { formatDate } from '../../utils/format';
import { Briefcase, Building2, MapPin } from 'lucide-react';

export const AdminJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load jobs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId: number, status: string) => {
    try {
      await adminApi.updateJobStatus(jobId, status);
      showToast(`Job status set to ${status}`);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: status as any } : j)));
    } catch (err) {
      showToast('Failed to update job status', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage Job Postings</h2>
        <p className="text-xs text-slate-500">Moderate and manage all vacancies posted on CareerPulse</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={4} />
      ) : jobs.length === 0 ? (
        <EmptyState title="No Jobs" description="No jobs have been posted on the platform." />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                    job.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {job.status}
                </span>
                <h4 className="text-sm font-bold text-slate-900">{job.title}</h4>
                <p className="text-xs text-slate-500">
                  {job.companyName} • {job.location} • {formatDate(job.createdAt)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {job.status === 'Active' ? (
                  <button
                    onClick={() => handleStatusChange(job.id, 'Closed')}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                  >
                    Close Job
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(job.id, 'Active')}
                    className="px-3 py-1.5 rounded-xl bg-primary-600 text-white hover:bg-primary-700 text-xs font-semibold transition"
                  >
                    Activate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
