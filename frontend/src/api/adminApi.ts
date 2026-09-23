import api from './axios';
import { AdminDashboardStats, ApiResponse, Company, Job, UserProfile } from '../types';

export const adminApi = {
  getDashboard: async () => {
    const res = await api.get<ApiResponse<AdminDashboardStats>>('/admin/dashboard');
    return res.data;
  },
  getUsers: async () => {
    const res = await api.get<ApiResponse<UserProfile[]>>('/admin/users');
    return res.data;
  },
  toggleUserStatus: async (id: number) => {
    const res = await api.put<ApiResponse<boolean>>(`/admin/users/${id}/toggle-status`);
    return res.data;
  },
  getCompanies: async () => {
    const res = await api.get<ApiResponse<Company[]>>('/admin/companies');
    return res.data;
  },
  toggleCompanyVerify: async (id: number) => {
    const res = await api.put<ApiResponse<boolean>>(`/admin/companies/${id}/toggle-verify`);
    return res.data;
  },
  getJobs: async () => {
    const res = await api.get<ApiResponse<Job[]>>('/admin/jobs');
    return res.data;
  },
  updateJobStatus: async (id: number, status: string) => {
    const res = await api.put<ApiResponse<boolean>>(`/admin/jobs/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  },
};
