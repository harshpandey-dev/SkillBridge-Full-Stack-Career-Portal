import { Prisma, Role, UserStatus, JobStatus, ApplicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, BadRequestError } from '../lib/errors';
import {
  AdminUserQueryInput,
  UpdateUserStatusInput,
  AdminJobQueryInput,
  UpdateJobStatusInput,
  AdminApplicationQueryInput,
} from '../validators/admin.validator';

export class AdminService {
  // 1. Dashboard Overview Stats
  static async getDashboardStats() {
    const [
      userRoleCounts,
      userStatusCounts,
      totalUsers,
      jobStatusCounts,
      totalJobs,
      appStatusCounts,
      totalApplications,
      totalCompanies,
      totalResources,
      featuredResources,
    ] = await Promise.all([
      prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.user.count(),
      prisma.job.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.job.count(),
      prisma.application.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.application.count(),
      prisma.company.count(),
      prisma.learningResource.count(),
      prisma.learningResource.count({ where: { featured: true } }),
    ]);

    const userRoles: Record<string, number> = {};
    userRoleCounts.forEach(r => {
      userRoles[r.role] = r._count.id;
    });

    const userStatuses: Record<string, number> = {};
    userStatusCounts.forEach(s => {
      userStatuses[s.status] = s._count.id;
    });

    const jobStatuses: Record<string, number> = {};
    jobStatusCounts.forEach(j => {
      jobStatuses[j.status] = j._count.id;
    });

    const appStatuses: Record<string, number> = {};
    appStatusCounts.forEach(a => {
      appStatuses[a.status] = a._count.id;
    });

    return {
      users: {
        total: totalUsers,
        students: userRoles[Role.STUDENT] || 0,
        recruiters: userRoles[Role.RECRUITER] || 0,
        admins: userRoles[Role.ADMIN] || 0,
        active: userStatuses[UserStatus.ACTIVE] || 0,
        suspended: userStatuses[UserStatus.SUSPENDED] || 0,
        pending: userStatuses[UserStatus.PENDING] || 0,
      },
      jobs: {
        total: totalJobs,
        open: jobStatuses[JobStatus.OPEN] || 0,
        closed: jobStatuses[JobStatus.CLOSED] || 0,
        draft: jobStatuses[JobStatus.DRAFT] || 0,
      },
      applications: {
        total: totalApplications,
        applied: appStatuses[ApplicationStatus.APPLIED] || 0,
        underReview: appStatuses[ApplicationStatus.UNDER_REVIEW] || 0,
        shortlisted: appStatuses[ApplicationStatus.SHORTLISTED] || 0,
        selected: appStatuses[ApplicationStatus.SELECTED] || 0,
        rejected: appStatuses[ApplicationStatus.REJECTED] || 0,
      },
      companies: {
        total: totalCompanies,
      },
      resources: {
        total: totalResources,
        featured: featuredResources,
      },
    };
  }

