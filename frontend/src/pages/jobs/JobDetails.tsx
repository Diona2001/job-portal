import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../../api/jobsApi';
import { applicationsApi } from '../../api/applicationsApi';
import { savedJobsApi } from '../../api/savedJobsApi';
import { usersApi } from '../../api/usersApi';
import { Job, UserProfile } from '../../types';
import { formatSalary, formatDate } from '../../utils/format';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import {
  MapPin,
  Briefcase,
  IndianRupee,
  Clock,
  Bookmark,
  Share2,
  Building2,
  Globe,
  Users,
  CheckCircle2,
  FileText,
  Upload,
} from 'lucide-react';

export const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [selectedResumeUrl, setSelectedResumeUrl] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobAndProfile = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await jobsApi.getJob(Number(id));
        if (res.success && res.data) {
          setJob(res.data);
        }
        if (isAuthenticated && user?.role === 'JobSeeker') {
          const profileRes = await usersApi.getProfile();
          if (profileRes.success && profileRes.data) {
            setProfile(profileRes.data);
            if (profileRes.data.resumeUrl) {
              setSelectedResumeUrl(profileRes.data.resumeUrl);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadJobAndProfile();
  }, [id, isAuthenticated]);

  const handleSaveToggle = async () => {
    if (!isAuthenticated) {
      showToast('Please login to save jobs', 'info');
      navigate('/login');
      return;
    }
    if (user?.role !== 'JobSeeker' || !job) return;

    try {
      if (job.isSaved) {
        await savedJobsApi.unsaveJob(job.id);
        showToast('Job removed from saved list');
      } else {
        await savedJobsApi.saveJob(job.id);
        showToast('Job saved to your profile');
      }
      setJob({ ...job, isSaved: !job.isSaved });
    } catch (err) {
      showToast('Error updating saved job', 'error');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Job link copied to clipboard!');
    }
  };

  const handleOpenApplyModal = () => {
    if (!isAuthenticated) {
      showToast('Please login to apply for this job', 'info');
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } });
      return;
    }
    if (user?.role !== 'JobSeeker') {
      showToast('Only job seekers can apply for jobs', 'error');
      return;
    }
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsApplying(true);
    try {
      let finalResumeUrl = selectedResumeUrl;

      // If user selected a new file to upload
      if (resumeFile) {
        const uploadRes = await usersApi.uploadResume(resumeFile);
        if (uploadRes.success && uploadRes.data) {
          finalResumeUrl = uploadRes.data;
        }
      }

      await applicationsApi.apply({
        jobId: job.id,
        resumeUrl: finalResumeUrl,
        coverLetter: coverLetter.trim(),
      });

      showToast('Application submitted successfully!');
      setJob({ ...job, hasApplied: true });
      setIsApplyModalOpen(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message || 'Failed to submit application', 'error');
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-40 bg-white rounded-3xl border border-slate-100"></div>
        <div className="h-80 bg-white rounded-3xl border border-slate-100"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">The job post may have expired or been removed.</p>
        <Link to="/jobs" className="mt-4 inline-block text-primary-600 font-bold text-sm">
          Browse Other Jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-md flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="flex items-start space-x-5">
          {job.companyLogoUrl ? (
            <img
              src={job.companyLogoUrl}
              alt={job.companyName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-xs flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold text-2xl flex-shrink-0">
              <Building2 className="w-10 h-10" />
            </div>
          )}

          <div className="space-y-2">
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
              {job.companyName}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-600">
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center">
                <Briefcase className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {job.employmentType}
              </span>
              <span className="flex items-center font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg">
                <IndianRupee className="w-3 h-3 mr-0.5 text-emerald-500" />
                {formatSalary(job.salaryMin, job.salaryMax)}
              </span>
              <span className="flex items-center text-slate-400">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Posted {formatDate(job.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={handleSaveToggle}
            className={`p-3 rounded-2xl border transition ${
              job.isSaved
                ? 'bg-primary-50 border-primary-200 text-primary-600'
                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
            }`}
            title="Save Job"
          >
            <Bookmark className={`w-5 h-5 ${job.isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="p-3 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:border-slate-300 transition"
            title="Share Job"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {job.hasApplied ? (
            <div className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-sm flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Applied</span>
            </div>
          ) : (
            <Button onClick={handleOpenApplyModal} size="lg" className="px-8 flex-1 md:flex-initial">
              Apply Now
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Job details & Company info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Job Description & Requirements */}
        <div className="lg:col-span-2 space-y-8 bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-sm">
          {/* About the Role */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">About the Role</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          {job.responsibilities && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Responsibilities</h3>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside leading-relaxed">
                {job.responsibilities.split(';').map((resp, i) => (
                  <li key={i}>{resp.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Requirements */}
          {job.requirements && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements & Qualifications</h3>
              <ul className="space-y-2 text-sm text-slate-600 list-disc list-inside leading-relaxed">
                {job.requirements.split(';').map((req, i) => (
                  <li key={i}>{req.trim()}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills Required */}
          {job.skills && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Skills & Technologies</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.split(',').map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Perks & Benefits</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{job.benefits}</p>
            </div>
          )}
        </div>

        {/* Right Column: Company Details Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 sticky top-28">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              About the Company
            </h3>

            <div className="flex items-center space-x-3.5">
              {job.companyLogoUrl ? (
                <img
                  src={job.companyLogoUrl}
                  alt={job.companyName}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                  <Building2 className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-base font-bold text-slate-900">{job.companyName}</h4>
                <span className="text-xs text-slate-500">{job.companyIndustry || 'Technology'}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
              {job.companySize && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1.5" /> Company Size
                  </span>
                  <span className="font-semibold">{job.companySize}</span>
                </div>
              )}
              {job.companyWebsite && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center">
                    <Globe className="w-3.5 h-3.5 mr-1.5" /> Website
                  </span>
                  <a
                    href={job.companyWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-primary-600 hover:underline truncate max-w-[150px]"
                  >
                    {job.companyWebsite.replace('https://', '')}
                  </a>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1.5" /> Location
                </span>
                <span className="font-semibold">{job.location}</span>
              </div>
            </div>

            {/* Bottom Apply CTA in Sidebar */}
            <div className="pt-4 border-t border-slate-100">
              {!job.hasApplied ? (
                <Button onClick={handleOpenApplyModal} className="w-full py-3">
                  Apply for this position
                </Button>
              ) : (
                <p className="text-xs text-center text-emerald-600 font-bold">
                  ✓ You have already applied
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitApplication} className="space-y-5">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Applicant Information
            </span>
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p><strong className="text-slate-700">Name:</strong> {user?.fullName}</p>
              <p><strong className="text-slate-700">Email:</strong> {user?.email}</p>
            </div>
          </div>

          {/* Resume Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Attach Resume (.PDF, .DOC, .DOCX)
            </label>

            {profile?.resumeUrl ? (
              <div className="p-3.5 rounded-xl border border-primary-200 bg-primary-50/50 flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {profile.resumeFileName || 'Default Profile Resume.pdf'}
                    </p>
                    <span className="text-[10px] text-slate-500">Currently on file</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary-600">Selected</span>
              </div>
            ) : null}

            <div className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-2xl p-4 text-center cursor-pointer transition">
              <input
                type="file"
                id="modal-resume-file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setResumeFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />
              <label htmlFor="modal-resume-file" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-primary-600">
                  {resumeFile ? resumeFile.name : 'Upload a different resume'}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Max file size: 10MB</p>
              </label>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cover Letter / Note to Employer (Optional)
            </label>
            <textarea
              rows={4}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              className="w-full text-xs rounded-xl border-slate-200 p-3 focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsApplyModalOpen(false)}
              disabled={isApplying}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isApplying}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
