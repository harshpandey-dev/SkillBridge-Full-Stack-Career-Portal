import { api } from '../lib/api';

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

export interface AdminUserItem {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  createdAt: string;
  studentProfile?: {
    id: string;
    university: string;
    major: string;
    graduationYear: number;
    gpa?: number | null;
  } | null;
  recruiterProfile?: {
    id: string;
    position?: string | null;
    company?: {
      id: string;
      name: string;
      logo?: string | null;
    } | null;
  } | null;
}

export interface PaginatedUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminUserQuery {
  search?: string;
  role?: 'STUDENT' | 'RECRUITER' | 'ADMIN';
  status?: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'name_asc' | 'name_desc';
}

export interface AdminJobItem {
  id: string;
  title: string;
  department?: string | null;
  location: string;
  jobType: string;
  experienceLevel: string;
  isRemote: boolean;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  company: {
    id: string;
    name: string;
    logo?: string | null;
  };
  recruiter?: {
    id: string;
    position?: string | null;
    user?: {
      name: string;
      email: string;
    };
  };
  _count?: {
    applications: number;
  };
}

export interface PaginatedJobsResponse {
  items: AdminJobItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminJobQuery {
  search?: string;
  status?: 'OPEN' | 'CLOSED' | 'DRAFT';
  jobType?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest';
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

export interface PlatformAnalytics {
  users: AdminDashboardStats['users'];
  jobs: AdminDashboardStats['jobs'] & { remote: number };
  applications: AdminDashboardStats['applications'];
  companies: AdminDashboardStats['companies'];
  resources: AdminDashboardStats['resources'];
  recentActivity: {
    recentUsers: {
      id: string;
      name: string;
      email: string;
      role: string;
      status: string;
      profileImage?: string | null;
      createdAt: string;
    }[];
    recentJobs: {
      id: string;
      title: string;
      jobType: string;
      location: string;
      status: string;
      createdAt: string;
      company: {
        id: string;
        name: string;
        logo?: string | null;
      };
    }[];
    recentApplications: {
      id: string;
      status: string;
      appliedAt: string;
      student: {
        user: {
          id: string;
          name: string;
          email: string;
          profileImage?: string | null;
        };
      };
      job: {
        id: string;
        title: string;
        company: {
          id: string;
          name: string;
          logo?: string | null;
        };
      };
    }[];
  };
}

export const adminService = {
  // 1. Dashboard Overview Stats
  async getDashboard(): Promise<AdminDashboardStats> {
    const response = await api.get<{ success: boolean; data: AdminDashboardStats }>('/admin/dashboard');
    return response.data.data;
  },

  // 2. User Management
  async getUsers(query: AdminUserQuery = {}): Promise<PaginatedUsersResponse> {
    const response = await api.get<{ success: boolean; data: PaginatedUsersResponse }>('/admin/users', {
      params: query,
    });
    return response.data.data;
  },

  async getUserById(userId: string): Promise<AdminUserItem> {
    const response = await api.get<{ success: boolean; data: { user: AdminUserItem } }>(
      `/admin/users/${userId}`
    );
    return response.data.data.user;
  },

  async updateUserStatus(
    userId: string,
    status: 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  ): Promise<AdminUserItem> {
    const response = await api.patch<{ success: boolean; message: string; data: { user: AdminUserItem } }>(
      `/admin/users/${userId}/status`,
      { status }
    );
    return response.data.data.user;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/users/${userId}`);
    return { message: response.data.message };
  },

  // 3. Job Management
  async getJobs(query: AdminJobQuery = {}): Promise<PaginatedJobsResponse> {
    const response = await api.get<{ success: boolean; data: PaginatedJobsResponse }>('/admin/jobs', {
      params: query,
    });
    return response.data.data;
  },

  async getJobById(jobId: string): Promise<AdminJobItem> {
    const response = await api.get<{ success: boolean; data: { job: AdminJobItem } }>(
      `/admin/jobs/${jobId}`
    );
    return response.data.data.job;
  },

  async updateJobStatus(jobId: string, status: 'OPEN' | 'CLOSED' | 'DRAFT'): Promise<AdminJobItem> {
    const response = await api.patch<{ success: boolean; message: string; data: { job: AdminJobItem } }>(
      `/admin/jobs/${jobId}/status`,
      { status }
    );
    return response.data.data.job;
  },

  async deleteJob(jobId: string): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(`/admin/jobs/${jobId}`);
    return { message: response.data.message };
  },

  // 4. Platform Analytics & Growth
  async getAnalytics(): Promise<PlatformAnalytics> {
    const response = await api.get<{ success: boolean; data: PlatformAnalytics }>('/admin/analytics');
    return response.data.data;
  },

  async getGrowthAnalytics(days: number = 7): Promise<GrowthAnalytics> {
    const response = await api.get<{ success: boolean; data: GrowthAnalytics }>('/admin/analytics/growth', {
      params: { days },
    });
    return response.data.data;
  },
};
