import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, IndianRupee, Clock, Bookmark, Building2 } from 'lucide-react';
import { Job } from '../../types';
import { formatSalary, formatDate } from '../../utils/format';

interface JobCardProps {
  job: Job;
  onSaveToggle?: (jobId: number, isSaved: boolean) => void;
  isSaving?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onSaveToggle, isSaving = false }) => {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-100 hover:border-primary-200 hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3.5">
            {job.companyLogoUrl ? (
              <img
                src={job.companyLogoUrl}
                alt={job.companyName}
                className="w-12 h-12 rounded-xl object-cover border border-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-lg">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                {job.companyName}
              </h4>
              <Link
                to={`/jobs/${job.id}`}
                className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1"
              >
                {job.title}
              </Link>
            </div>
          </div>

          {onSaveToggle && (
            <button
              onClick={() => onSaveToggle(job.id, !!job.isSaved)}
              disabled={isSaving}
              aria-label={job.isSaved ? 'Unsave job' : 'Save job'}
              className={`p-2 rounded-xl border transition ${
                job.isSaved
                  ? 'bg-primary-50 border-primary-200 text-primary-600'
                  : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${job.isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4">
          {job.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            <MapPin className="w-3 h-3 mr-1 text-slate-400" />
            {job.location}
          </span>
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
            <Briefcase className="w-3 h-3 mr-1 text-slate-400" />
            {job.employmentType}
          </span>
          <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">
            <IndianRupee className="w-3 h-3 mr-0.5 text-emerald-500" />
            {formatSalary(job.salaryMin, job.salaryMax)}
          </span>
          {job.workplaceType && (
            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
              {job.workplaceType}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center">
          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
          {formatDate(job.createdAt)}
        </span>
        <div className="space-x-2">
          <Link
            to={`/jobs/${job.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-primary-50 text-primary-600 font-semibold hover:bg-primary-600 hover:text-white transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};
