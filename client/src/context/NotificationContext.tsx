import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  notificationService,
  type NotificationItem,
} from '../services/notification.service';
import { useAuth } from './AuthContext';
import { getApiErrorMessage } from '../lib/api';

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  refreshUnreadCount: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Keep track of user ID to safely clear state on user switch or logout
  const currentUserIdRef = useRef<string | null>(null);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationService.getUnreadCount();
      setUnreadCount(res.unreadCount);
    } catch {
      // Fail silently for count polling/initialization
    }
  }, [user]);

  // Fetch full notification list
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const res = await notificationService.getNotifications({ limit: 30 });
      setNotifications(res.items);
      setUnreadCount(res.unreadCount);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load notifications.'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Sync with Auth state
  useEffect(() => {
    if (user?.id) {
      if (currentUserIdRef.current !== user.id) {
        currentUserIdRef.current = user.id;
        setNotifications([]);
        setUnreadCount(0);
        setIsOpen(false);
        refreshUnreadCount();
      }
    } else {
      currentUserIdRef.current = null;
      setNotifications([]);
      setUnreadCount(0);
      setIsOpen(false);
      setError(null);
    }
  }, [user, refreshUnreadCount]);

  // Fetch list whenever the panel is opened
  useEffect(() => {
    if (isOpen && user) {
      refreshNotifications();
    }
  }, [isOpen, user, refreshNotifications]);

  // Mark single notification as read (Optimistic update)
  const markAsRead = async (notificationId: string) => {
    const target = notifications.find(n => n.id === notificationId);
    if (!target || target.isRead) return;

    // Optimistic state
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await notificationService.markAsRead(notificationId);
    } catch {
      // Rollback on failure
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, isRead: false } : n))
      );
      setUnreadCount(prev => prev + 1);
    }
  };

  // Mark all notifications as read (Optimistic update)
  const markAllAsRead = async () => {
    if (notifications.length === 0 || unreadCount === 0) return;

    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    // Optimistic state
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    setActionLoading(true);

    try {
      await notificationService.markAllAsRead();
    } catch (err: unknown) {
      // Rollback on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(getApiErrorMessage(err, 'Failed to mark all as read.'));
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a single notification (Optimistic update)
  const deleteNotification = async (notificationId: string) => {
    const target = notifications.find(n => n.id === notificationId);
    if (!target) return;

    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    // Optimistic state
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    if (!target.isRead) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    try {
      await notificationService.deleteNotification(notificationId);
    } catch (err: unknown) {
      // Rollback on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(getApiErrorMessage(err, 'Failed to delete notification.'));
    }
  };

  // Clear all notifications (Optimistic update)
  const clearAll = async () => {
    if (notifications.length === 0) return;

    const previousNotifications = [...notifications];
    const previousUnreadCount = unreadCount;

    // Optimistic state
    setNotifications([]);
    setUnreadCount(0);
    setActionLoading(true);

    try {
      await notificationService.clearAllNotifications();
    } catch (err: unknown) {
      // Rollback on failure
      setNotifications(previousNotifications);
      setUnreadCount(previousUnreadCount);
      setError(getApiErrorMessage(err, 'Failed to clear notifications.'));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        actionLoading,
        error,
        isOpen,
        setIsOpen,
        refreshUnreadCount,
        refreshNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
