import api from './axios';
import { ApiResponse, AuthResponse } from '../types';

export const authApi = {
  login: async (data: { email: string; password: string; rememberMe?: boolean }) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data;
  },
  register: async (data: any) => {
    const res = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<boolean>>('/auth/forgot-password', { email });
    return res.data;
  },
};
