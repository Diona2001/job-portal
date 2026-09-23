import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobsApi';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Briefcase, IndianRupee, MapPin, Sparkles } from 'lucide-react';

export const PostJob: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Mid');
  const [salaryMin, setSalaryMin] = useState<number | ''>('');
  const [salaryMax, setSalaryMax] = useState<number | ''>('');
  const [employmentType, setEmploymentType] = useState('FullTime');
  const [workplaceType, setWorkplaceType] = useState('Hybrid');
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [benefits, setBenefits] = useState('Comprehensive health insurance, flexible work hours, annual performance bonus');
  const [applicationDeadline, setApplicationDeadline] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim()) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const res = await jobsApi.createJob({
        title,
        description,
        responsibilities,
        requirements,
        skills,
        experienceLevel,
        salaryMin: salaryMin !== '' ? Number(salaryMin) : undefined,
        salaryMax: salaryMax !== '' ? Number(salaryMax) : undefined,
        employmentType,
        workplaceType,
        location,
        benefits,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : undefined,
      });

      if (res.success) {
        showToast('Job posted and published successfully!');
        navigate('/employer/jobs');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to post job', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3 pb-6 border-b border-slate-100 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Post a New Job</h1>
            <p className="text-xs text-slate-500">Reach qualified software engineers and designers</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior ASP.NET Core & React Engineer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Job Type & Workplace & Experience */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="FullTime">Full Time</option>
                <option value="PartTime">Part Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Workplace Type
              </label>
              <select
                value={workplaceType}
                onChange={(e) => setWorkplaceType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">On-site</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead / Architect</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          {/* Location & Application Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Kochi, or Remote"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Deadline (Optional)
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Salary Min & Max */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Salary Minimum (₹ Annual)
              </label>
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 1500000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Salary Maximum (₹ Annual)
              </label>
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value ? Number(e.target.value) : '')}
                placeholder="e.g. 2500000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Skills Required */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. C#, ASP.NET Core, React, TypeScript, SQL Server, Docker"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Job Description *
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a compelling overview of this role and the problems the candidate will solve..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          {/* Responsibilities */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Key Responsibilities (separate with semicolons ;)
            </label>
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="Design and implement REST APIs; Optimize SQL queries; Lead sprint reviews"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Requirements & Qualifications (separate with semicolons ;)
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="3+ years in C# and React; Strong database design fundamentals; Good communication skills"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Benefits & Perks
            </label>
            <input
              type="text"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="e.g. Health insurance, Home office setup, Learning stipend"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/employer/jobs')}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} size="lg" className="px-8">
              Publish Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
