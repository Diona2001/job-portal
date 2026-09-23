import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobsApi';
import { Job } from '../../types';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { formatDate, formatSalary } from '../../utils/format';
import {
  PlusCircle,
  Eye,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Users,
  MapPin,
  Clock,
  Briefcase,
} from 'lucide-react';

export const MyJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobsApi.getMyJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load posted jobs', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (job: Job) => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      await jobsApi.updateJobStatus(job.id, newStatus);
      showToast(`Job status set to ${newStatus}`);
      setJobs((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, status: newStatus as any } : j))
      );
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      await jobsApi.deleteJob(jobToDelete.id);
      showToast('Job deleted successfully');
      setJobs((prev) => prev.filter((j) => j.id !== jobToDelete.id));
      setJobToDelete(null);
    } catch (err) {
      showToast('Failed to delete job', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manage Jobs</h2>
          <p className="text-xs text-slate-500">Monitor and update all postings from your company</p>
        </div>
        <Link
          to="/employer/jobs/new"
          className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-500/20 flex items-center space-x-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post a Job</span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No Jobs Posted Yet"
          description="You haven't posted any job openings. Create your first opening to attract top candidates."
          actionText="Create a Job Opening"
          onAction={() => navigate('/employer/jobs/new')}
        />
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                  <span className="text-xs text-slate-400">Created {formatDate(job.createdAt)}</span>
                </div>

                <Link
                  to={`/jobs/${job.id}`}
                  className="text-lg font-bold text-slate-900 hover:text-primary-600 block transition"
                >
                  {job.title}
                </Link>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {job.employmentType} • {job.workplaceType}
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 flex-shrink-0">
                <Link
                  to="/employer/candidates"
                  className="px-4 py-2 bg-primary-50 text-primary-700 font-bold rounded-xl text-xs hover:bg-primary-100 flex items-center space-x-1.5 transition"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{job.applicationsCount} Applicants</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job)}
                  className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1 ${
                    job.status === 'Active'
                      ? 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                  title={job.status === 'Active' ? 'Close job' : 'Publish job'}
                >
                  <span>{job.status === 'Active' ? 'Close' : 'Re-open'}</span>
                </button>

                <button
                  onClick={() => setJobToDelete(job)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Job Posting"
        message={`Are you sure you want to permanently delete "${jobToDelete?.title}"? All applicant connections to this specific post will be removed.`}
        confirmText="Delete Post"
        isLoading={isDeleting}
      />
    </div>
  );
};
