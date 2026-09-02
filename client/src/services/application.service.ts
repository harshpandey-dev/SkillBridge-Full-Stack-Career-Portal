import { api } from '../lib/api';
import type { Application, Applicant, ApplicationStatus, JobType } from '../types';
import { getCompanyColor, formatRelativeTime, formatJobTypeToUI } from './job.service';

export interface BackendApplicationJob {
  id: string;
  title: string;
  jobType: string;
  experienceLevel: string;
  location: string;
  isRemote: boolean;
  status: string;
  company?: {
    id: string;
    name: string;
    logo?: string | null;
    website?: string | null;
    location?: string | null;
  } | null;
}

export interface BackendApplicationStudent {
  id: string;
  university: string;
  major: string;
  graduationYear: number;
  gpa?: number | null;
  bio?: string | null;
  resumeUrl?: string | null;
  user?: {
    id: string;
    name: string;
    email: string;
    profileImage?: string | null;
    phone?: string | null;
    location?: string | null;
  };
  skills?: Array<{
    skill: {
      id: string;
      name: string;
    };
  }>;
}

export interface BackendApplication {
  id: string;
  studentId: string;
  jobId: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';
  appliedAt: string | Date;
  updatedAt: string | Date;
  job?: BackendApplicationJob;
  student?: BackendApplicationStudent;
}

export interface ApplyJobPayload {
  coverLetter?: string | null;
  resumeUrl?: string | null;
}

export interface MyApplicationsQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'recently_updated';
}

export interface JobApplicantsQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sort?: 'newest' | 'oldest' | 'gpa_desc' | 'recently_updated';
}

export interface PaginatedApplicationsResponse<T = BackendApplication> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function formatApplicationStatusToUI(status: string): ApplicationStatus {
  switch (status) {
    case 'APPLIED': return 'Applied';
    case 'UNDER_REVIEW': return 'Under Review';
    case 'SHORTLISTED': return 'Shortlisted';
    case 'SELECTED': return 'Selected';
    case 'REJECTED': return 'Rejected';
    default: return 'Applied';
  }
}

export function formatUIToBackendApplicationStatus(status: string): string {
  const norm = status.toUpperCase().replace(/\s+/g, '_');
  if (norm === 'UNDER_REVIEW' || norm === 'SHORTLISTED' || norm === 'SELECTED' || norm === 'REJECTED') {
    return norm;
  }
  return 'APPLIED';
}

export function mapBackendApplicationToUI(backendApp: BackendApplication): Application {
  const companyName = backendApp.job?.company?.name || 'SkillBridge Partner';
  const jobTitle = backendApp.job?.title || 'Open Role';
  const location = backendApp.job?.location || 'Remote';
  const jobType = (backendApp.job?.jobType ? formatJobTypeToUI(backendApp.job.jobType) : 'Full-time') as JobType;

  return {
    id: backendApp.id,
    jobId: backendApp.jobId,
    jobTitle,
    company: companyName,
    companyColor: getCompanyColor(companyName),
    location,
    type: jobType,
    salary: 'Competitive',
    appliedDate: formatRelativeTime(backendApp.appliedAt),
    status: formatApplicationStatusToUI(backendApp.status),
    lastUpdated: formatRelativeTime(backendApp.updatedAt),
  };
}

export function mapBackendApplicantToUI(backendApp: BackendApplication, jobTitleFallback?: string): Applicant {
  const student = backendApp.student;
  const user = student?.user;
  const name = user?.name || 'Applicant';
  const email = user?.email || '';
  const university = student?.university || 'University Student';
  const major = student?.major || 'General Studies';
  const gpa = student?.gpa ? Number(student.gpa).toFixed(2) : '3.80';
  const skillsList = student?.skills ? student.skills.map(s => s.skill.name) : ['React', 'TypeScript'];
  const jobTitle = backendApp.job?.title || jobTitleFallback || 'Candidate';

  return {
    id: backendApp.id,
    name,
    email,
    university,
    major,
    gpa,
    skills: skillsList,
    appliedDate: formatRelativeTime(backendApp.appliedAt),
    jobId: backendApp.jobId,
    jobTitle,
    status: formatApplicationStatusToUI(backendApp.status),
    experience: '1–2 years relevant experience',
  };
}

export const applicationService = {
  // Apply for a Job (Student)
  async applyForJob(jobId: string, payload: ApplyJobPayload = {}): Promise<BackendApplication> {
    const response = await api.post<{ success: boolean; message: string; data: { application: BackendApplication } }>(
      `/jobs/${jobId}/applications`,
      payload
    );
    return response.data.data.application;
  },

  // Get My Applications (Student)
  async getMyApplications(query: MyApplicationsQuery = {}): Promise<{
    items: Application[];
    rawItems: BackendApplication[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await api.get<{ success: boolean; data: PaginatedApplicationsResponse }>('/applications', {
      params: query,
    });
    const data = response.data.data;
    return {
      items: data.items.map(mapBackendApplicationToUI),
      rawItems: data.items,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  },

  // Get Application Details (Student / Recruiter / Admin)
  async getApplicationById(applicationId: string): Promise<BackendApplication> {
    const response = await api.get<{ success: boolean; data: { application: BackendApplication } }>(
      `/applications/${applicationId}`
    );
    return response.data.data.application;
  },

  // Get Applicants for a specific Job (Recruiter)
  async getJobApplicants(
    jobId: string,
    query: JobApplicantsQuery = {}
  ): Promise<{
    items: Applicant[];
    rawItems: BackendApplication[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await api.get<{ success: boolean; data: PaginatedApplicationsResponse }>(
      `/jobs/${jobId}/applications`,
      { params: query }
    );
    const data = response.data.data;
    return {
      items: data.items.map(app => mapBackendApplicantToUI(app)),
      rawItems: data.items,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
      totalPages: data.totalPages,
    };
  },

  // Update Application Status (Recruiter)
  async updateApplicationStatus(
    applicationId: string,
    status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED' | string
  ): Promise<BackendApplication> {
    const backendStatus = formatUIToBackendApplicationStatus(status);
    const response = await api.patch<{ success: boolean; message: string; data: { application: BackendApplication } }>(
      `/applications/${applicationId}/status`,
      { status: backendStatus }
    );
    return response.data.data.application;
  },
};
