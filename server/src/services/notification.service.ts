import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError } from '../lib/errors';
import { NotificationQueryInput } from '../validators/notification.validator';

export class NotificationService {
  // 1. Get user notifications with pagination & read filtering
  static async getNotifications(userId: string, query: NotificationQueryInput) {
    const { page = 1, limit = 20, isRead } = query;

    const where: Prisma.NotificationWhereInput = {
      userId,
    };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const skip = (page - 1) * limit;

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 0,
      unreadCount,
    };
  }

  // 2. Get unread notification count
  static async getUnreadCount(userId: string) {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return { unreadCount };
  }

  // 3. Get single notification by ID
  static async getNotificationById(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    return notification;
  }

  // 4. Mark single notification as read
  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.isRead) {
      return notification;
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  // 5. Mark all user notifications as read
  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      message: 'All notifications marked as read',
      updatedCount: result.count,
    };
  }

  // 6. Delete single notification
  static async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError('Notification not found');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully' };
  }

  // 7. Clear all notifications for user
  static async clearAllNotifications(userId: string) {
    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    return {
      message: 'All notifications cleared successfully',
      deletedCount: result.count,
    };
  }

  // 8. Helper to create a notification
  static async createNotification(
    userId: string,
    title: string,
    message: string,
    type: string
  ) {
    return prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }
}
