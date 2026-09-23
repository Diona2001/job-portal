import api from './axios';
import { ApiResponse, UserProfile } from '../types';

export const usersApi = {
  getProfile: async () => {
    const res = await api.get<ApiResponse<UserProfile>>('/users/profile');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put<ApiResponse<UserProfile>>('/users/profile', data);
    return res.data;
  },
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<string>>('/users/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  deleteResume: async () => {
    const res = await api.delete<ApiResponse<boolean>>('/users/resume');
    return res.data;
  },
  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<string>>('/users/upload-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
  changePassword: async (data: { currentPassword: string; newPassword: string }) => {
    const res = await api.post<ApiResponse<boolean>>('/users/change-password', data);
    return res.data;
  },
};
