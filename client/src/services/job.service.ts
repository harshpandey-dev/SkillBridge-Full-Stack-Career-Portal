import { api } from '../lib/api';
import type { Job, JobType, JobStatus } from '../types';

export interface BackendJobSkill {
  id: string;
  skill: {
    id: string;
    name: string;
  };
}

export interface BackendCompany {
  id: string;
  name: string;
  website?: string | null;
  description?: string | null;
  size?: string | null;
  logo?: string | null;
  location?: string | null;
}

export interface BackendRecruiter {
  id: string;
  position?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
  };
}

export interface BackendJob {
  id: string;
  recruiterId: string;
  companyId: string;
  title: string;
  department?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  experienceLevel: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE';
  location: string;
  isRemote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: string | Date | null;
  status: 'OPEN' | 'CLOSED' | 'DRAFT';
  createdAt: string | Date;
  updatedAt: string | Date;
  company?: BackendCompany;
  skills?: BackendJobSkill[];
  recruiter?: BackendRecruiter;
  _count?: {
    applications: number;
  };
}

export interface JobQueryPayload {
  search?: string;
  jobType?: string;
  experienceLevel?: string;
  location?: string;
  isRemote?: boolean;
  skills?: string | string[];
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'deadline' | 'salary_desc' | 'salary_asc' | 'salary';
}

export interface MyJobsQueryPayload {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'deadline' | 'salary_desc' | 'salary_asc' | 'salary';
}

export interface CreateJobPayload {
  title: string;
  department?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits?: string[];
  jobType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  experienceLevel: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE';
  location: string;
  isRemote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: string | Date | null;
  status?: 'OPEN' | 'DRAFT';
  skills?: string[];
}

export interface UpdateJobPayload {
  title?: string;
  department?: string | null;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  jobType?: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  experienceLevel?: 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE';
  location?: string;
  isRemote?: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: string | Date | null;
  status?: 'OPEN' | 'CLOSED' | 'DRAFT';
  skills?: string[];
}

export interface PaginatedJobsResponse {
  items: BackendJob[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const BRAND_COLORS = [
  '#2563EB', '#163A5F', '#0F9D8A', '#D97706', '#7C3AED',
  '#DB2777', '#059669', '#4F46E5', '#EA580C', '#0284C7',
];

export function getCompanyColor(companyName: string): string {
  if (!companyName) return BRAND_COLORS[0];
  let hash = 0;
  for (let i = 0; i < companyName.length; i++) {
    hash = companyName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % BRAND_COLORS.length;
  return BRAND_COLORS[index];
}

export function formatJobTypeToUI(jobType: string): JobType {
  switch (jobType) {
    case 'FULL_TIME': return 'Full-time';
    case 'PART_TIME': return 'Part-time';
    case 'INTERNSHIP': return 'Internship';
    case 'CONTRACT': return 'Contract';
    default: return 'Full-time';
  }
}

export function formatUIToBackendJobType(uiType: string): 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE' {
  const norm = uiType.toLowerCase().replace(/[^a-z]/g, '');
  if (norm.includes('part')) return 'PART_TIME';
  if (norm.includes('intern')) return 'INTERNSHIP';
  if (norm.includes('contract')) return 'CONTRACT';
  if (norm.includes('remote')) return 'REMOTE';
  return 'FULL_TIME';
}

export function formatExperienceLevelToUI(level: string): string {
  switch (level) {
    case 'ENTRY_LEVEL': return 'Entry Level';
    case 'MID_LEVEL': return 'Mid Level';
    case 'SENIOR_LEVEL': return 'Senior';
    case 'DIRECTOR': return 'Director';
    case 'EXECUTIVE': return 'Executive';
    default: return 'Entry Level';
  }
}

export function formatUIToBackendExperienceLevel(uiLevel: string): 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE' {
  const norm = uiLevel.toLowerCase();
  if (norm.includes('senior')) return 'SENIOR_LEVEL';
  if (norm.includes('mid')) return 'MID_LEVEL';
  if (norm.includes('director')) return 'DIRECTOR';
  if (norm.includes('exec')) return 'EXECUTIVE';
  return 'ENTRY_LEVEL';
}

export function formatSalary(min?: number | null, max?: number | null): string {
  if (min != null && max != null) {
    const formatNum = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
    return `${formatNum(min)} – ${formatNum(max)}`;
  }
  if (min != null) {
    return min >= 1000 ? `From $${Math.round(min / 1000)}k` : `From $${min}`;
  }
  if (max != null) {
    return max >= 1000 ? `Up to $${Math.round(max / 1000)}k` : `Up to $${max}`;
  }
  return 'Competitive';
}

export function formatRelativeTime(dateInput: string | Date): string {
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return '1d ago';
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return `${Math.floor(diffDays / 30)}mo ago`;
  } catch {
    return 'Recently';
  }
}