  // 2. User Listing with Filters, Search, and Pagination
  static async getUsers(query: AdminUserQueryInput) {
    const { search, role, status, page = 1, limit = 10, sort = 'newest' } = query;

    const where: Prisma.UserWhereInput = {};

    if (role) {
      where.role = role;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.UserOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'name_asc') {
      orderBy = { name: 'asc' };
    } else if (sort === 'name_desc') {
      orderBy = { name: 'desc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          phone: true,
          location: true,
          createdAt: true,
          updatedAt: true,
          studentProfile: {
            select: {
              id: true,
              university: true,
              major: true,
              graduationYear: true,
            },
          },
          recruiterProfile: {
            select: {
              id: true,
              position: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize: limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // 3. Get User Details
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        phone: true,
        location: true,
        createdAt: true,
        updatedAt: true,
        studentProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
            _count: {
              select: {
                applications: true,
                savedJobs: true,
              },
            },
          },
        },
        recruiterProfile: {
          include: {
            company: true,
            _count: {
              select: {
                jobs: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    let applicationsReceivedCount = 0;
    if (user.role === Role.RECRUITER && user.recruiterProfile) {
      applicationsReceivedCount = await prisma.application.count({
        where: {
          job: {
            recruiterId: user.recruiterProfile.id,
          },
        },
      });
    }

    return {
      ...user,
      applicationsReceived: applicationsReceivedCount,
    };
  }

  // 4. Update User Status
  static async updateUserStatus(
    adminUserId: string,
    targetUserId: string,
    input: UpdateUserStatusInput
  ) {
    if (adminUserId === targetUserId) {
      throw new BadRequestError('Admins cannot change their own account status');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: input.status,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        profileImage: true,
        phone: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Send system notification to user
    try {
      let message = 'Your account status has been updated.';
      if (input.status === UserStatus.SUSPENDED) {
        message = 'Your SkillBridge account has been suspended.';
      } else if (input.status === UserStatus.ACTIVE) {
        message = 'Your SkillBridge account is now active.';
      } else if (input.status === UserStatus.PENDING) {
        message = 'Your account status has been updated to pending.';
      }

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          title: 'Account status updated',
          message,
          type: 'SYSTEM',
        },
      });
    } catch (e) {
      // Don't fail status update if notification fails
    }

    return updatedUser;
  }

  // 5. Delete User
  static async deleteUser(adminUserId: string, targetUserId: string) {
    if (adminUserId === targetUserId) {
      throw new BadRequestError('Admins cannot delete their own account');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return { message: 'User deleted successfully' };
  }

  // 6. Admin Job Listing
  static async getJobs(query: AdminJobQueryInput) {
    const {
      search,
      status,
      jobType,
      experienceLevel,
      isRemote,
      page = 1,
      limit = 10,
      sort = 'newest',
    } = query;

    const where: Prisma.JobWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (isRemote !== undefined) {
      where.isRemote = isRemote;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'deadline') {
      orderBy = { applicationDeadline: 'asc' };
    } else if (sort === 'salary_desc') {
      orderBy = { salaryMax: 'desc' };
    } else if (sort === 'salary_asc') {
      orderBy = { salaryMin: 'asc' };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: true,
          recruiter: {
            include: {
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
          skills: {
            include: {
              skill: true,
            },
          },
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

  // 7. Admin Job Details
  static async getJobById(jobId: string) {
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        recruiter: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                phone: true,
              },
            },
          },
        },
        skills: {
          include: {
            skill: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    const appStatusGroup = await prisma.application.groupBy({
      by: ['status'],
      where: { jobId },
      _count: { id: true },
    });

    const statusCounts: Record<string, number> = {};
    let totalApps = 0;
    appStatusGroup.forEach(g => {
      statusCounts[g.status] = g._count.id;
      totalApps += g._count.id;
    });

    const applicationStatusSummary = {
      total: totalApps,
      applied: statusCounts[ApplicationStatus.APPLIED] || 0,
      underReview: statusCounts[ApplicationStatus.UNDER_REVIEW] || 0,
      shortlisted: statusCounts[ApplicationStatus.SHORTLISTED] || 0,
      selected: statusCounts[ApplicationStatus.SELECTED] || 0,
      rejected: statusCounts[ApplicationStatus.REJECTED] || 0,
    };

    return {
      ...job,
      applicationStatusSummary,
    };
  }

  // 8. Admin Job Status Update
  static async updateJobStatus(jobId: string, input: UpdateJobStatusInput) {
    const existing = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existing) {
      throw new NotFoundError('Job not found');
    }

    const updated = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: input.status,
      },
      include: {
        company: true,
      },
    });

    return updated;
  }

  // 9. Admin Job Deletion
  static async deleteJob(jobId: string) {
    const existing = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!existing) {
      throw new NotFoundError('Job not found');
    }

    await prisma.job.delete({
      where: { id: jobId },
    });

    return { message: 'Job deleted successfully' };
  }

  // 10. Admin Application Listing
  static async getApplications(query: AdminApplicationQueryInput) {
    const { search, status, jobId, page = 1, limit = 10, sort = 'newest' } = query;

    const where: Prisma.ApplicationWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (jobId) {
      where.jobId = jobId;
    }

    if (search) {
      where.OR = [
        { student: { user: { name: { contains: search, mode: 'insensitive' } } } },
        { student: { user: { email: { contains: search, mode: 'insensitive' } } } },
        { job: { title: { contains: search, mode: 'insensitive' } } },
        { job: { company: { name: { contains: search, mode: 'insensitive' } } } },
      ];
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
          student: {
            include: {
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
          job: {
            select: {
              id: true,
              title: true,
              jobType: true,
              location: true,
              status: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
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

  // 11. Admin Application Details
  static async getApplicationById(applicationId: string) {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
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
        job: {
          include: {
            company: true,
            recruiter: {
              include: {
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

    return application;
  }

  // 12. Platform Analytics & Recent Activity
  static async getPlatformAnalytics() {
    const [
      stats,
      remoteJobsCount,
      recentUsers,
      recentJobs,
      recentApplications,
    ] = await Promise.all([
      this.getDashboardStats(),
      prisma.job.count({ where: { isRemote: true } }),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          profileImage: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.job.findMany({
        select: {
          id: true,
          title: true,
          jobType: true,
          location: true,
          status: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
              logo: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.application.findMany({
        select: {
          id: true,
          status: true,
          appliedAt: true,
          student: {
            select: {
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
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      users: stats.users,
      jobs: {
        ...stats.jobs,
        remote: remoteJobsCount,
      },
      applications: stats.applications,
      companies: stats.companies,
      resources: stats.resources,
      recentActivity: {
        recentUsers,
        recentJobs,
        recentApplications,
      },
    };
  }

  // 13. Platform Growth Analytics
  static async getGrowthAnalytics(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const [users, jobs, applications] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.job.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
      prisma.application.findMany({
        where: { appliedAt: { gte: startDate } },
        select: { appliedAt: true },
      }),
    ]);

    // Build day-by-day mapping
    const dataMap: Record<string, { newUsers: number; newJobs: number; newApplications: number }> =
      {};

    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      dataMap[key] = { newUsers: 0, newJobs: 0, newApplications: 0 };
    }

    users.forEach(u => {
      const key = u.createdAt.toISOString().split('T')[0];
      if (dataMap[key]) dataMap[key].newUsers++;
    });

    jobs.forEach(j => {
      const key = j.createdAt.toISOString().split('T')[0];
      if (dataMap[key]) dataMap[key].newJobs++;
    });

    applications.forEach(a => {
      const key = a.appliedAt.toISOString().split('T')[0];
      if (dataMap[key]) dataMap[key].newApplications++;
    });

    const data = Object.keys(dataMap)
      .sort()
      .map(date => ({
        date,
        ...dataMap[date],
      }));

    return {
      period: days,
      data,
    };
  }
}
