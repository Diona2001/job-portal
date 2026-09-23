import api from './axios';
import { ApiResponse, Application, ApplicationStatusHistory } from '../types';

export const applicationsApi = {
  apply: async (data: { jobId: number; resumeUrl?: string; coverLetter?: string }) => {
    const res = await api.post<ApiResponse<Application>>('/applications', data);
    return res.data;
  },
  getMyApplications: async () => {
    const res = await api.get<ApiResponse<Application[]>>('/applications/my');
    return res.data;
  },
  getJobApplications: async (jobId: number) => {
    const res = await api.get<ApiResponse<Application[]>>(`/applications/job/${jobId}`);
    return res.data;
  },
  getCompanyApplications: async () => {
    const res = await api.get<ApiResponse<Application[]>>('/applications/company');
    return res.data;
  },
  updateStatus: async (id: number, status: string, comment?: string) => {
    const res = await api.put<ApiResponse<Application>>(`/applications/${id}/status`, { status, comment });
    return res.data;
  },
  getHistory: async (id: number) => {
    const res = await api.get<ApiResponse<ApplicationStatusHistory[]>>(`/applications/${id}/history`);
    return res.data;
  },
};
