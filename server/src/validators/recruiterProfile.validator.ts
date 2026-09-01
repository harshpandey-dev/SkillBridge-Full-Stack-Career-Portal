import { z } from 'zod';

export const updateRecruiterProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters').optional(),
  phone: z.string().trim().max(25, 'Phone number cannot exceed 25 characters').optional().nullable(),
  location: z.string().trim().max(100, 'Location cannot exceed 100 characters').optional().nullable(),
  profileImage: z.string().url('Invalid profile image URL').optional().nullable().or(z.literal('')),
  position: z.string().trim().max(100, 'Position cannot exceed 100 characters').optional().nullable(),

  // Flat company fields
  companyName: z.string().trim().min(1, 'Company name cannot be empty').max(150, 'Company name cannot exceed 150 characters').optional(),
  companyWebsite: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
  companyDescription: z.string().trim().max(2000, 'Company description cannot exceed 2000 characters').optional().nullable(),
  companySize: z.string().trim().max(50, 'Company size cannot exceed 50 characters').optional().nullable(),
  companyLogo: z.string().url('Invalid logo URL').optional().nullable().or(z.literal('')),
  companyLocation: z.string().trim().max(150, 'Company location cannot exceed 150 characters').optional().nullable(),

  // Nested company object support
  company: z
    .object({
      name: z.string().trim().min(1, 'Company name cannot be empty').max(150, 'Company name cannot exceed 150 characters').optional(),
      website: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
      description: z.string().trim().max(2000, 'Company description cannot exceed 2000 characters').optional().nullable(),
      size: z.string().trim().max(50, 'Company size cannot exceed 50 characters').optional().nullable(),
      logo: z.string().url('Invalid logo URL').optional().nullable().or(z.literal('')),
      location: z.string().trim().max(150, 'Company location cannot exceed 150 characters').optional().nullable(),
    })
    .optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  newApplications: z.boolean({ message: 'newApplications must be a boolean' }).optional(),
  applicationUpdates: z.boolean({ message: 'applicationUpdates must be a boolean' }).optional(),
  jobPerformanceUpdates: z.boolean({ message: 'jobPerformanceUpdates must be a boolean' }).optional(),
  platformAnnouncements: z.boolean({ message: 'platformAnnouncements must be a boolean' }).optional(),
});

export type UpdateRecruiterProfileInput = z.infer<typeof updateRecruiterProfileSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
