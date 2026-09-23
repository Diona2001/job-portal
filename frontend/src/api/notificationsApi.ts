import api from './axios';
import { ApiResponse, NotificationItem } from '../types';

export const notificationsApi = {
  getNotifications: async () => {
    const res = await api.get<ApiResponse<NotificationItem[]>>('/notifications');
    return res.data;
  },
  markAsRead: async (id: number) => {
    const res = await api.put<ApiResponse<boolean>>(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.put<ApiResponse<boolean>>('/notifications/read-all');
    return res.data;
  },
  getUnreadCount: async () => {
    const res = await api.get<ApiResponse<number>>('/notifications/unread-count');
    return res.data;
  },
};
