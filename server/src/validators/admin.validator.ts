import { z } from 'zod';
import { Role, UserStatus, JobStatus, JobType, ExperienceLevel, ApplicationStatus } from '@prisma/client';

export const adminUserQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  status: z.nativeEnum(UserStatus).optional(),
  sort: z.enum(['newest', 'oldest', 'name_asc', 'name_desc']).optional().default('newest'),
});

export const updateUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus, {
    message: 'Invalid status. Must be ACTIVE, SUSPENDED, or PENDING',
  }),
});

export const adminJobQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  jobType: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  isRemote: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .or(z.boolean())
    .optional(),
  sort: z
    .enum(['newest', 'oldest', 'deadline', 'salary_desc', 'salary_asc'])
    .optional()
    .default('newest'),
});

export const updateJobStatusSchema = z.object({
  status: z.nativeEnum(JobStatus, {
    message: 'Invalid status. Must be OPEN, CLOSED, or DRAFT',
  }),
});

export const adminApplicationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  search: z.string().trim().optional(),
  status: z.nativeEnum(ApplicationStatus).optional(),
  jobId: z.string().trim().optional(),
  sort: z.enum(['newest', 'oldest', 'recently_updated']).optional().default('newest'),
});

export const growthQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .refine(val => [7, 30, 90].includes(val), {
      message: 'days must be 7, 30, or 90',
    })
    .optional()
    .default(7),
});

export type AdminUserQueryInput = z.infer<typeof adminUserQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type AdminJobQueryInput = z.infer<typeof adminJobQuerySchema>;
export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;
export type AdminApplicationQueryInput = z.infer<typeof adminApplicationQuerySchema>;
export type GrowthQueryInput = z.infer<typeof growthQuerySchema>;
