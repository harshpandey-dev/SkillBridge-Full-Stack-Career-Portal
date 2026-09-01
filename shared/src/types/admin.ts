import { UserRole, UserStatus } from './user';
import { JobType, ExperienceLevel, JobStatus } from './job';

export interface AdminDashboardStats {
  users: {
    total: number;
    students: number;
    recruiters: number;
    admins: number;
    active: number;
    suspended: number;
    pending: number;
  };
  jobs: {
    total: number;
    open: number;
    closed: number;
    draft: number;
  };
  applications: {
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  companies: {
    total: number;
  };
  resources: {
    total: number;
    featured: number;
  };
}

export interface PlatformAnalytics {
  users: {
    total: number;
    students: number;
    recruiters: number;
    admins: number;
    active: number;
    suspended: number;
    pending: number;
  };
  jobs: {
    total: number;
    open: number;
    closed: number;
    draft: number;
    remote: number;
  };
  applications: {
    total: number;
    applied: number;
    underReview: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
  companies: {
    total: number;
  };
  resources: {
    total: number;
    featured: number;
  };
  recentActivity: {
    recentUsers: any[];
    recentJobs: any[];
    recentApplications: any[];
  };
}

export interface GrowthDataPoint {
  date: string;
  newUsers: number;
  newJobs: number;
  newApplications: number;
}

export interface GrowthAnalytics {
  period: number;
  data: GrowthDataPoint[];
}

export interface AdminUserQuery {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
}

export interface AdminJobQuery {
  search?: string;
  status?: JobStatus;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  isRemote?: boolean;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'deadline' | 'salary_desc' | 'salary_asc';
}

export interface AdminApplicationQuery {
  search?: string;
  status?: string;
  jobId?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'recently_updated';
}
