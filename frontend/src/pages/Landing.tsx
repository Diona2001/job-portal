import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  Users,
  Award,
  ArrowRight,
  TrendingUp,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { JobCard } from '../components/jobs/JobCard';
import { jobsApi } from '../api/jobsApi';
import { savedJobsApi } from '../api/savedJobsApi';
import { Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const Landing: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();

  const popularTags = [
    'Software Developer',
    '.NET Developer',
    'React Developer',
    'UI/UX Designer',
    'Data Analyst',
    'DevOps Engineer',
  ];

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await jobsApi.getFeaturedJobs(6);
        if (res.success && res.data) {
          setFeaturedJobs(res.data);
        }
      } catch (err) {
        console.error('Failed to load featured jobs', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (location.trim()) params.append('location', location.trim());
    navigate(`/jobs?${params.toString()}`);
  };

  const handleSaveToggle = async (jobId: number, isSaved: boolean) => {
    if (!isAuthenticated) {
      showToast('Please login to save jobs', 'info');
      navigate('/login');
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
      setFeaturedJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, isSaved: !isSaved } : j))
      );
    } catch (err) {
      showToast('Failed to update saved job', 'error');
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 bg-gradient-to-b from-primary-50/70 via-white to-white">
        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-100/70 text-primary-800 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <span>Over 2,500+ Verified Tech Opportunities</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-tight">
            Find Your <span className="bg-gradient-to-r from-primary-600 to-indigo-600 bg-clip-text text-transparent">Dream Job</span> in Tech
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Discover opportunities from leading companies and take the next step in your career.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearch}
            className="mt-10 max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-3xl shadow-xl border border-slate-100 flex flex-col md:flex-row items-center gap-3"
          >
            <div className="flex-1 flex items-center space-x-3 px-4 py-2 w-full">
              <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search jobs, skills, or companies"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium"
              />
            </div>

            <div className="hidden md:block w-px h-8 bg-slate-200"></div>

            <div className="flex-1 flex items-center space-x-3 px-4 py-2 w-full">
              <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Location (e.g. Bangalore, Remote, Kochi)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-slate-800 placeholder-slate-400 bg-transparent border-none focus:outline-none focus:ring-0 text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full md:w-auto px-8 py-3.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl shadow-md shadow-primary-500/30 transition flex items-center justify-center space-x-2 text-sm flex-shrink-0"
            >
              <span>Search Jobs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Popular Searches */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
              Popular Searches:
            </span>
            {popularTags.map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/jobs?keyword=${encodeURIComponent(tag)}`)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-primary-400 hover:text-primary-600 transition shadow-sm"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Statistics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
            <div className="pt-4 lg:pt-0">
              <h3 className="text-3xl sm:text-4xl font-black text-primary-400">10K+</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Active Tech Jobs
              </p>
            </div>
            <div className="pt-4 lg:pt-0">
              <h3 className="text-3xl sm:text-4xl font-black text-indigo-400">5K+</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Verified Companies
              </p>
            </div>
            <div className="pt-4 lg:pt-0">
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-400">25K+</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Job Seekers
              </p>
            </div>
            <div className="pt-4 lg:pt-0">
              <h3 className="text-3xl sm:text-4xl font-black text-amber-400">8K+</h3>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                Successful Hires
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-primary-600 uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trending Opportunities</span>
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Featured Jobs of the Week
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Hand-picked positions at verified companies hiring immediately
            </p>
          </div>
          <Link
            to="/jobs"
            className="mt-4 sm:mt-0 text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="h-12 w-12 bg-slate-200 rounded-xl"></div>
                <div className="h-5 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onSaveToggle={handleSaveToggle}
              />
            ))}
          </div>
        )}
      </section>

      {/* Employer CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-700 to-indigo-800 rounded-3xl p-10 sm:p-14 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="text-xs font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full">
              For Employers & Recruiters
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Hire the Top 1% of Indian Software Engineers & Designers
            </h2>
            <p className="text-sm sm:text-base text-primary-100 leading-relaxed">
              Post your job openings, manage applications with our Kanban timeline, schedule interviews, and build high-performance teams faster.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <Link
              to="/employer/jobs/new"
              className="px-8 py-4 rounded-2xl bg-white text-primary-900 font-extrabold text-sm hover:bg-slate-100 transition text-center shadow-lg"
            >
              Post a Job Now
            </Link>
            <Link
              to="/register?role=Employer"
              className="px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-bold text-sm hover:bg-white/10 transition text-center"
            >
              Create Company Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
