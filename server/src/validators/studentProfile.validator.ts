import { z } from 'zod';

export const updateStudentProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  phone: z.string().trim().max(25, 'Phone number cannot exceed 25 characters').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional().nullable(),
  profileImage: z.string().url('Invalid profile image URL').optional().nullable().or(z.literal('')),
  university: z.string().trim().min(2, 'University name must be at least 2 characters').max(150, 'University name cannot exceed 150 characters').optional(),
  major: z.string().trim().min(2, 'Major must be at least 2 characters').max(100, 'Major cannot exceed 100 characters').optional(),
  graduationYear: z.coerce.number().int().min(1980, 'Graduation year must be 1980 or later').max(2050, 'Graduation year must be 2050 or earlier').optional(),
  gpa: z.coerce.number().min(0.0, 'GPA cannot be negative').max(4.0, 'GPA cannot exceed 4.0').optional().nullable(),
  bio: z.string().trim().max(2000, 'Bio cannot exceed 2000 characters').optional().nullable(),
  resumeUrl: z.string().url('Invalid resume URL').optional().nullable().or(z.literal('')),
});

export const addStudentSkillSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Skill name is required')
    .max(50, 'Skill name cannot exceed 50 characters'),
});

export type UpdateStudentProfileInput = z.infer<typeof updateStudentProfileSchema>;
export type AddStudentSkillInput = z.infer<typeof addStudentSkillSchema>;
