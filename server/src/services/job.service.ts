import { JobStatus, Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../lib/errors';
import { AuthenticatedUser } from '../types/express';
import {
  CreateJobInput,
  UpdateJobInput,
  JobQueryInput,
  MyJobsQueryInput,
} from '../validators/job.validator';

// Reusable selector for safe public job returns
const jobInclude = {
  company: {
    select: {
      id: true,
      name: true,
      website: true,
      description: true,
      size: true,
      logo: true,
      location: true,
    },
  },
  skills: {
    select: {
      id: true,
      skill: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
  recruiter: {
    select: {
      id: true,
      position: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
    },
  },
};

export class JobService {
  // Helper to resolve or create skills safely without duplicates
  private static async resolveSkills(tx: Prisma.TransactionClient, skillNames: string[]): Promise<string[]> {
    if (!skillNames || skillNames.length === 0) return [];

    const normalized = Array.from(new Set(skillNames.map(s => s.trim()).filter(Boolean)));
    const skillIds: string[] = [];

    for (const name of normalized) {
      // Find case-insensitively or create
      const existing = await tx.skill.findFirst({
        where: { name: { equals: name, mode: 'insensitive' } },
      });

      if (existing) {
        skillIds.push(existing.id);
      } else {
        const created = await tx.skill.create({
          data: { name },
        });
        skillIds.push(created.id);
      }
    }

    return skillIds;
  }

  // Check if the user is authorized to manage the specified job
  private static async getJobAndVerifyOwnership(jobId: string, user: AuthenticatedUser) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        skills: { include: { skill: true } },
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const isOwner = user.recruiterProfile?.id === job.recruiterId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to manage this job');
    }

    return job;
  }

  // 1. Create a new Job (Recruiter only)
  static async createJob(user: AuthenticatedUser, input: CreateJobInput) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile not found. Please complete your recruiter profile.');
    }

    if (!recruiterProfile.companyId) {
      throw new BadRequestError('Recruiter must be associated with a company to post jobs.');
    }

    return prisma.$transaction(
      async tx => {
        const skillIds = await this.resolveSkills(tx, input.skills || []);

        const job = await tx.job.create({
        data: {
          recruiterId: recruiterProfile.id,
          companyId: recruiterProfile.companyId!,
          title: input.title,
          department: input.department || null,
          description: input.description,
          responsibilities: input.responsibilities,
          requirements: input.requirements,
          benefits: input.benefits || [],
          jobType: input.jobType,
          experienceLevel: input.experienceLevel,
          location: input.location,
          isRemote: input.isRemote ?? false,
          salaryMin: input.salaryMin || null,
          salaryMax: input.salaryMax || null,
          applicationDeadline: input.applicationDeadline || null,
          status: input.status ?? JobStatus.OPEN,
          skills: {
            create: skillIds.map(skillId => ({
              skillId,
            })),
          },
        },
        include: jobInclude,
      });

      return job;
    }, { maxWait: 15000, timeout: 30000 });
  }

  // 2. Update an existing Job (Owner or Admin)
  static async updateJob(jobId: string, user: AuthenticatedUser, input: UpdateJobInput) {
    await this.getJobAndVerifyOwnership(jobId, user);

    return prisma.$transaction(async tx => {
      // If skills are provided in the update, replace the existing job skills
      if (input.skills !== undefined) {
        const skillIds = await this.resolveSkills(tx, input.skills);

        // Remove old relations
        await tx.jobSkill.deleteMany({
          where: { jobId },
        });

        // Add new relations
        if (skillIds.length > 0) {
          await tx.jobSkill.createMany({
            data: skillIds.map(skillId => ({
              jobId,
              skillId,
            })),
          });
        }
      }

      const updatedJob = await tx.job.update({
        where: { id: jobId },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.department !== undefined && { department: input.department }),
          ...(input.description !== undefined && { description: input.description }),
          ...(input.responsibilities !== undefined && { responsibilities: input.responsibilities }),
          ...(input.requirements !== undefined && { requirements: input.requirements }),
          ...(input.benefits !== undefined && { benefits: input.benefits }),
          ...(input.jobType !== undefined && { jobType: input.jobType }),
          ...(input.experienceLevel !== undefined && { experienceLevel: input.experienceLevel }),
          ...(input.location !== undefined && { location: input.location }),
          ...(input.isRemote !== undefined && { isRemote: input.isRemote }),
          ...(input.salaryMin !== undefined && { salaryMin: input.salaryMin }),
          ...(input.salaryMax !== undefined && { salaryMax: input.salaryMax }),
          ...(input.applicationDeadline !== undefined && { applicationDeadline: input.applicationDeadline }),
          ...(input.status !== undefined && { status: input.status }),
        },
        include: jobInclude,
      });

      return updatedJob;
    }, { maxWait: 15000, timeout: 30000 });
  }

  // 3. Delete a Job (Owner or Admin)
  static async deleteJob(jobId: string, user: AuthenticatedUser) {
    await this.getJobAndVerifyOwnership(jobId, user);

    await prisma.job.delete({
      where: { id: jobId },
    });

    return { message: 'Job deleted successfully' };
  }

  // 4. Close a Job (Owner or Admin)
  static async closeJob(jobId: string, user: AuthenticatedUser) {
    const job = await this.getJobAndVerifyOwnership(jobId, user);

    if (job.status === JobStatus.CLOSED) {
      throw new BadRequestError('Job is already closed');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.CLOSED },
      include: jobInclude,
    });

    return updated;
  }

  // 5. Reopen a Job (Owner or Admin)
  static async reopenJob(jobId: string, user: AuthenticatedUser) {
    const job = await this.getJobAndVerifyOwnership(jobId, user);

    if (job.status === JobStatus.OPEN) {
      throw new BadRequestError('Job is already open');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.OPEN },
      include: jobInclude,
    });

    return updated;
  }

  // 6. Public Job Browsing with Search, Filters, Sorting, and Pagination
  static async getAllJobs(query: JobQueryInput, currentUser?: AuthenticatedUser) {
    const {
      search,
      jobType,
      experienceLevel,
      location,
      isRemote,
      skills,
      status,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = query;

    const where: Prisma.JobWhereInput = {};

    // By default, public / student users only see OPEN jobs
    const isRecruiterOrAdmin =
      currentUser && (currentUser.role === Role.RECRUITER || currentUser.role === Role.ADMIN);

    if (status) {
      if (status === JobStatus.DRAFT && !isRecruiterOrAdmin) {
        where.status = JobStatus.OPEN;
      } else {
        where.status = status;
      }
    } else {
      // Default to OPEN for general browsing
      where.status = JobStatus.OPEN;
    }

    // Search query across title and company name
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (jobType) where.jobType = jobType;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (location) where.location = { contains: location, mode: 'insensitive' };
    if (isRemote !== undefined) where.isRemote = isRemote;

    // Filter by required skills
    if (skills && skills.length > 0) {
      where.skills = {
        some: {
          skill: {
            name: {
              in: skills,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    // Determine sorting
    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'deadline') {
      orderBy = { applicationDeadline: 'asc' };
    } else if (sort === 'salary_desc' || sort === 'salary') {
      orderBy = { salaryMax: 'desc' };
    } else if (sort === 'salary_asc') {
      orderBy = { salaryMin: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: jobInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 7. Get Job Details by ID
  static async getJobById(jobId: string, currentUser?: AuthenticatedUser) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: jobInclude,
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // If job is in DRAFT status, only owner recruiter or ADMIN can view it
    if (job.status === JobStatus.DRAFT) {
      const isOwner = currentUser?.recruiterProfile?.id === job.recruiterId;
      const isAdmin = currentUser?.role === Role.ADMIN;

      if (!isOwner && !isAdmin) {
        throw new NotFoundError('Job not found');
      }
    }

    return job;
  }

  // 8. Get My Jobs (Authenticated Recruiter only)
  static async getMyJobs(user: AuthenticatedUser, query: MyJobsQueryInput) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile not found');
    }

    const { search, status, page = 1, limit = 10, sort = 'newest' } = query;

    const where: Prisma.JobWhereInput = {
      recruiterId: recruiterProfile.id,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'deadline') {
      orderBy = { applicationDeadline: 'asc' };
    } else if (sort === 'salary_desc' || sort === 'salary') {
      orderBy = { salaryMax: 'desc' };
    } else if (sort === 'salary_asc') {
      orderBy = { salaryMin: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          ...jobInclude,
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
