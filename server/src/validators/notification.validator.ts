import { z } from 'zod';

export const notificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  isRead: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .or(z.boolean())
    .optional(),
});

export type NotificationQueryInput = z.infer<typeof notificationQuerySchema>;
