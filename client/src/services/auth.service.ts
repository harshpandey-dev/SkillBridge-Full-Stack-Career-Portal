import { api } from '../lib/api';
import type { UserRole } from '../types';

export interface BackendUser {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
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

export interface LoginPayload {
  email: string;
  password: string;
}

export interface StudentRegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface RecruiterRegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyName?: string | null;
  position?: string | null;
  companySize?: string | null;
  companyWebsite?: string | null;
  companyDescription?: string | null;
  companyLocation?: string | null;
  phone?: string | null;
  location?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    user: BackendUser;
    token?: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: BackendUser;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Normalizes backend UPPERCASE roles ('STUDENT', 'RECRUITER', 'ADMIN')
 * to frontend lowercase roles ('student', 'recruiter', 'admin').
 */
export function normalizeUserRole(role: string): UserRole {
  const upper = role.toUpperCase();
  if (upper === 'STUDENT') return 'student';
  if (upper === 'RECRUITER') return 'recruiter';
  if (upper === 'ADMIN') return 'admin';
  return 'student';
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/login', payload);
    return response.data.data;
  },

  async registerStudent(payload: StudentRegisterPayload): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/register/student', payload);
    return response.data.data;
  },

  async registerRecruiter(payload: RecruiterRegisterPayload): Promise<AuthResponse['data']> {
    const response = await api.post<AuthResponse>('/auth/register/recruiter', payload);
    return response.data.data;
  },

  async getCurrentUser(): Promise<BackendUser> {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    try {
      await api.post<LogoutResponse>('/auth/logout');
    } catch {
      // Proceed even if server request fails
    }
  },
};
