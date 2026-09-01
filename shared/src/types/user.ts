export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  profileImage?: string | null;
  profileImagePublicId?: string | null;
  phone?: string | null;
  location?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

export interface StudentProfile {
  id: string;
  userId: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number | null;
  bio?: string | null;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RecruiterProfile {
  id: string;
  userId: string;
  companyId?: string | null;
  position?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RecruiterNotificationPreference {
  id: string;
  recruiterId: string;
  newApplications: boolean;
  applicationUpdates: boolean;
  jobPerformanceUpdates: boolean;
  platformAnnouncements: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface RecruiterStats {
  activeJobs: number;
  totalApplicants: number;
  shortlistedCandidates: number;
  selectedCandidates: number;
}

export interface RecruiterJobSummary {
  openJobs: number;
  closedJobs: number;
  draftJobs: number;
  totalJobs: number;
  totalApplications: number;
}

export interface Company {
  id: string;
  name: string;
  website?: string | null;
  description?: string | null;
  size?: string | null;
  logo?: string | null;
  logoPublicId?: string | null;
  location?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export type NotificationType =
  | 'NEW_APPLICATION'
  | 'APPLICATION_STATUS_UPDATE'
  | 'JOB_STATUS_UPDATE'
  | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string | Date;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  isRead?: boolean;
}

export interface NotificationListResponse {
  items: Notification[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  unreadCount: number;
}

export interface ResumeUploadResponse {
  resumeUrl: string;
  resumePublicId: string;
}

export interface ProfileImageUploadResponse {
  profileImage: string;
  profileImagePublicId: string;
}

export interface CompanyLogoUploadResponse {
  logo: string;
  logoPublicId: string;
}
