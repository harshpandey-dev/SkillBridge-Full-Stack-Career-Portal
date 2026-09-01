import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordErrorMessage =
  'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.';

export const studentRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().regex(passwordRegex, passwordErrorMessage),
    confirmPassword: z.string(),
    university: z.string().min(2, 'University is required').max(150),
    major: z.string().min(2, 'Major is required').max(100),
    graduationYear: z.coerce
      .number()
      .int()
      .min(1980, 'Invalid graduation year')
      .max(2040, 'Invalid graduation year'),
    gpa: z.coerce.number().min(0).max(10).optional().nullable(),
    bio: z.string().max(1000).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const recruiterRegisterSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').trim().toLowerCase(),
    password: z.string().regex(passwordRegex, passwordErrorMessage),
    confirmPassword: z.string(),
    position: z.string().max(100).optional().nullable(),
    companyId: z.string().optional().nullable(),
    companyName: z.string().max(100).optional().nullable(),
    companyWebsite: z.string().url('Invalid website URL').optional().nullable().or(z.literal('')),
    companyDescription: z.string().max(1000).optional().nullable(),
    companySize: z.string().max(50).optional().nullable(),
    companyLocation: z.string().max(100).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    location: z.string().max(100).optional().nullable(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export type StudentRegisterInput = z.infer<typeof studentRegisterSchema>;
export type RecruiterRegisterInput = z.infer<typeof recruiterRegisterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
