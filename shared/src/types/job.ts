export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'remote';
export type JobStatus = 'open' | 'closed' | 'draft';

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  status: JobStatus;
  description: string;
  requirements: string[];
  salaryMin?: number;
  salaryMax?: number;
  postedById: string;
  createdAt: string;
  updatedAt: string;
}
