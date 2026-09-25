import React, { useState, useEffect } from 'react';
import { usersApi } from '../../api/usersApi';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  User,
  Briefcase,
  GraduationCap,
  Award,
  FileText,
  Upload,
  Trash2,
  Download,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  Bot,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { aiApi } from '../../api/aiApi';
import { OptimizeProfileResponse } from '../../types';
import { formatDate } from '../../utils/format';

export const JobSeekerProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isDeleteResumeModalOpen, setIsDeleteResumeModalOpen] = useState(false);

  // AI Profile Polish
  const [isOptimizingWithAi, setIsOptimizingWithAi] = useState(false);
  const [isAiOptimizeModalOpen, setIsAiOptimizeModalOpen] = useState(false);
  const [aiOptimizationResult, setAiOptimizationResult] = useState<OptimizeProfileResponse | null>(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [currentJobTitle, setCurrentJobTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const res = await usersApi.getProfile();
      if (res.success && res.data) {
        setProfile(res.data);
        setFullName(res.data.fullName || '');
        setPhone(res.data.phone || '');
        setLocation(res.data.location || '');
        setBio(res.data.bio || '');
        setCurrentJobTitle(res.data.currentJobTitle || '');
        setExperience(res.data.experience || '');
        setEducation(res.data.education || '');
        setSkills(res.data.skills || '');
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await usersApi.updateProfile({
        fullName,
        phone,
        location,
        bio,
        currentJobTitle,
        experience,
        education,
        skills,
      });

      if (res.success) {
        showToast('Profile updated successfully!');
        updateUser({ fullName, phone, location });
        setProfile(res.data);
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOptimizeProfile = async () => {
    setIsOptimizingWithAi(true);
    try {
      const res = await aiApi.optimizeProfile({
        bio,
        currentSkills: skills,
        targetJobTitle: currentJobTitle || 'Software Engineer'
      });
      if (res.success && res.data) {
        setAiOptimizationResult(res.data);
        setIsAiOptimizeModalOpen(true);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Error optimizing profile with AI', 'error');
    } finally {
      setIsOptimizingWithAi(false);
    }
  };

  const handleApplyAiOptimization = () => {
    if (!aiOptimizationResult) return;
    if (aiOptimizationResult.enhancedBio) {
      setBio(aiOptimizationResult.enhancedBio);
    }
    if (aiOptimizationResult.extractedSkills.length > 0) {
      const existing = skills ? skills.split(',').map((s) => s.trim()) : [];
      const combined = Array.from(new Set([...existing, ...aiOptimizationResult.extractedSkills])).filter(Boolean);
      setSkills(combined.join(', '));
    }
    setIsAiOptimizeModalOpen(false);
    showToast('AI suggestions applied! Click "Save Profile Changes" to persist.', 'success');
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // Allowed extensions
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      showToast('Only PDF, DOC, or DOCX formats are allowed', 'error');
      return;
    }

    // Size limit 10MB
    if (file.size > 10 * 1024 * 1024) {
      showToast('File size cannot exceed 10MB', 'error');
      return;
    }

    setIsUploadingResume(true);
    try {
      const res = await usersApi.uploadResume(file);
      if (res.success) {
        showToast('Resume uploaded successfully!');
        await fetchProfile();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to upload resume', 'error');
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      await usersApi.deleteResume();
      showToast('Resume deleted successfully');
      setIsDeleteResumeModalOpen(false);
      await fetchProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete resume', 'error');
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploadingPhoto(true);
    try {
      const res = await usersApi.uploadPhoto(file);
      if (res.success && res.data) {
        showToast('Profile photo updated!');
        updateUser({ profileImage: res.data });
        await fetchProfile();
      }
    } catch (err: any) {
      showToast('Failed to upload photo', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm animate-pulse space-y-6">
        <div className="h-24 w-24 bg-slate-200 rounded-2xl"></div>
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-40 bg-slate-100 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <div className="relative group">
          {profile?.profileImage ? (
            <img
              src={profile.profileImage}
              alt={profile.fullName}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 shadow-xs"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center font-bold text-3xl">
              {profile?.fullName?.charAt(0) || 'U'}
            </div>
          )}

          <label
            htmlFor="photo-upload"
            className="absolute -bottom-2 -right-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-md cursor-pointer transition"
            title="Change Avatar"
          >
            <Upload className="w-4 h-4" />
            <input
              id="photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-black text-slate-900">{profile?.fullName}</h2>
          <p className="text-sm font-semibold text-primary-600">
            {profile?.currentJobTitle || 'Professional Title Not Set'}
          </p>
          <div className="flex flex-wrap justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-2">
            <span className="flex items-center">
              <Mail className="w-3.5 h-3.5 mr-1 text-slate-400" /> {profile?.email}
            </span>
            {profile?.phone && (
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" /> {profile.phone}
              </span>
            )}
            {profile?.location && (
              <span className="flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" /> {profile.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Resume Management Section */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Resume & CV</h3>
            <p className="text-xs text-slate-500">Allowed formats: PDF, DOC, DOCX (Max 10MB)</p>
          </div>
        </div>

        {profile?.resumeUrl ? (
          <div className="p-4 rounded-2xl bg-primary-50/50 border border-primary-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  {profile.resumeFileName || 'Candidate_Resume.pdf'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  Uploaded {formatDate(profile.resumeUploadedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <a
                href={profile.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center space-x-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>View / Download</span>
              </a>

              <label
                htmlFor="resume-replace"
                className="px-3.5 py-2 bg-white border border-slate-200 text-primary-600 rounded-xl text-xs font-bold hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer transition"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Replace</span>
                <input
                  id="resume-replace"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsDeleteResumeModalOpen(true)}
                className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-400 transition cursor-pointer">
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className="hidden"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-primary-600">Click to upload your resume</p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
            </label>
          </div>
        )}
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleUpdateProfile} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
          Personal & Professional Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Current Job Title
            </label>
            <input
              type="text"
              value={currentJobTitle}
              onChange={(e) => setCurrentJobTitle(e.target.value)}
              placeholder="e.g. Senior Full Stack .NET Developer"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Bangalore, Karnataka"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Experience Level / Years
            </label>
            <input
              type="text"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              placeholder="e.g. 5+ Years"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Education / Degree
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="e.g. B.Tech in Computer Science, NIT Trichy"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Skills & Competencies (comma separated)
          </label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder=".NET Core, C#, React, TypeScript, SQL Server, Docker"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Professional Bio
            </label>
            <button
              type="button"
              onClick={handleOptimizeProfile}
              disabled={isOptimizingWithAi}
              className="inline-flex items-center text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 hover:bg-indigo-100/70 border border-indigo-200 px-3 py-1 rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
              {isOptimizingWithAi ? 'Analyzing...' : 'AI Bio Polish & Skill Extractor'}
            </button>
          </div>
          <textarea
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a concise overview of your technical background, achievements, and career goals, or click 'AI Bio Polish' to auto-generate..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" isLoading={isSaving} size="md" className="px-8">
            Save Profile Changes
          </Button>
        </div>
      </form>

      {/* AI Profile Polish Preview Modal */}
      <Modal
        isOpen={isAiOptimizeModalOpen}
        onClose={() => setIsAiOptimizeModalOpen(false)}
        title="AI Profile Optimization Suggestions"
        maxWidth="lg"
      >
        <div className="space-y-5">
          {aiOptimizationResult && (
            <div className="space-y-4">
              {/* Suggested Headline */}
              <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/50 p-4 rounded-2xl border border-indigo-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Suggested Headline
                </span>
                <p className="text-sm font-extrabold text-slate-900">{aiOptimizationResult.suggestedHeadline}</p>
              </div>

              {/* Enhanced Bio */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Enhanced Executive Bio
                </span>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
                  {aiOptimizationResult.enhancedBio}
                </div>
              </div>

              {/* Extracted Skills */}
              {aiOptimizationResult.extractedSkills.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Extracted Technical Skills ({aiOptimizationResult.extractedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiOptimizationResult.extractedSkills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-lg"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement Tips */}
              {aiOptimizationResult.improvementTips.length > 0 && (
                <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-1.5 text-xs text-emerald-900">
                  <span className="font-bold text-[11px] uppercase tracking-wider flex items-center">
                    <TrendingUp className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Resume & ATS Optimization Advice
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-emerald-800">
                    {aiOptimizationResult.improvementTips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setIsAiOptimizeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyAiOptimization} leftIcon={<Sparkles className="w-4 h-4" />}>
              Apply Suggestions to Profile
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Resume Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteResumeModalOpen}
        onClose={() => setIsDeleteResumeModalOpen(false)}
        onConfirm={handleDeleteResume}
        title="Delete Resume"
        message="Are you sure you want to delete your stored resume? You can upload a new one at any time."
        confirmText="Delete File"
      />
    </div>
  );
};
