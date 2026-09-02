export type UserRole = 'student' | 'recruiter' | 'admin'
export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract'
export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected' | 'Selected'
export type JobStatus = 'Open' | 'Closed' | 'Draft'
export type UserStatus = 'Active' | 'Suspended' | 'Pending'
export type ResourceType = 'Course' | 'Tutorial' | 'Workshop' | 'Certification'
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export interface NavUser {
  id?: string
  name: string
  email: string
  role: UserRole
  status?: UserStatus | 'ACTIVE' | 'SUSPENDED' | 'PENDING'
  rawRole?: 'STUDENT' | 'RECRUITER' | 'ADMIN'
  profileImage?: string | null
  phone?: string | null
  location?: string | null
  studentProfile?: {
    id: string
    university: string
    major: string
    graduationYear: number
    gpa?: number | null
    bio?: string | null
    resumeUrl?: string | null
  } | null
  recruiterProfile?: {
    id: string
    companyId?: string | null
    position?: string | null
    company?: {
      id: string
      name: string
      website?: string | null
      logo?: string | null
    } | null
  } | null
}

export interface Job {
  id: string
  title: string
  company: string
  companyColor: string
  location: string
  type: JobType
  salary: string
  skills: string[]
  description: string
  responsibilities: string[]
  requirements: string[]
  benefits: string[]
  postedDate: string
  deadline: string
  applicants: number
  status: JobStatus
  department: string
  experience: string
  remote: boolean
  recruiterId: string
}

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  companyColor: string
  location: string
  type: JobType
  salary: string
  appliedDate: string
  status: ApplicationStatus
  lastUpdated: string
}

export interface Student {
  id: string
  name: string
  email: string
  role: 'student'
  status: UserStatus
  joined: string
  university: string
  major: string
  graduationYear: string
  gpa: string
  skills: string[]
  bio: string
  location: string
  phone: string
  linkedin: string
  github: string
  portfolio: string
}

export interface Recruiter {
  id: string
  name: string
  email: string
  role: 'recruiter'
  status: UserStatus
  joined: string
  company: string
  companyColor: string
  position: string
  department: string
  phone: string
  companySize: string
  industry: string
  website: string
}

export interface AdminUser {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  joined: string
  university?: string
  company?: string
}

export interface LearningResource {
  id: string
  title: string
  provider: string
  category: string
  type: ResourceType
  difficulty: Difficulty
  duration: string
  rating: number
  enrolled: number
  tags: string[]
  featured: boolean
  addedDate: string
  image: string
}

export interface Applicant {
  id: string
  name: string
  email: string
  university: string
  major: string
  gpa: string
  skills: string[]
  appliedDate: string
  jobId: string
  jobTitle: string
  status: ApplicationStatus
  experience: string
}
