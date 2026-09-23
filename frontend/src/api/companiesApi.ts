import api from './axios';
import { ApiResponse, Company } from '../types';

export const companiesApi = {
  getCompanies: async () => {
    const res = await api.get<ApiResponse<Company[]>>('/companies');
    return res.data;
  },
  getCompany: async (id: number) => {
    const res = await api.get<ApiResponse<Company>>(`/companies/${id}`);
    return res.data;
  },
  getMyCompany: async () => {
    const res = await api.get<ApiResponse<Company>>('/companies/me');
    return res.data;
  },
  updateCompanyProfile: async (data: any) => {
    const res = await api.put<ApiResponse<Company>>('/companies/profile', data);
    return res.data;
  },
  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<string>>('/companies/upload-logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },
};