export function formatDeadline(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Open';
  try {
    const date = new Date(dateInput);
    return date.toISOString().split('T')[0];
  } catch {
    return 'Open';
  }
}

export function mapBackendJobToUIJob(backendJob: BackendJob): Job {
  const companyName = backendJob.company?.name || 'SkillBridge Partner';
  const statusMap: Record<string, JobStatus> = {
    OPEN: 'Open',
    CLOSED: 'Closed',
    DRAFT: 'Draft',
  };

  const skillsList = backendJob.skills && backendJob.skills.length > 0
    ? backendJob.skills.map(s => s.skill?.name || '').filter(Boolean)
    : [];

  return {
    id: backendJob.id,
    title: backendJob.title,
    company: companyName,
    companyColor: getCompanyColor(companyName),
    location: backendJob.location,
    type: formatJobTypeToUI(backendJob.jobType),
    salary: formatSalary(backendJob.salaryMin, backendJob.salaryMax),
    skills: skillsList,
    description: backendJob.description,
    responsibilities: backendJob.responsibilities || [],
    requirements: backendJob.requirements || [],
    benefits: backendJob.benefits || [],
    postedDate: formatRelativeTime(backendJob.createdAt),
    deadline: formatDeadline(backendJob.applicationDeadline),
    applicants: backendJob._count?.applications ?? 0,
    status: statusMap[backendJob.status] || 'Open',
    department: backendJob.department || 'Engineering',
    experience: formatExperienceLevelToUI(backendJob.experienceLevel),
    remote: Boolean(backendJob.isRemote),
    recruiterId: backendJob.recruiterId,
  };
}

export const jobService = {
  async getJobs(query: JobQueryPayload = {}): Promise<{ jobs: Job[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const response = await api.get<{ success: boolean; data: PaginatedJobsResponse }>('/jobs', {
      params: query,
    });
    const data = response.data.data;
    return {
      jobs: data.items.map(mapBackendJobToUIJob),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  },

  async getJobById(jobId: string): Promise<Job> {
    const response = await api.get<{ success: boolean; data: { job: BackendJob } }>(`/jobs/${jobId}`);
    return mapBackendJobToUIJob(response.data.data.job);
  },

  async getRawJobById(jobId: string): Promise<BackendJob> {
    const response = await api.get<{ success: boolean; data: { job: BackendJob } }>(`/jobs/${jobId}`);
    return response.data.data.job;
  },

  async getMyJobs(query: MyJobsQueryPayload = {}): Promise<{ jobs: Job[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const response = await api.get<{ success: boolean; data: PaginatedJobsResponse }>('/jobs/my-jobs', {
      params: query,
    });
    const data = response.data.data;
    return {
      jobs: data.items.map(mapBackendJobToUIJob),
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  },

  async createJob(payload: CreateJobPayload): Promise<Job> {
    const response = await api.post<{ success: boolean; message: string; data: { job: BackendJob } }>('/jobs', payload);
    return mapBackendJobToUIJob(response.data.data.job);
  },

  async updateJob(jobId: string, payload: UpdateJobPayload): Promise<Job> {
    const response = await api.patch<{ success: boolean; message: string; data: { job: BackendJob } }>(`/jobs/${jobId}`, payload);
    return mapBackendJobToUIJob(response.data.data.job);
  },

  async closeJob(jobId: string): Promise<Job> {
    const response = await api.patch<{ success: boolean; message: string; data: { job: BackendJob } }>(`/jobs/${jobId}/close`);
    return mapBackendJobToUIJob(response.data.data.job);
  },

  async reopenJob(jobId: string): Promise<Job> {
    const response = await api.patch<{ success: boolean; message: string; data: { job: BackendJob } }>(`/jobs/${jobId}/reopen`);
    return mapBackendJobToUIJob(response.data.data.job);
  },

  async deleteJob(jobId: string): Promise<void> {
    await api.delete<{ success: boolean; message: string }>(`/jobs/${jobId}`);
  },
};
