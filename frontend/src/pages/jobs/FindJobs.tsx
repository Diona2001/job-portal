import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { jobsApi } from '../../api/jobsApi';
import { savedJobsApi } from '../../api/savedJobsApi';
import { Job, JobFilterParams } from '../../types';
import { JobCard } from '../../components/jobs/JobCard';
import { FilterSidebar } from '../../components/jobs/FilterSidebar';
import { LoadingSkeleton, EmptyState, Pagination } from '../../components/common/FeedbackComponents';
import { Search, MapPin, ArrowUpDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const FindJobs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<JobFilterParams>({
    keyword: searchParams.get('keyword') || '',
    location: searchParams.get('location') || '',
    workplaceType: searchParams.get('workplaceType') || '',
    employmentType: searchParams.get('employmentType') || '',
    experienceLevel: searchParams.get('experienceLevel') || '',
    minSalary: searchParams.get('minSalary') ? Number(searchParams.get('minSalary')) : undefined,
    datePosted: searchParams.get('datePosted') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
    pageSize: 9,
  });

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await jobsApi.getJobs(filters);
      if (res.success && res.data) {
        setJobs(res.data.items);
        setTotalCount(res.data.totalCount);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      console.error('Failed to load jobs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [filters]);

  const handleFilterChange = (newFilters: JobFilterParams) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      keyword: '',
      location: '',
      workplaceType: '',
      employmentType: '',
      experienceLevel: '',
      minSalary: undefined,
      datePosted: '',
      sortBy: 'newest',
      page: 1,
      pageSize: 9,
    });
  };

  const handleSaveToggle = async (jobId: number, isSaved: boolean) => {
    if (!isAuthenticated) {
      showToast('Please login to save jobs', 'info');
      return;
    }
    if (user?.role !== 'JobSeeker') {
      showToast('Only job seekers can save jobs', 'info');
      return;
    }

    try {
      if (isSaved) {
        await savedJobsApi.unsaveJob(jobId);
        showToast('Job removed from saved list');
      } else {
        await savedJobsApi.saveJob(jobId);
        showToast('Job saved to your profile');
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !isSaved } : j))
      );
    } catch (err) {
      showToast('Failed to update saved job', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="flex-1 flex items-center space-x-3 px-3 py-1 w-full">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by job title, skill, or keyword..."
            value={filters.keyword || ''}
            onChange={(e) => setFilters({ ...filters, keyword: e.target.value, page: 1 })}
            className="w-full text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

        <div className="flex-1 flex items-center space-x-3 px-3 py-1 w-full">
          <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Location (e.g. Bangalore, Remote, Pune)..."
            value={filters.location || ''}
            onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
            className="w-full text-sm font-medium text-slate-800 bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>

        <button
          onClick={fetchJobs}
          className="w-full md:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition"
        >
          Search
        </button>
      </div>

      {/* Main Grid: Filters + Results */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Right Job Results */}
        <div className="lg:col-span-3 space-y-6">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm">
            <span className="text-sm font-bold text-slate-700">
              Showing <span className="text-primary-600 font-extrabold">{totalCount}</span> Jobs
            </span>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="text-slate-500 flex items-center">
                <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                Sort by:
              </span>
              <select
                value={filters.sortBy || 'newest'}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
                className="border-slate-200 rounded-xl px-3 py-1.5 text-xs bg-slate-50 focus:bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="salary_high">Salary: High to Low</option>
                <option value="salary_low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {/* Jobs Listing */}
          {isLoading ? (
            <LoadingSkeleton count={filters.pageSize || 6} />
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No Jobs Found"
              description="No job postings matched your current search filters. Try clearing or expanding your criteria."
              actionText="Reset Filters"
              onAction={handleClearFilters}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onSaveToggle={handleSaveToggle}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination
            currentPage={filters.page || 1}
            totalPages={totalPages}
            onPageChange={(page) => setFilters({ ...filters, page })}
          />
        </div>
      </div>
    </div>
  );
};
