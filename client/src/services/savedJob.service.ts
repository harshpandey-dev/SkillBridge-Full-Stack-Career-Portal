import { api } from '../lib/api';
import type { Job } from '../types';
import { mapBackendJobToUIJob } from './job.service';

export interface SavedJobsQuery {
  search?: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  isRemote?: boolean;
  page?: number;
  limit?: number;
  sort?: 'recently_saved' | 'oldest_saved' | 'newest_job' | 'deadline';
}

export interface BackendSavedJobItem {
  savedJobId: string;
  savedAt: string | Date;
  id: string;
  title: string;
  department?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  jobType: string;
  experienceLevel: string;
  location: string;
  isRemote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: string | Date | null;
  status: string;
  createdAt: string | Date;
  company?: {
    id: string;
    name: string;
    logo?: string | null;
    website?: string | null;
    location?: string | null;
  } | null;
  skills?: Array<{
    id: string;
    skill: {
      id: string;
      name: string;
    };
  }>;
}

export interface PaginatedSavedJobsResponse {
  items: BackendSavedJobItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const savedJobService = {
  // Save a Job (Student only)
  async saveJob(jobId: string): Promise<{ id: string; savedAt: string | Date }> {
    const response = await api.post<{ success: boolean; message: string; data: { savedJob: { id: string; savedAt: string | Date } } }>(
      `/jobs/${jobId}/save`
    );
    return response.data.data.savedJob;
  },

  // Remove a Saved Job (Student only)
  async removeSavedJob(jobId: string): Promise<{ message: string }> {
    const response = await api.delete<{ success: boolean; message: string }>(
      `/jobs/${jobId}/save`
    );
    return { message: response.data.message };
  },

  // Get Current Student's Saved Jobs
  async getMySavedJobs(query: SavedJobsQuery = {}): Promise<{
    jobs: Job[];
    rawItems: BackendSavedJobItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await api.get<{ success: boolean; data: PaginatedSavedJobsResponse }>(
      '/saved-jobs',
      { params: query }
    );
    const data = response.data.data;
    return {
      jobs: data.items.map(item => mapBackendJobToUIJob(item as any)),
      rawItems: data.items,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  },

  // Check if a specific job is saved by current student
  async checkSaveStatus(jobId: string): Promise<boolean> {
    const response = await api.get<{ success: boolean; data: { isSaved: boolean } }>(
      `/jobs/${jobId}/save-status`
    );
    return response.data.data.isSaved;
  },
};
