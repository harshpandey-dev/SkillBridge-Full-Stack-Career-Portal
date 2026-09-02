import { api } from '../lib/api';

export interface CompanyData {
  id: string;
  name: string;
  website?: string | null;
  description?: string | null;
  size?: string | null;
  logo?: string | null;
  location?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface RecruiterProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    profileImage?: string | null;
    phone?: string | null;
    location?: string | null;
    createdAt: string | Date;
  };
  recruiterProfile: {
    id: string;
    position?: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  };
  company: CompanyData | null;
}

export interface UpdateRecruiterProfilePayload {
  name?: string;
  phone?: string | null;
  location?: string | null;
  profileImage?: string | null;
  position?: string | null;
  companyName?: string;
  companyWebsite?: string | null;
  companyDescription?: string | null;
  companySize?: string | null;
  companyLogo?: string | null;
  companyLocation?: string | null;
  company?: {
    name?: string;
    website?: string | null;
    description?: string | null;
    size?: string | null;
    logo?: string | null;
    location?: string | null;
  };
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

export interface RecruiterNotificationPreferences {
  newApplications: boolean;
  applicationUpdates: boolean;
  jobPerformanceUpdates: boolean;
  platformAnnouncements: boolean;
  updatedAt?: string | Date;
}

export const recruiterProfileService = {
  // 1. Get Recruiter Profile
  async getProfile(): Promise<RecruiterProfileData> {
    const response = await api.get<{ success: boolean; data: RecruiterProfileData }>(
      '/recruiter/profile'
    );
    return response.data.data;
  },

  // 2. Update Recruiter Profile & Company
  async updateProfile(data: UpdateRecruiterProfilePayload): Promise<RecruiterProfileData> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: RecruiterProfileData;
    }>('/recruiter/profile', data);
    return response.data.data;
  },

  // 3. Get Real Recruiter Statistics
  async getRecruiterStats(): Promise<RecruiterStats> {
    const response = await api.get<{ success: boolean; data: RecruiterStats }>(
      '/recruiter/profile/stats'
    );
    return response.data.data;
  },

  // 4. Get Recruiter Job Summary
  async getJobSummary(): Promise<RecruiterJobSummary> {
    const response = await api.get<{ success: boolean; data: RecruiterJobSummary }>(
      '/recruiter/profile/job-summary'
    );
    return response.data.data;
  },

  // 5. Get Notification Preferences
  async getNotificationPreferences(): Promise<RecruiterNotificationPreferences> {
    const response = await api.get<{
      success: boolean;
      data: RecruiterNotificationPreferences;
    }>('/recruiter/profile/notification-preferences');
    return response.data.data;
  },

  // 6. Update Notification Preferences
  async updateNotificationPreferences(
    data: Partial<RecruiterNotificationPreferences>
  ): Promise<RecruiterNotificationPreferences> {
    const response = await api.patch<{
      success: boolean;
      message: string;
      data: RecruiterNotificationPreferences;
    }>('/recruiter/profile/notification-preferences', data);
    return response.data.data;
  },
};
