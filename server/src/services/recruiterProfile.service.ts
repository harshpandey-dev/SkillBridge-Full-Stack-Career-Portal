import { JobStatus, ApplicationStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { NotFoundError, BadRequestError } from '../lib/errors';
import { AuthenticatedUser } from '../types/express';
import {
  UpdateRecruiterProfileInput,
  UpdateNotificationPreferencesInput,
} from '../validators/recruiterProfile.validator';

export class RecruiterProfileService {
  // 1. Get Recruiter Profile
  static async getRecruiterProfile(user: AuthenticatedUser) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile is required.');
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
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
        recruiterProfile: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!fullUser || !fullUser.recruiterProfile) {
      throw new NotFoundError('Recruiter profile not found.');
    }

    return {
      user: {
        id: fullUser.id,
        name: fullUser.name,
        email: fullUser.email,
        role: fullUser.role,
        status: fullUser.status,
        profileImage: fullUser.profileImage,
        phone: fullUser.phone,
        location: fullUser.location,
        createdAt: fullUser.createdAt,
      },
      recruiterProfile: {
        id: fullUser.recruiterProfile.id,
        position: fullUser.recruiterProfile.position,
        createdAt: fullUser.recruiterProfile.createdAt,
        updatedAt: fullUser.recruiterProfile.updatedAt,
      },
      company: fullUser.recruiterProfile.company
        ? {
            id: fullUser.recruiterProfile.company.id,
            name: fullUser.recruiterProfile.company.name,
            website: fullUser.recruiterProfile.company.website,
            description: fullUser.recruiterProfile.company.description,
            size: fullUser.recruiterProfile.company.size,
            logo: fullUser.recruiterProfile.company.logo,
            location: fullUser.recruiterProfile.company.location,
            createdAt: fullUser.recruiterProfile.company.createdAt,
            updatedAt: fullUser.recruiterProfile.company.updatedAt,
          }
        : null,
    };
  }

  // 2. Update Recruiter Profile & Company
  static async updateRecruiterProfile(
    user: AuthenticatedUser,
    input: UpdateRecruiterProfileInput
  ) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile is required.');
    }

    const {
      name,
      phone,
      location,
      profileImage,
      position,
      companyName,
      companyWebsite,
      companyDescription,
      companySize,
      companyLogo,
      companyLocation,
      company: nestedCompany,
    } = input;

    const compName = nestedCompany?.name ?? companyName;
    const compWebsite = nestedCompany?.website ?? companyWebsite;
    const compDesc = nestedCompany?.description ?? companyDescription;
    const compSize = nestedCompany?.size ?? companySize;
    const compLogo = nestedCompany?.logo ?? companyLogo;
    const compLoc = nestedCompany?.location ?? companyLocation;

    await prisma.$transaction(async tx => {
      // 1. Update User personal fields
      const userUpdateData: Record<string, any> = {};
      if (name !== undefined) userUpdateData.name = name;
      if (phone !== undefined) userUpdateData.phone = phone;
      if (location !== undefined) userUpdateData.location = location;
      if (profileImage !== undefined) userUpdateData.profileImage = profileImage;

      if (Object.keys(userUpdateData).length > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: userUpdateData,
        });
      }

      // 2. Update RecruiterProfile position
      if (position !== undefined) {
        await tx.recruiterProfile.update({
          where: { id: recruiterProfile.id },
          data: { position },
        });
      }

      // 3. Update or create Company
      const hasCompanyFields =
        compName !== undefined ||
        compWebsite !== undefined ||
        compDesc !== undefined ||
        compSize !== undefined ||
        compLogo !== undefined ||
        compLoc !== undefined;

      if (hasCompanyFields) {
        const currentProfile = await tx.recruiterProfile.findUnique({
          where: { id: recruiterProfile.id },
          select: { companyId: true },
        });

        if (currentProfile?.companyId) {
          const companyUpdateData: Record<string, any> = {};
          if (compName !== undefined) companyUpdateData.name = compName;
          if (compWebsite !== undefined) companyUpdateData.website = compWebsite;
          if (compDesc !== undefined) companyUpdateData.description = compDesc;
          if (compSize !== undefined) companyUpdateData.size = compSize;
          if (compLogo !== undefined) companyUpdateData.logo = compLogo;
          if (compLoc !== undefined) companyUpdateData.location = compLoc;

          await tx.company.update({
            where: { id: currentProfile.companyId },
            data: companyUpdateData,
          });
        } else if (compName) {
          const newCompany = await tx.company.create({
            data: {
              name: compName,
              website: compWebsite || null,
              description: compDesc || null,
              size: compSize || null,
              logo: compLogo || null,
              location: compLoc || null,
            },
          });

          await tx.recruiterProfile.update({
            where: { id: recruiterProfile.id },
            data: { companyId: newCompany.id },
          });
        }
      }
    }, { maxWait: 15000, timeout: 30000 });

    return this.getRecruiterProfile(user);
  }

  // 3. Get Recruiter Real Statistics
  static async getRecruiterStats(user: AuthenticatedUser) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile is required.');
    }

    const recruiterId = recruiterProfile.id;

    const [activeJobs, totalApplicants, shortlistedCandidates, selectedCandidates] =
      await Promise.all([
        prisma.job.count({
          where: {
            recruiterId,
            status: JobStatus.OPEN,
          },
        }),
        prisma.application.count({
          where: {
            job: {
              recruiterId,
            },
          },
        }),
        prisma.application.count({
          where: {
            job: {
              recruiterId,
            },
            status: ApplicationStatus.SHORTLISTED,
          },
        }),
        prisma.application.count({
          where: {
            job: {
              recruiterId,
            },
            status: ApplicationStatus.SELECTED,
          },
        }),
      ]);

    return {
      activeJobs,
      totalApplicants,
      shortlistedCandidates,
      selectedCandidates,
    };
  }

  // 4. Get Recruiter Job Summary
  static async getRecruiterJobSummary(user: AuthenticatedUser) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile is required.');
    }

    const recruiterId = recruiterProfile.id;

    const [openJobs, closedJobs, draftJobs, totalApplications] = await Promise.all([
      prisma.job.count({
        where: {
          recruiterId,
          status: JobStatus.OPEN,
        },
      }),
      prisma.job.count({
        where: {
          recruiterId,
          status: JobStatus.CLOSED,
        },
      }),
      prisma.job.count({
        where: {
          recruiterId,
          status: JobStatus.DRAFT,
        },
      }),
      prisma.application.count({
        where: {
          job: {
            recruiterId,
          },
        },
      }),
    ]);

    return {
      openJobs,
      closedJobs,
      draftJobs,
      totalJobs: openJobs + closedJobs + draftJobs,
      totalApplications,
    };
  }

  // 5. Get Notification Preferences
  static async getNotificationPreferences(user: AuthenticatedUser) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile is required.');
    }

    const preferences = await prisma.recruiterNotificationPreference.upsert({
      where: { recruiterId: recruiterProfile.id },
      update: {},
      create: {
        recruiterId: recruiterProfile.id,
      },
      select: {
        newApplications: true,
        applicationUpdates: true,
        jobPerformanceUpdates: true,
        platformAnnouncements: true,
        updatedAt: true,
      },
    });

    return preferences;
  }

  // 6. Update Notification Preferences
  static async updateNotificationPreferences(
    user: AuthenticatedUser,
    input: UpdateNotificationPreferencesInput
  ) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile) {
      throw new BadRequestError('Recruiter profile is required.');
    }

    const updated = await prisma.recruiterNotificationPreference.upsert({
      where: { recruiterId: recruiterProfile.id },
      update: input,
      create: {
        recruiterId: recruiterProfile.id,
        ...input,
      },
      select: {
        newApplications: true,
        applicationUpdates: true,
        jobPerformanceUpdates: true,
        platformAnnouncements: true,
        updatedAt: true,
      },
    });

    return updated;
  }
}
