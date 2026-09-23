import api from './axios';
import { ApiResponse, Interview } from '../types';

export const interviewsApi = {
  getInterviews: async () => {
    const res = await api.get<ApiResponse<Interview[]>>('/interviews');
    return res.data;
  },
  scheduleInterview: async (data: {
    applicationId: number;
    interviewDate: string;
    interviewTime: string;
    interviewType: string;
    meetingLink?: string;
    notes?: string;
  }) => {
    const res = await api.post<ApiResponse<Interview>>('/interviews', data);
    return res.data;
  },
  updateInterview: async (id: number, data: any) => {
    const res = await api.put<ApiResponse<Interview>>(`/interviews/${id}`, data);
    return res.data;
  },
};
