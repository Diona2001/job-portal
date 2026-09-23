import api from './axios';
import { ApiResponse, Job } from '../types';

export const savedJobsApi = {
  getSavedJobs: async () => {
    const res = await api.get<ApiResponse<Job[]>>('/saved-jobs');
    return res.data;
  },
  saveJob: async (jobId: number) => {
    const res = await api.post<ApiResponse<boolean>>(`/saved-jobs/${jobId}`);
    return res.data;
  },
  unsaveJob: async (jobId: number) => {
    const res = await api.delete<ApiResponse<boolean>>(`/saved-jobs/${jobId}`);
    return res.data;
  },
};
