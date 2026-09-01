import { ApplicationStatus, JobStatus, Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, ForbiddenError, BadRequestError, ConflictError } from '../lib/errors';
import { AuthenticatedUser } from '../types/express';
import {
  ApplyJobInput,
  UpdateApplicationStatusInput,
  MyApplicationsQueryInput,
  JobApplicantsQueryInput,
} from '../validators/application.validator';

// State machine defining allowed application status transitions
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  [ApplicationStatus.APPLIED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
  [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.SELECTED, ApplicationStatus.REJECTED],
  [ApplicationStatus.SELECTED]: [],
  [ApplicationStatus.REJECTED]: [],
};

export function isValidStatusTransition(
  currentStatus: ApplicationStatus,
  newStatus: ApplicationStatus
): boolean {
  const allowed = VALID_TRANSITIONS[currentStatus];
  return allowed ? allowed.includes(newStatus) : false;
}

export class ApplicationService {
  // 1. Apply for a Job (Student only)
  static async applyForJob(jobId: string, user: AuthenticatedUser, input: ApplyJobInput) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required to apply for jobs.');
    }

    // Verify job exists
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    // Verify job is OPEN
    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestError(
        job.status === JobStatus.CLOSED
          ? 'This job listing is closed and is no longer accepting applications.'
          : 'Cannot apply to an unlisted or draft job.'
      );
    }

    // Check application deadline
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw new BadRequestError('The application deadline for this job has passed.');
    }

    // Check if student has already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: studentProfile.id,
          jobId,
        },
      },
    });

    if (existingApplication) {
      throw new ConflictError('You have already submitted an application for this job.');
    }

    // Determine resume URL (use provided URL or fallback to student profile's resume)
    const resumeUrl = input.resumeUrl || studentProfile.resumeUrl || null;
    const resumePublicId = studentProfile.resumePublicId || null;

    // Create the application starting in APPLIED status
    const application = await prisma.application.create({
      data: {
        jobId,
        studentId: studentProfile.id,
        coverLetter: input.coverLetter || null,
        resumeUrl,
        resumePublicId,
        status: ApplicationStatus.APPLIED,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            jobType: true,
            experienceLevel: true,
            location: true,
            isRemote: true,
            status: true,
            company: {
              select: {
                id: true,
                name: true,
                logo: true,
                website: true,
              },
            },
          },
        },
      },
    });

    return application;
  }

  // 2. Get Student's Applications (Student only)
  static async getMyApplications(user: AuthenticatedUser, query: MyApplicationsQueryInput) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile not found.');
    }

    const { search, status, page = 1, limit = 10, sort = 'newest' } = query;

    const where: Prisma.ApplicationWhereInput = {
      studentId: studentProfile.id,
    };

    if (status && status !== 'ALL') {
      where.status = status as ApplicationStatus;
    }

    if (search) {
      where.job = {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { company: { name: { contains: search, mode: 'insensitive' } } },
        ],
      };
    }

    let orderBy: Prisma.ApplicationOrderByWithRelationInput = { appliedAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { appliedAt: 'asc' };
    } else if (sort === 'recently_updated') {
      orderBy = { updatedAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          job: {
            select: {
              id: true,
              title: true,
              jobType: true,
              experienceLevel: true,
              location: true,
              isRemote: true,
              status: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                  website: true,
                  location: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 3. Get Application Details by ID (Student owner, Recruiter job owner, or Admin)
  static async getApplicationById(applicationId: string, user: AuthenticatedUser) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                phone: true,
                location: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const isStudentOwner = user.role === Role.STUDENT && user.studentProfile?.id === application.studentId;
    const isRecruiterOwner =
      user.role === Role.RECRUITER && user.recruiterProfile?.id === application.job.recruiterId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isStudentOwner && !isRecruiterOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to view this application');
    }

    return application;
  }

  // 4. Get Applicants for a specific Job (Recruiter owner or Admin)
  static async getJobApplicants(
    jobId: string,
    user: AuthenticatedUser,
    query: JobApplicantsQueryInput
  ) {
    // Verify job existence & ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        title: true,
        recruiterId: true,
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const isOwner = user.recruiterProfile?.id === job.recruiterId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to view applicants for this job');
    }

    const { search, status, page = 1, limit = 10, sort = 'newest' } = query;

    const where: Prisma.ApplicationWhereInput = {
      jobId,
    };

    if (status && status !== 'ALL') {
      where.status = status as ApplicationStatus;
    }

    if (search) {
      where.student = {
        OR: [
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { university: { contains: search, mode: 'insensitive' } },
          { major: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    let orderBy: Prisma.ApplicationOrderByWithRelationInput = { appliedAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { appliedAt: 'asc' };
    } else if (sort === 'gpa_desc') {
      orderBy = { student: { gpa: 'desc' } };
    } else if (sort === 'recently_updated') {
      orderBy = { updatedAt: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          student: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profileImage: true,
                  phone: true,
                  location: true,
                },
              },
              skills: {
                include: {
                  skill: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 5. Update Application Status (Recruiter owner or Admin)
  static async updateApplicationStatus(
    applicationId: string,
    user: AuthenticatedUser,
    input: UpdateApplicationStatusInput
  ) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            recruiterId: true,
          },
        },
        student: {
          select: {
            id: true,
            userId: true,
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundError('Application not found');
    }

    const isOwner = user.recruiterProfile?.id === application.job.recruiterId;
    const isAdmin = user.role === Role.ADMIN;

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('You do not have permission to update this application status');
    }

    const currentStatus = application.status;
    const nextStatus = input.status;

    if (currentStatus === nextStatus) {
      return application;
    }

    // Validate state machine transition
    if (!isValidStatusTransition(currentStatus, nextStatus)) {
      throw new BadRequestError(
        `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed next statuses: ${VALID_TRANSITIONS[currentStatus]?.join(', ') || 'None'}`
      );
    }

    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: nextStatus,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        student: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }
}
