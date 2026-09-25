import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/applicationsApi';
import { interviewsApi } from '../../api/interviewsApi';
import { Application } from '../../types';
import { ApplicationStatusBadge } from '../../components/jobs/ApplicationStatusBadge';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/format';
import {
  Users,
  FileText,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Sparkles,
  TrendingUp,
  Bot,
} from 'lucide-react';
import { aiApi } from '../../api/aiApi';
import { JobMatchAnalysis } from '../../types';

export const Candidates: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Status Change Modal
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('Shortlisted');
  const [statusComment, setStatusComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Schedule Interview Modal
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('02:00 PM IST');
  const [interviewType, setInterviewType] = useState('Online');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // AI Match Analysis Modal
  const [isAiMatchModalOpen, setIsAiMatchModalOpen] = useState(false);
  const [selectedCandidateMatch, setSelectedCandidateMatch] = useState<JobMatchAnalysis | null>(null);
  const [isLoadingCandidateMatch, setIsLoadingCandidateMatch] = useState(false);
  const [activeCandidateApp, setActiveCandidateApp] = useState<Application | null>(null);

  const { showToast } = useToast();

  const handleOpenAiMatchModal = async (app: Application) => {
    setActiveCandidateApp(app);
    setIsAiMatchModalOpen(true);
    setIsLoadingCandidateMatch(true);
    setSelectedCandidateMatch(null);
    try {
      const res = await aiApi.getCandidateMatch(app.id);
      if (res.success && res.data) {
        setSelectedCandidateMatch(res.data);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error loading AI match analysis', 'error');
    } finally {
      setIsLoadingCandidateMatch(false);
    }
  };

  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const res = await applicationsApi.getCompanyApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load candidate applications', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const openStatusModal = (app: Application) => {
    setSelectedApp(app);
    setNewStatus(app.status);
    setStatusComment('');
    setIsStatusModalOpen(true);
  };

  const openInterviewModal = (app: Application) => {
    setSelectedApp(app);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setInterviewDate(tomorrow.toISOString().split('T')[0]);
    setIsInterviewModalOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdatingStatus(true);
    try {
      const res = await applicationsApi.updateStatus(selectedApp.id, newStatus, statusComment);
      if (res.success) {
        showToast(`Status updated to ${newStatus}`);
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, status: newStatus as any } : a))
        );
        setIsStatusModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update status', 'error');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !interviewDate) return;

    setIsScheduling(true);
    try {
      const res = await interviewsApi.scheduleInterview({
        applicationId: selectedApp.id,
        interviewDate,
        interviewTime,
        interviewType,
        meetingLink,
        notes: interviewNotes,
      });

      if (res.success) {
        showToast('Interview scheduled and invitation sent!');
        setApplications((prev) =>
          prev.map((a) => (a.id === selectedApp.id ? { ...a, status: 'Interview' } : a))
        );
        setIsInterviewModalOpen(false);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule interview', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Candidate Pipeline</h2>
        <p className="text-xs text-slate-500">Review applicants, verify qualifications, and schedule interviews</p>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applicants Yet"
          description="Candidates will appear here as soon as they submit applications for your posted jobs."
          actionText="View Posted Jobs"
          onAction={() => (window.location.href = '/employer/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5 hover:shadow-md transition"
            >
              {/* Candidate Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-4">
                  {app.applicantProfileImage ? (
                    <img
                      src={app.applicantProfileImage}
                      alt={app.applicantName}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl">
                      {app.applicantName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{app.applicantName}</h3>
                    <p className="text-xs font-semibold text-primary-600">
                      {app.applicantCurrentTitle || 'Candidate'}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center">
                        <Mail className="w-3 h-3 mr-1" /> {app.applicantEmail}
                      </span>
                      {app.applicantPhone && (
                        <span className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" /> {app.applicantPhone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                  <ApplicationStatusBadge status={app.status} />
                  <span className="text-[11px] text-slate-400">
                    Applied {formatDate(app.appliedAt)}
                  </span>
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  <strong className="text-slate-900 font-bold">Applied for:</strong> {app.jobTitle}
                </p>

                {app.applicantSkills && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {app.applicantSkills.split(',').map((skill, i) => (
                      <span key={i} className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {app.coverLetter && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Cover Letter
                    </span>
                    <p className="text-xs text-slate-700 italic">{app.coverLetter}</p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <div>
                  {app.resumeUrl ? (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold inline-flex items-center space-x-1.5 transition"
                    >
                      <FileText className="w-4 h-4 text-primary-600" />
                      <span>View Resume</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No resume attached</span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleOpenAiMatchModal(app)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:text-indigo-900 border border-indigo-200 text-xs font-bold inline-flex items-center space-x-1.5 transition hover:shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>AI Fit Score</span>
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openInterviewModal(app)}
                    leftIcon={<Calendar className="w-3.5 h-3.5 text-indigo-600" />}
                  >
                    Schedule Interview
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => openStatusModal(app)}
                    leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Change Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Change Application Status: ${selectedApp?.applicantName}`}
        maxWidth="md"
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected (Offer Extended)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Internal Comment / Note (Saved to History)
            </label>
            <textarea
              rows={3}
              value={statusComment}
              onChange={(e) => setStatusComment(e.target.value)}
              placeholder="e.g. Cleared round 1 technical screen, candidate demonstrated strong knowledge of EF Core and React hooks."
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsStatusModalOpen(false)}
              disabled={isUpdatingStatus}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isUpdatingStatus}>
              Save Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        title={`Schedule Interview: ${selectedApp?.applicantName}`}
        maxWidth="md"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Time *
              </label>
              <input
                type="text"
                required
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                placeholder="e.g. 03:00 PM IST"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              >
                <option value="Online">Online Video</option>
                <option value="Phone">Phone Call</option>
                <option value="In-person">In-person Office</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Meeting Link
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Interview Notes
            </label>
            <textarea
              rows={3}
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              placeholder="Topics to assess, panel members, or instructions for the candidate..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs"
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsInterviewModalOpen(false)}
              disabled={isScheduling}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isScheduling}>
              Schedule & Notify
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Candidate Match Modal */}
      <Modal
        isOpen={isAiMatchModalOpen}
        onClose={() => setIsAiMatchModalOpen(false)}
        title={`AI Fit Analysis: ${activeCandidateApp?.applicantName}`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {isLoadingCandidateMatch ? (
            <div className="py-12 text-center space-y-3">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
              <p className="text-sm font-semibold text-slate-600">Analyzing candidate semantic fit with AI...</p>
            </div>
          ) : selectedCandidateMatch ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">Candidate Match Level</span>
                  <h4 className="text-base font-extrabold text-slate-900">{selectedCandidateMatch.matchLevel}</h4>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-indigo-700">{selectedCandidateMatch.matchPercentage}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    selectedCandidateMatch.matchPercentage >= 75
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : selectedCandidateMatch.matchPercentage >= 50
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${selectedCandidateMatch.matchPercentage}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Matched Skills */}
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                  <h5 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    Matched Skills ({selectedCandidateMatch.matchingSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidateMatch.matchingSkills.map((s, idx) => (
                      <span key={idx} className="text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2">
                  <h5 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                    Skill Gaps ({selectedCandidateMatch.missingSkills.length})
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCandidateMatch.missingSkills.map((s, idx) => (
                      <span key={idx} className="text-[11px] font-medium bg-amber-100/80 text-amber-800 px-2 py-0.5 rounded-md">
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths */}
              {selectedCandidateMatch.strengths.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 text-xs text-slate-700">
                  <h5 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Key Candidate Strengths</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {selectedCandidateMatch.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {selectedCandidateMatch.recommendations.length > 0 && (
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-1.5 text-xs text-indigo-900">
                  <h5 className="font-bold uppercase tracking-wider text-[11px] flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1 text-indigo-600" /> Hiring Insight
                  </h5>
                  <p className="leading-relaxed text-indigo-800">{selectedCandidateMatch.recommendations[0]}</p>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setIsAiMatchModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
