import React, { useState, useEffect } from 'react';
import { savedJobsApi } from '../../api/savedJobsApi';
import { Job } from '../../types';
import { JobCard } from '../../components/jobs/JobCard';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { useToast } from '../../context/ToastContext';

export const SavedJobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  const fetchSavedJobs = async () => {
    setIsLoading(true);
    try {
      const res = await savedJobsApi.getSavedJobs();
      if (res.success && res.data) {
        setJobs(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleUnsave = async (jobId: number) => {
    try {
      await savedJobsApi.unsaveJob(jobId);
      showToast('Job removed from saved list');
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      showToast('Failed to remove saved job', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Saved Jobs</h2>
        <p className="text-xs text-slate-500">Your bookmarked positions to review and apply later</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No Saved Jobs"
          description="You haven't bookmarked any jobs yet. When browsing positions, click the bookmark icon to save them here."
          actionText="Find Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSaveToggle={() => handleUnsave(job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
