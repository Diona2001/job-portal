import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { FindJobs } from '../pages/jobs/FindJobs';
import { JobDetails } from '../pages/jobs/JobDetails';
import { CompaniesPage } from '../pages/Companies';
import { NotFound } from '../pages/NotFound';

// Job Seeker Pages
import { JobSeekerDashboard } from '../pages/jobseeker/Dashboard';
import { JobSeekerProfile } from '../pages/jobseeker/Profile';
import { MyApplications } from '../pages/jobseeker/MyApplications';
import { SavedJobs } from '../pages/jobseeker/SavedJobs';

// Employer Pages
import { EmployerDashboard } from '../pages/employer/Dashboard';
import { CompanyProfilePage } from '../pages/employer/CompanyProfile';
import { PostJob } from '../pages/employer/PostJob';
import { MyJobs } from '../pages/employer/MyJobs';
import { Candidates } from '../pages/employer/Candidates';

// Admin Pages
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminUsers } from '../pages/admin/Users';
import { AdminCompanies } from '../pages/admin/Companies';
import { AdminJobs } from '../pages/admin/Jobs';

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/jobs" element={<FindJobs />} />
      <Route path="/jobs/:id" element={<JobDetails />} />
      <Route path="/companies" element={<CompaniesPage />} />

      {/* Job Seeker Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={['JobSeeker']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<JobSeekerDashboard />} />
        <Route path="profile" element={<JobSeekerProfile />} />
        <Route path="applications" element={<MyApplications />} />
        <Route path="saved-jobs" element={<SavedJobs />} />
      </Route>

      {/* Employer Protected Routes */}
      <Route
        path="/employer"
        element={
          <ProtectedRoute allowedRoles={['Employer']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployerDashboard />} />
        <Route path="profile" element={<CompanyProfilePage />} />
        <Route path="jobs/new" element={<PostJob />} />
        <Route path="jobs" element={<MyJobs />} />
        <Route path="candidates" element={<Candidates />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="jobs" element={<AdminJobs />} />
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
