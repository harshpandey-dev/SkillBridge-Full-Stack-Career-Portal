import 'multer';
import { prisma } from '../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '../lib/cloudinary';
import { NotFoundError, BadRequestError } from '../lib/errors';
import { AuthenticatedUser } from '../types/express';

export class UploadService {
  // 1. Student Resume Upload
  static async uploadResume(user: AuthenticatedUser, file: Express.Multer.File) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required to upload a resume.');
    }

    // Safely delete previous Cloudinary resume if one exists
    if (studentProfile.resumePublicId) {
      await deleteFromCloudinary(studentProfile.resumePublicId, 'raw');
      await deleteFromCloudinary(studentProfile.resumePublicId, 'image');
    }

    // Upload new resume to Cloudinary
    const result = await uploadToCloudinary(file.buffer, {
      folder: 'skillbridge/resumes',
      resource_type: 'auto',
      public_id: `resume_${studentProfile.id}_${Date.now()}`,
    });

    // Update database record
    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        resumeUrl: result.secure_url,
        resumePublicId: result.public_id,
      },
    });

    return {
      resumeUrl: result.secure_url,
      resumePublicId: result.public_id,
    };
  }

  // 2. Student Resume Deletion
  static async deleteResume(user: AuthenticatedUser) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required.');
    }

    // Refresh student profile from DB to ensure latest state
    const current = await prisma.studentProfile.findUnique({
      where: { id: studentProfile.id },
    });

    if (!current || (!current.resumeUrl && !current.resumePublicId)) {
      throw new NotFoundError('No resume found to delete.');
    }

    if (current.resumePublicId) {
      await deleteFromCloudinary(current.resumePublicId, 'raw');
      await deleteFromCloudinary(current.resumePublicId, 'image');
    }

    await prisma.studentProfile.update({
      where: { id: studentProfile.id },
      data: {
        resumeUrl: null,
        resumePublicId: null,
      },
    });

    return { message: 'Resume deleted successfully' };
  }

  // 3. User Profile Image Upload
  static async uploadProfileImage(user: AuthenticatedUser, file: Express.Multer.File) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImagePublicId: true },
    });

    if (dbUser?.profileImagePublicId) {
      await deleteFromCloudinary(dbUser.profileImagePublicId, 'image');
    }

    const result = await uploadToCloudinary(file.buffer, {
      folder: 'skillbridge/profiles',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit', quality: 'auto' },
      ],
      public_id: `profile_${user.id}_${Date.now()}`,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: result.secure_url,
        profileImagePublicId: result.public_id,
      },
    });

    return {
      profileImage: result.secure_url,
      profileImagePublicId: result.public_id,
    };
  }

  // 4. User Profile Image Deletion
  static async deleteProfileImage(user: AuthenticatedUser) {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { profileImage: true, profileImagePublicId: true },
    });

    if (!dbUser || (!dbUser.profileImage && !dbUser.profileImagePublicId)) {
      throw new NotFoundError('No profile image found to delete.');
    }

    if (dbUser.profileImagePublicId) {
      await deleteFromCloudinary(dbUser.profileImagePublicId, 'image');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        profileImage: null,
        profileImagePublicId: null,
      },
    });

    return { message: 'Profile image deleted successfully' };
  }

  // 5. Company Logo Upload (Recruiter only)
  static async uploadCompanyLogo(user: AuthenticatedUser, file: Express.Multer.File) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile || !recruiterProfile.companyId) {
      throw new BadRequestError('Recruiter has no associated company.');
    }

    const company = await prisma.company.findUnique({
      where: { id: recruiterProfile.companyId },
    });

    if (!company) {
      throw new NotFoundError('Company not found.');
    }

    if (company.logoPublicId) {
      await deleteFromCloudinary(company.logoPublicId, 'image');
    }

    const result = await uploadToCloudinary(file.buffer, {
      folder: 'skillbridge/companies',
      resource_type: 'image',
      transformation: [
        { width: 500, height: 500, crop: 'limit', quality: 'auto' },
      ],
      public_id: `company_${company.id}_${Date.now()}`,
    });

    await prisma.company.update({
      where: { id: company.id },
      data: {
        logo: result.secure_url,
        logoPublicId: result.public_id,
      },
    });

    return {
      logo: result.secure_url,
      logoPublicId: result.public_id,
    };
  }

  // 6. Company Logo Deletion (Recruiter only)
  static async deleteCompanyLogo(user: AuthenticatedUser) {
    const recruiterProfile = user.recruiterProfile;
    if (!recruiterProfile || !recruiterProfile.companyId) {
      throw new BadRequestError('Recruiter has no associated company.');
    }

    const company = await prisma.company.findUnique({
      where: { id: recruiterProfile.companyId },
    });

    if (!company || (!company.logo && !company.logoPublicId)) {
      throw new NotFoundError('No company logo found to delete.');
    }

    if (company.logoPublicId) {
      await deleteFromCloudinary(company.logoPublicId, 'image');
    }

    await prisma.company.update({
      where: { id: company.id },
      data: {
        logo: null,
        logoPublicId: null,
      },
    });

    return { message: 'Company logo deleted successfully' };
  }
}
