import { api } from '../lib/api';

export type NotificationType =
  | 'NEW_APPLICATION'
  | 'APPLICATION_STATUS_UPDATE'
  | 'SYSTEM'
  | string;

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

export const notificationService = {
  // 1. Get user notifications
  async getNotifications(query: NotificationQuery = {}): Promise<NotificationListResponse> {
    const response = await api.get<{
      success: boolean;
      data: NotificationListResponse;
    }>('/notifications', { params: query });
    return response.data.data;
  },

  // 2. Get unread notification count
  async getUnreadCount(): Promise<{ unreadCount: number }> {
    const response = await api.get<{
      success: boolean;
      data: { unreadCount: number };
    }>('/notifications/unread-count');
    return response.data.data;
  },

  // 3. Get single notification by ID
  async getNotificationById(notificationId: string): Promise<NotificationItem> {
    const response = await api.get<{
      success: boolean;
      data: { notification: NotificationItem };
    }>(`/notifications/${notificationId}`);
    return response.data.data.notification;
  },

  // 4. Mark single notification as read
  async markAsRead(notificationId: string): Promise<NotificationItem> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: { notification: NotificationItem };
    }>(`/notifications/${notificationId}/read`);
    return response.data.data.notification;
  },

  // 5. Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string; updatedCount: number }> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      updatedCount: number;
    }>('/notifications/read-all');
    return {
      message: response.data.message,
      updatedCount: response.data.updatedCount,
    };
  },

  // 6. Delete single notification
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await api.delete<{
      success: boolean;
      message: string;
    }>(`/notifications/${notificationId}`);
    return { message: response.data.message };
  },

  // 7. Clear all notifications
  async clearAllNotifications(): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete<{
      success: boolean;
      message: string;
      deletedCount: number;
    }>('/notifications');
    return {
      message: response.data.message,
      deletedCount: response.data.deletedCount,
    };
  },
};
