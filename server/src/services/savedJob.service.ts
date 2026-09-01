import { JobStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../lib/errors';
import { AuthenticatedUser } from '../types/express';
import { SavedJobsQueryInput } from '../validators/savedJob.validator';

const savedJobInclude = {
  job: {
    select: {
      id: true,
      title: true,
      department: true,
      description: true,
      responsibilities: true,
      requirements: true,
      benefits: true,
      jobType: true,
      experienceLevel: true,
      location: true,
      isRemote: true,
      salaryMin: true,
      salaryMax: true,
      applicationDeadline: true,
      status: true,
      createdAt: true,
      company: {
        select: {
          id: true,
          name: true,
          logo: true,
          website: true,
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
    },
  },
};

export class SavedJobService {
  // 1. Save a Job (Student only)
  static async saveJob(jobId: string, user: AuthenticatedUser) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required to save jobs.');
    }

    // Verify job exists and is not a draft
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        status: true,
      },
    });

    if (!job || job.status === JobStatus.DRAFT) {
      throw new NotFoundError('Job not found');
    }

    // Check if already saved
    const existing = await prisma.savedJob.findUnique({
      where: {
        studentId_jobId: {
          studentId: studentProfile.id,
          jobId,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Job is already in your saved list.');
    }

    try {
      const savedJob = await prisma.savedJob.create({
        data: {
          studentId: studentProfile.id,
          jobId,
        },
        include: savedJobInclude,
      });

      return {
        id: savedJob.id,
        savedAt: savedJob.createdAt,
        job: savedJob.job,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError('Job is already in your saved list.');
      }
      throw error;
    }
  }

  // 2. Remove a Saved Job (Student only)
  static async removeSavedJob(jobId: string, user: AuthenticatedUser) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile not found.');
    }

    const existing = await prisma.savedJob.findUnique({
      where: {
        studentId_jobId: {
          studentId: studentProfile.id,
          jobId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundError('Job is not in your saved list.');
    }

    await prisma.savedJob.delete({
      where: {
        studentId_jobId: {
          studentId: studentProfile.id,
          jobId,
        },
      },
    });

    return { message: 'Job removed from saved list successfully' };
  }

  // 3. Get Student's Saved Jobs (Student only)
  static async getMySavedJobs(user: AuthenticatedUser, query: SavedJobsQueryInput) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile not found.');
    }

    const {
      search,
      jobType,
      experienceLevel,
      location,
      isRemote,
      status,
      page = 1,
      limit = 10,
      sort = 'recently_saved',
    } = query;

    const jobFilter: Prisma.JobWhereInput = {
      // Never display draft jobs in saved list
      status: status ? status : { not: JobStatus.DRAFT },
    };

    if (search) {
      jobFilter.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (jobType) jobFilter.jobType = jobType;
    if (experienceLevel) jobFilter.experienceLevel = experienceLevel;
    if (location) jobFilter.location = { contains: location, mode: 'insensitive' };
    if (isRemote !== undefined) jobFilter.isRemote = isRemote;

    const where: Prisma.SavedJobWhereInput = {
      studentId: studentProfile.id,
      job: jobFilter,
    };

    let orderBy: Prisma.SavedJobOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest_saved') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'newest_job') {
      orderBy = { job: { createdAt: 'desc' } };
    } else if (sort === 'deadline') {
      orderBy = { job: { applicationDeadline: 'asc' } };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.savedJob.findMany({
        where,
        include: savedJobInclude,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.savedJob.count({ where }),
    ]);

    const formattedItems = items.map(item => ({
      savedJobId: item.id,
      savedAt: item.createdAt,
      ...item.job,
    }));

    return {
      items: formattedItems,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 4. Check whether a job is saved by the current student
  static async checkSaveStatus(jobId: string, user: AuthenticatedUser) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      return { isSaved: false };
    }

    const saved = await prisma.savedJob.findUnique({
      where: {
        studentId_jobId: {
          studentId: studentProfile.id,
          jobId,
        },
      },
      select: { id: true },
    });

    return { isSaved: !!saved };
  }
}
