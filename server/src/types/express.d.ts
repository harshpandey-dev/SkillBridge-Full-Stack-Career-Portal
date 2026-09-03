import 'express';
import 'multer';
import { Role, UserStatus } from '@prisma/client';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  status: UserStatus;
  profileImage?: string | null;
  phone?: string | null;
  location?: string | null;
  studentProfile?: {
    id: string;
    university: string;
    major: string;
    graduationYear: number;
    gpa?: number | null;
    bio?: string | null;
    resumeUrl?: string | null;
    resumePublicId?: string | null;
  } | null;
  recruiterProfile?: {
    id: string;
    companyId?: string | null;
    position?: string | null;
    company?: {
      id: string;
      name: string;
      website?: string | null;
      logo?: string | null;
    } | null;
  } | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
