import { z } from 'zod';

export const skillQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export type SkillQueryInput = z.infer<typeof skillQuerySchema>;
