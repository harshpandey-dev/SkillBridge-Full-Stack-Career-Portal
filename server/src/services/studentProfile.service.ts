import { prisma } from '../lib/prisma';
import { NotFoundError, BadRequestError, ConflictError } from '../lib/errors';
import { AuthenticatedUser } from '../types/express';
import { UpdateStudentProfileInput, AddStudentSkillInput } from '../validators/studentProfile.validator';

interface ProfileCompletionResult {
  completionPercentage: number;
  completedFields: string[];
  missingFields: string[];
}

export function calculateProfileCompletion(
  user: { name?: string | null; profileImage?: string | null; phone?: string | null },
  profile: {
    university?: string | null;
    major?: string | null;
    graduationYear?: number | null;
    gpa?: number | null;
    bio?: string | null;
    resumeUrl?: string | null;
  } | null,
  skillsCount: number
): ProfileCompletionResult {
  const fieldsToCheck = [
    { key: 'name', isComplete: Boolean(user.name && user.name.trim()) },
    { key: 'profileImage', isComplete: Boolean(user.profileImage && user.profileImage.trim()) },
    { key: 'phone', isComplete: Boolean(user.phone && user.phone.trim()) },
    { key: 'university', isComplete: Boolean(profile?.university && profile.university.trim()) },
    { key: 'major', isComplete: Boolean(profile?.major && profile.major.trim()) },
    { key: 'graduationYear', isComplete: Boolean(profile?.graduationYear) },
    { key: 'gpa', isComplete: Boolean(profile?.gpa !== null && profile?.gpa !== undefined) },
    { key: 'bio', isComplete: Boolean(profile?.bio && profile.bio.trim()) },
    { key: 'skills', isComplete: skillsCount > 0 },
    { key: 'resume', isComplete: Boolean(profile?.resumeUrl && profile.resumeUrl.trim()) },
  ];

  const completedFields: string[] = [];
  const missingFields: string[] = [];

  for (const field of fieldsToCheck) {
    if (field.isComplete) {
      completedFields.push(field.key);
    } else {
      missingFields.push(field.key);
    }
  }

  const completionPercentage = Math.round((completedFields.length / fieldsToCheck.length) * 100);

  return {
    completionPercentage,
    completedFields,
    missingFields,
  };
}

export class StudentProfileService {
  // 1. Get Current Student Profile
  static async getStudentProfile(user: AuthenticatedUser) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required.');
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
        studentProfile: {
          include: {
            skills: {
              include: {
                skill: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
        },
      },
    });

    if (!fullUser || !fullUser.studentProfile) {
      throw new NotFoundError('Student profile not found.');
    }

    const formattedSkills = fullUser.studentProfile.skills.map(item => ({
      id: item.id,
      skillId: item.skill.id,
      name: item.skill.name,
      addedAt: item.createdAt,
    }));

    const completion = calculateProfileCompletion(
      {
        name: fullUser.name,
        profileImage: fullUser.profileImage,
        phone: fullUser.phone,
      },
      fullUser.studentProfile,
      formattedSkills.length
    );

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
      profile: {
        id: fullUser.studentProfile.id,
        university: fullUser.studentProfile.university,
        major: fullUser.studentProfile.major,
        graduationYear: fullUser.studentProfile.graduationYear,
        gpa: fullUser.studentProfile.gpa,
        bio: fullUser.studentProfile.bio,
        resumeUrl: fullUser.studentProfile.resumeUrl,
        resumePublicId: fullUser.studentProfile.resumePublicId,
        createdAt: fullUser.studentProfile.createdAt,
        updatedAt: fullUser.studentProfile.updatedAt,
      },
      skills: formattedSkills,
      profileCompletion: completion,
    };
  }

  // 2. Update Student Profile
  static async updateStudentProfile(user: AuthenticatedUser, input: UpdateStudentProfileInput) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required.');
    }

    const {
      name,
      phone,
      location,
      profileImage,
      university,
      major,
      graduationYear,
      gpa,
      bio,
      resumeUrl,
    } = input;

    // Use transaction to update User and StudentProfile together
    await prisma.$transaction(async tx => {
      // Update User fields if provided
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

      // Update StudentProfile fields if provided
      const profileUpdateData: Record<string, any> = {};
      if (university !== undefined) profileUpdateData.university = university;
      if (major !== undefined) profileUpdateData.major = major;
      if (graduationYear !== undefined) profileUpdateData.graduationYear = graduationYear;
      if (gpa !== undefined) profileUpdateData.gpa = gpa;
      if (bio !== undefined) profileUpdateData.bio = bio;
      if (resumeUrl !== undefined) profileUpdateData.resumeUrl = resumeUrl;

      if (Object.keys(profileUpdateData).length > 0) {
        await tx.studentProfile.update({
          where: { id: studentProfile.id },
          data: profileUpdateData,
        });
      }
    }, { maxWait: 15000, timeout: 30000 });

    return this.getStudentProfile(user);
  }

  // 3. Get Student Skills
  static async getStudentSkills(user: AuthenticatedUser) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required.');
    }

    const studentSkills = await prisma.studentSkill.findMany({
      where: { studentId: studentProfile.id },
      include: {
        skill: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return studentSkills.map(item => ({
      id: item.id,
      skillId: item.skill.id,
      name: item.skill.name,
      addedAt: item.createdAt,
    }));
  }

  // 4. Add Student Skill
  static async addStudentSkill(user: AuthenticatedUser, input: AddStudentSkillInput) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required.');
    }

    const trimmedName = input.name.trim();

    // Find existing skill case-insensitively or create new
    let skill = await prisma.skill.findFirst({
      where: {
        name: {
          equals: trimmedName,
          mode: 'insensitive',
        },
      },
    });

    if (!skill) {
      // Normalize skill name to Title Case or trimmed
      skill = await prisma.skill.create({
        data: {
          name: trimmedName,
        },
      });
    }

    // Check if skill is already added
    const existingStudentSkill = await prisma.studentSkill.findUnique({
      where: {
        studentId_skillId: {
          studentId: studentProfile.id,
          skillId: skill.id,
        },
      },
    });

    if (existingStudentSkill) {
      throw new ConflictError(`Skill "${skill.name}" is already added to your profile.`);
    }

    try {
      const studentSkill = await prisma.studentSkill.create({
        data: {
          studentId: studentProfile.id,
          skillId: skill.id,
        },
        include: {
          skill: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        id: studentSkill.id,
        skillId: studentSkill.skill.id,
        name: studentSkill.skill.name,
        addedAt: studentSkill.createdAt,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictError(`Skill "${skill.name}" is already added to your profile.`);
      }
      throw error;
    }
  }

  // 5. Remove Student Skill
  static async removeStudentSkill(user: AuthenticatedUser, skillIdOrStudentSkillId: string) {
    const studentProfile = user.studentProfile;
    if (!studentProfile) {
      throw new BadRequestError('Student profile is required.');
    }

    // Look up by skillId or studentSkill.id
    const studentSkill = await prisma.studentSkill.findFirst({
      where: {
        studentId: studentProfile.id,
        OR: [
          { skillId: skillIdOrStudentSkillId },
          { id: skillIdOrStudentSkillId },
        ],
      },
    });

    if (!studentSkill) {
      throw new NotFoundError('Skill not found in your profile.');
    }

    await prisma.studentSkill.delete({
      where: { id: studentSkill.id },
    });

    return { message: 'Skill removed from profile successfully' };
  }

  // 6. Get Profile Completion Details
  static async getProfileCompletion(user: AuthenticatedUser) {
    const profileData = await this.getStudentProfile(user);
    return profileData.profileCompletion;
  }
}
