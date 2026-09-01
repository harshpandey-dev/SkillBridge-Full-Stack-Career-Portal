import { z } from 'zod';
import { JobType, ExperienceLevel, JobStatus } from '@prisma/client';

export const createJobSchema = z
  .object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(150),
    department: z.string().max(100).optional().nullable(),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    responsibilities: z
      .array(z.string().min(1, 'Responsibility item cannot be empty'))
      .min(1, 'At least one responsibility is required'),
    requirements: z
      .array(z.string().min(1, 'Requirement item cannot be empty'))
      .min(1, 'At least one requirement is required'),
    benefits: z.array(z.string()).optional().default([]),
    jobType: z.nativeEnum(JobType, {
      message: 'Invalid job type',
    }),
    experienceLevel: z.nativeEnum(ExperienceLevel, {
      message: 'Invalid experience level',
    }),
    location: z.string().min(2, 'Location is required').max(150),
    isRemote: z.boolean().optional().default(false),
    salaryMin: z.coerce.number().int().min(0, 'Minimum salary must be positive').optional().nullable(),
    salaryMax: z.coerce.number().int().min(0, 'Maximum salary must be positive').optional().nullable(),
    applicationDeadline: z.coerce
      .date()
      .optional()
      .nullable()
      .refine(
        val => !val || val > new Date(),
        'Application deadline must be a future date'
      ),
    status: z
      .enum(['OPEN', 'DRAFT'], {
        message: 'New jobs must be OPEN or DRAFT',
      })
      .transform(val => val as JobStatus)
      .optional()
      .default('OPEN'),
    skills: z.array(z.string().trim().min(1)).optional().default([]),
  })
  .refine(
    data => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'Minimum salary cannot exceed maximum salary',
      path: ['salaryMin'],
    }
  );

export const updateJobSchema = z
  .object({
    title: z.string().min(3).max(150).optional(),
    department: z.string().max(100).optional().nullable(),
    description: z.string().min(10).optional(),
    responsibilities: z
      .array(z.string().min(1))
      .min(1)
      .optional(),
    requirements: z
      .array(z.string().min(1))
      .min(1)
      .optional(),
    benefits: z.array(z.string()).optional(),
    jobType: z.nativeEnum(JobType).optional(),
    experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
    location: z.string().min(2).max(150).optional(),
    isRemote: z.boolean().optional(),
    salaryMin: z.coerce.number().int().min(0).optional().nullable(),
    salaryMax: z.coerce.number().int().min(0).optional().nullable(),
    applicationDeadline: z.coerce.date().optional().nullable(),
    status: z.nativeEnum(JobStatus).optional(),
    skills: z.array(z.string().trim().min(1)).optional(),
  })
  .refine(
    data => {
      if (data.salaryMin != null && data.salaryMax != null) {
        return data.salaryMin <= data.salaryMax;
      }
      return true;
    },
    {
      message: 'Minimum salary cannot exceed maximum salary',
      path: ['salaryMin'],
    }
  );

export const jobQuerySchema = z.object({
  search: z.string().trim().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  location: z.string().trim().optional(),
  isRemote: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .or(z.boolean())
    .optional(),
  skills: z
    .string()
    .transform(val => val.split(',').map(s => s.trim()).filter(Boolean))
    .or(z.array(z.string()))
    .optional(),
  status: z.nativeEnum(JobStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['newest', 'oldest', 'deadline', 'salary_desc', 'salary_asc', 'salary'])
    .optional()
    .default('newest'),
});

export const myJobsQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['newest', 'oldest', 'deadline', 'salary_desc', 'salary_asc', 'salary'])
    .optional()
    .default('newest'),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type JobQueryInput = z.infer<typeof jobQuerySchema>;
export type MyJobsQueryInput = z.infer<typeof myJobsQuerySchema>;
