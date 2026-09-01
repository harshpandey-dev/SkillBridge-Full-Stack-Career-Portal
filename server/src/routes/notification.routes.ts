import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All notification routes require authenticated user
router.use(authenticate);

// Collection routes
router.get('/', NotificationController.getNotifications);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/read-all', NotificationController.markAllAsRead);
router.delete('/', NotificationController.clearAllNotifications);

// Individual item routes
router.get('/:notificationId', NotificationController.getNotificationById);
router.patch('/:notificationId/read', NotificationController.markAsRead);
router.delete('/:notificationId', NotificationController.deleteNotification);

export default router;
