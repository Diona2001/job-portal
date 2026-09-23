import api from './axios';
import { ApiResponse, Job, JobFilterParams, PagedResult } from '../types';

export const jobsApi = {
  getJobs: async (params?: JobFilterParams) => {
    const res = await api.get<ApiResponse<PagedResult<Job>>>('/jobs', { params });
    return res.data;
  },
  getJob: async (id: number) => {
    const res = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
    return res.data;
  },
  getFeaturedJobs: async (count: number = 6) => {
    const res = await api.get<ApiResponse<Job[]>>('/jobs/featured', { params: { count } });
    return res.data;
  },
  getRecommendedJobs: async (count: number = 5) => {
    const res = await api.get<ApiResponse<Job[]>>('/jobs/recommended', { params: { count } });
    return res.data;
  },
  getMyJobs: async () => {
    const res = await api.get<ApiResponse<Job[]>>('/jobs/my-jobs');
    return res.data;
  },
  createJob: async (data: any) => {
    const res = await api.post<ApiResponse<Job>>('/jobs', data);
    return res.data;
  },
  updateJob: async (id: number, data: any) => {
    const res = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data);
    return res.data;
  },
  deleteJob: async (id: number) => {
    const res = await api.delete<ApiResponse<boolean>>(`/jobs/${id}`);
    return res.data;
  },
  updateJobStatus: async (id: number, status: string) => {
    const res = await api.put<ApiResponse<boolean>>(`/jobs/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  },
};
