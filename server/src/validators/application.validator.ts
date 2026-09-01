import { z } from 'zod';
import { ApplicationStatus } from '@prisma/client';

export const applyJobSchema = z.object({
  coverLetter: z.string().max(5000, 'Cover letter cannot exceed 5000 characters').optional().nullable(),
  resumeUrl: z.string().url('Invalid resume URL').optional().nullable().or(z.literal('')),
});

export const updateApplicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    message: 'Invalid application status',
  }),
});

export const myApplicationsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z
    .enum(['ALL', ...Object.values(ApplicationStatus)])
    .optional()
    .default('ALL'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['newest', 'oldest', 'recently_updated'])
    .optional()
    .default('newest'),
});

export const jobApplicantsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z
    .enum(['ALL', ...Object.values(ApplicationStatus)])
    .optional()
    .default('ALL'),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['newest', 'oldest', 'gpa_desc', 'recently_updated'])
    .optional()
    .default('newest'),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;
export type MyApplicationsQueryInput = z.infer<typeof myApplicationsQuerySchema>;
export type JobApplicantsQueryInput = z.infer<typeof jobApplicantsQuerySchema>;
