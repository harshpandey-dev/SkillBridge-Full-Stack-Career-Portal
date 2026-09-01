export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
export type ExperienceLevel = 'ENTRY_LEVEL' | 'MID_LEVEL' | 'SENIOR_LEVEL' | 'DIRECTOR' | 'EXECUTIVE';
export type JobStatus = 'OPEN' | 'CLOSED' | 'DRAFT';
export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'SELECTED' | 'REJECTED';

export interface Skill {
  id: string;
  name: string;
  createdAt: string | Date;
}

export interface StudentSkill {
  id: string;
  studentId: string;
  skillId: string;
  createdAt: string | Date;
  skill?: Skill;
}

export interface JobSkill {
  id: string;
  jobId: string;
  skillId: string;
  createdAt: string | Date;
  skill?: Skill;
}

export interface Job {
  id: string;
  recruiterId: string;
  companyId: string;
  title: string;
  department?: string | null;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  location: string;
  isRemote: boolean;
  salaryMin?: number | null;
  salaryMax?: number | null;
  applicationDeadline?: string | Date | null;
  status: JobStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
  skills?: JobSkill[];
}

export interface Application {
  id: string;
  studentId: string;
  jobId: string;
  coverLetter?: string | null;
  resumeUrl?: string | null;
  resumePublicId?: string | null;
  status: ApplicationStatus;
  appliedAt: string | Date;
  updatedAt: string | Date;
}

export interface SavedJob {
  id: string;
  studentId: string;
  jobId: string;
  createdAt: string | Date;
}
