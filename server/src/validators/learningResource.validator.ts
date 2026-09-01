import { z } from 'zod';
import { Difficulty } from '@prisma/client';

export const createLearningResourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  provider: z
    .string()
    .trim()
    .min(2, 'Provider must be at least 2 characters')
    .max(100, 'Provider cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description cannot exceed 5000 characters')
    .optional()
    .nullable(),
  category: z
    .string()
    .trim()
    .min(1, 'Category is required')
    .max(100, 'Category cannot exceed 100 characters'),
  type: z
    .string()
    .trim()
    .min(1, 'Resource type is required')
    .max(50, 'Resource type cannot exceed 50 characters'),
  difficulty: z.nativeEnum(Difficulty).optional().default(Difficulty.BEGINNER),
  duration: z
    .string()
    .trim()
    .max(50, 'Duration cannot exceed 50 characters')
    .optional()
    .nullable(),
  resourceUrl: z.string().trim().url('Invalid resource URL'),
  thumbnail: z
    .string()
    .trim()
    .url('Invalid thumbnail URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  imageUrl: z
    .string()
    .trim()
    .url('Invalid image URL')
    .optional()
    .nullable()
    .or(z.literal('')),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  rating: z
    .coerce.number()
    .min(0, 'Rating must be at least 0')
    .max(5, 'Rating cannot exceed 5')
    .optional()
    .nullable(),
  featured: z.boolean().optional().default(false),
});

export const updateLearningResourceSchema = createLearningResourceSchema.partial();

export const resourceQuerySchema = z.object({
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  type: z.string().trim().optional(),
  featured: z
    .enum(['true', 'false'])
    .transform(val => val === 'true')
    .or(z.boolean())
    .optional(),
  provider: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  sort: z
    .enum(['newest', 'oldest', 'rating_desc', 'rating_asc', 'duration_asc', 'duration_desc'])
    .optional()
    .default('newest'),
});

export const featuredResourceQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).optional().default(6),
});

export const toggleFeaturedSchema = z.object({
  featured: z.boolean({ message: 'featured must be a boolean' }),
});

export type CreateLearningResourceInput = z.infer<typeof createLearningResourceSchema>;
export type UpdateLearningResourceInput = z.infer<typeof updateLearningResourceSchema>;
export type ResourceQueryInput = z.infer<typeof resourceQuerySchema>;
export type FeaturedResourceQueryInput = z.infer<typeof featuredResourceQuerySchema>;
export type ToggleFeaturedInput = z.infer<typeof toggleFeaturedSchema>;
