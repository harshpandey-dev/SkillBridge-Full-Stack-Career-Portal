import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { notificationQuerySchema } from '../validators/notification.validator';

export class NotificationController {
  // GET /api/v1/notifications (Authenticated users)
  static async getNotifications(req: Request, res: Response): Promise<void> {
    const query = notificationQuerySchema.parse(req.query);
    const result = await NotificationService.getNotifications(req.user!.id, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/notifications/unread-count (Authenticated users)
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const result = await NotificationService.getUnreadCount(req.user!.id);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/notifications/:notificationId (Authenticated users)
  static async getNotificationById(req: Request, res: Response): Promise<void> {
    const notification = await NotificationService.getNotificationById(
      req.user!.id,
      req.params.notificationId
    );

    res.status(200).json({
      success: true,
      data: { notification },
    });
  }

  // PATCH /api/v1/notifications/:notificationId/read (Authenticated users)
  static async markAsRead(req: Request, res: Response): Promise<void> {
    const notification = await NotificationService.markAsRead(
      req.user!.id,
      req.params.notificationId
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  }

  // PATCH /api/v1/notifications/read-all (Authenticated users)
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const result = await NotificationService.markAllAsRead(req.user!.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  // DELETE /api/v1/notifications/:notificationId (Authenticated users)
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    const result = await NotificationService.deleteNotification(
      req.user!.id,
      req.params.notificationId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  // DELETE /api/v1/notifications (Authenticated users)
  static async clearAllNotifications(req: Request, res: Response): Promise<void> {
    const result = await NotificationService.clearAllNotifications(req.user!.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  }
}
