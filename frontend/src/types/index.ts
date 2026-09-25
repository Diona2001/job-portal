export type Role = 'Admin' | 'Employer' | 'JobSeeker';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  location?: string;
  profileImage?: string;
  createdAt: string;
  jobSeekerProfileId?: number;
  companyId?: number;
  companyName?: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
  role: Role;
  profileImage?: string;
  companyId?: number;
  companyName?: string;
  jobSeekerProfileId?: number;
}

export interface Job {
  id: number;
  companyId: number;
  companyName: string;
  companyLogoUrl?: string;
  companyWebsite?: string;
  companySize?: string;
  companyIndustry?: string;
  title: string;
  description: string;
  responsibilities?: string;
  requirements?: string;
  skills?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  employmentType: 'FullTime' | 'PartTime' | 'Contract' | 'Internship' | 'Freelance';
  workplaceType: 'Remote' | 'Hybrid' | 'Onsite';
  location: string;
  benefits?: string;
  applicationDeadline?: string;
  status: 'Active' | 'Closed' | 'Draft';
  createdAt: string;
  applicationsCount: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}

export interface JobFilterParams {
  keyword?: string;
  location?: string;
  employmentType?: string;
  workplaceType?: string;
  experienceLevel?: string;
  industry?: string;
  minSalary?: number;
  maxSalary?: number;
  datePosted?: string;
  sortBy?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Application {
  id: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  companyLogoUrl?: string;
  jobLocation: string;
  employmentType: string;
  jobSeekerProfileId: number;
  applicantName: string;
  applicantEmail: string;
  applicantPhone?: string;
  applicantProfileImage?: string;
  applicantCurrentTitle?: string;
  applicantExperience?: string;
  applicantSkills?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: 'Applied' | 'Under Review' | 'Shortlisted' | 'Interview' | 'Selected' | 'Rejected';
  appliedAt: string;
  updatedAt?: string;
  statusHistories: ApplicationStatusHistory[];
}

export interface ApplicationStatusHistory {
  id: number;
  status: string;
  comment?: string;
  changedBy?: string;
  createdAt: string;
}

export interface Company {
  id: number;
  userId: number;
  companyName: string;
  description?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  logoUrl?: string;
  location?: string;
  isVerified: boolean;
  createdAt: string;
  activeJobsCount: number;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  phone?: string;
  location?: string;
  profileImage?: string;
  createdAt: string;
  jobSeekerProfileId?: number;
  bio?: string;
  currentJobTitle?: string;
  experience?: string;
  education?: string;
  skills?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  resumeUploadedAt?: string;
  companyId?: number;
  companyName?: string;
}

export interface Interview {
  id: number;
  applicationId: number;
  jobId: number;
  jobTitle: string;
  companyName: string;
  candidateName: string;
  candidateEmail: string;
  interviewDate: string;
  interviewTime: string;
  interviewType: 'Online' | 'Phone' | 'In-person';
  meetingLink?: string;
  notes?: string;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalJobSeekers: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  totalInterviews: number;
  monthlyApplications: { month: string; count: number }[];
  monthlyJobs: { month: string; count: number }[];
  applicationsByStatus: { status: string; count: number }[];
}

export * from './ai.types';
