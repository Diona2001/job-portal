import React, { useState, useEffect } from 'react';
import { applicationsApi } from '../../api/applicationsApi';
import { Application, ApplicationStatusHistory } from '../../types';
import { ApplicationStatusBadge } from '../../components/jobs/ApplicationStatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingSkeleton, EmptyState } from '../../components/common/FeedbackComponents';
import { formatDate } from '../../utils/format';
import {
  FileText,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [historyList, setHistoryList] = useState<ApplicationStatusHistory[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const res = await applicationsApi.getMyApplications();
      if (res.success && res.data) {
        setApplications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const openHistory = async (app: Application) => {
    setSelectedApp(app);
    try {
      const res = await applicationsApi.getHistory(app.id);
      if (res.success && res.data) {
        setHistoryList(res.data);
      }
    } catch (err) {
      console.error(err);
    }
    setIsHistoryModalOpen(true);
  };

  const steps = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

  const getStepIndex = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'applied') return 0;
    if (s === 'under review') return 1;
    if (s === 'shortlisted') return 2;
    if (s === 'interview') return 3;
    if (s === 'selected') return 4;
    if (s === 'rejected') return -1;
    return 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Applications</h2>
          <p className="text-xs text-slate-500">Track and monitor your job submission pipelines</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton count={3} />
      ) : applications.length === 0 ? (
        <EmptyState
          title="No Applications Submitted"
          description="You haven't submitted any job applications yet. Browse active tech positions and submit your profile today."
          actionText="Find Jobs"
          onAction={() => (window.location.href = '/jobs')}
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const currentIndex = getStepIndex(app.status);
            const isRejected = app.status.toLowerCase() === 'rejected';

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {app.companyLogoUrl ? (
                      <img
                        src={app.companyLogoUrl}
                        alt={app.companyName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                        <Building2 className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <Link
                        to={`/jobs/${app.jobId}`}
                        className="text-base font-bold text-slate-900 hover:text-primary-600 transition"
                      >
                        {app.jobTitle}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {app.companyName} • {app.jobLocation}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <ApplicationStatusBadge status={app.status} />
                    <button
                      onClick={() => openHistory(app)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1 transition"
                    >
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Timeline</span>
                    </button>
                  </div>
                </div>

                {/* Visual Progress Timeline */}
                {!isRejected ? (
                  <div className="pt-2">
                    <div className="grid grid-cols-5 gap-2 relative">
                      {steps.map((step, idx) => {
                        const isDone = currentIndex >= idx;
                        const isCurrent = currentIndex === idx;

                        return (
                          <div key={step} className="text-center">
                            <div
                              className={`h-2 rounded-full mb-2 transition-all ${
                                isDone
                                  ? 'bg-primary-600'
                                  : 'bg-slate-100'
                              }`}
                            ></div>
                            <span
                              className={`text-[11px] font-bold block truncate ${
                                isCurrent
                                  ? 'text-primary-700'
                                  : isDone
                                  ? 'text-slate-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 text-xs font-semibold text-rose-700 flex items-center justify-between">
                    <span>Application Status: Not moving forward at this time</span>
                    <button
                      onClick={() => openHistory(app)}
                      className="text-[11px] underline font-bold text-rose-800"
                    >
                      View Notes
                    </button>
                  </div>
                )}

                {/* Sub details */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                  <span>Applied on {formatDate(app.appliedAt)}</span>
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary-600 hover:underline font-semibold flex items-center space-x-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Submitted Resume</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* History Timeline Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={`Application History: ${selectedApp?.jobTitle}`}
        maxWidth="md"
      >
        <div className="space-y-6">
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {historyList.map((h, i) => (
              <div key={h.id || i} className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary-600 border-2 border-white shadow-xs"></div>
                <div>
                  <span className="text-xs font-bold text-primary-600 uppercase tracking-wider">
                    {h.status}
                  </span>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">{h.comment}</p>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-1">
                    <span>By {h.changedBy || 'System'}</span>
                    <span>•</span>
                    <span>{formatDate(h.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};
