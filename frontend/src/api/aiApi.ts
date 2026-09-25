import api from './axios';
import {
  ApiResponse,
  JobMatchAnalysis,
  GenerateCoverLetterRequest,
  GenerateCoverLetterResponse,
  GenerateJobDescriptionRequest,
  GeneratedJobDescription,
  OptimizeProfileRequest,
  OptimizeProfileResponse
} from '../types';

export const aiApi = {
  getJobMatchAnalysis: async (jobId: number, jobSeekerUserId?: number) => {
    const res = await api.post<ApiResponse<JobMatchAnalysis>>('/ai/match-analysis', {
      jobId,
      jobSeekerUserId
    });
    return res.data;
  },

  generateCoverLetter: async (data: GenerateCoverLetterRequest) => {
    const res = await api.post<ApiResponse<GenerateCoverLetterResponse>>('/ai/generate-cover-letter', data);
    return res.data;
  },

  generateJobDescription: async (data: GenerateJobDescriptionRequest) => {
    const res = await api.post<ApiResponse<GeneratedJobDescription>>('/ai/generate-job-description', data);
    return res.data;
  },

  optimizeProfile: async (data: OptimizeProfileRequest) => {
    const res = await api.post<ApiResponse<OptimizeProfileResponse>>('/ai/optimize-profile', data);
    return res.data;
  },

  getCandidateMatch: async (applicationId: number) => {
    const res = await api.get<ApiResponse<JobMatchAnalysis>>(`/ai/candidate-match/${applicationId}`);
    return res.data;
  },

  sendChatMessage: async (data: { message: string; conversationHistory?: { role: string; content: string }[] }) => {
    const res = await api.post<ApiResponse<import('../types').ChatResponse>>('/ai/chat', data);
    return res.data;
  }
};
