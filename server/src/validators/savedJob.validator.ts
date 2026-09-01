import { z } from 'zod';
import { JobType, ExperienceLevel, JobStatus } from '@prisma/client';

export const savedJobsQuerySchema = z.object({
  search: z.string().trim().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  location: z.string().trim().optional(),
  isRemote: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .or(z.boolean())
    .optional(),
  status: z.nativeEnum(JobStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['recently_saved', 'oldest_saved', 'newest_job', 'deadline'])
    .optional()
    .default('recently_saved'),
});

export type SavedJobsQueryInput = z.infer<typeof savedJobsQuerySchema>;
