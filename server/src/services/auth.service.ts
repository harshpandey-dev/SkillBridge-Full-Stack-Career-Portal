import bcrypt from 'bcryptjs';
import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../lib/errors';
import {
  StudentRegisterInput,
  RecruiterRegisterInput,
  LoginInput,
} from '../validators/auth.validator';

const BCRYPT_SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Format safe user payload (without password)
export function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

export class AuthService {
  // Register a new Student
  static async registerStudent(input: StudentRegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    // Create User and StudentProfile in a Prisma transaction
    const result = await prisma.$transaction(async tx => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          phone: input.phone || null,
          location: input.location || null,
          studentProfile: {
            create: {
              university: input.university,
              major: input.major,
              graduationYear: input.graduationYear,
              gpa: input.gpa || null,
              bio: input.bio || null,
            },
          },
        },
        include: {
          studentProfile: true,
        },
      });

      return user;
    });

    const token = signToken({
      userId: result.id,
      role: result.role,
      status: result.status,
      email: result.email,
    });

    return {
      user: sanitizeUser(result),
      token,
    };
  }

  // Register a new Recruiter
  static async registerRecruiter(input: RecruiterRegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    // Create User and RecruiterProfile (and Company if needed) in a transaction
    const result = await prisma.$transaction(async tx => {
      let companyId = input.companyId || null;

      // If no existing companyId provided, but companyName is provided, find or create the company
      if (!companyId && input.companyName) {
        const existingCompany = await tx.company.findFirst({
          where: { name: { equals: input.companyName, mode: 'insensitive' } },
        });

        if (existingCompany) {
          companyId = existingCompany.id;
        } else {
          const newCompany = await tx.company.create({
            data: {
              name: input.companyName,
              website: input.companyWebsite || null,
              description: input.companyDescription || null,
              size: input.companySize || null,
              location: input.companyLocation || input.location || null,
            },
          });
          companyId = newCompany.id;
        }
      }

      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          role: Role.RECRUITER,
          status: UserStatus.ACTIVE,
          phone: input.phone || null,
          location: input.location || null,
          recruiterProfile: {
            create: {
              companyId,
              position: input.position || null,
            },
          },
        },
        include: {
          recruiterProfile: {
            include: {
              company: true,
            },
          },
        },
      });

      return user;
    });

    const token = signToken({
      userId: result.id,
      role: result.role,
      status: result.status,
      email: result.email,
    });

    return {
      user: sanitizeUser(result),
      token,
    };
  }

  // User Login
  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        studentProfile: true,
        recruiterProfile: {
          include: {
            company: true,
          },
        },
      },
    });

    // Generic error to avoid revealing if the email exists
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Account status checks
    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenError('Your account has been suspended. Please contact support.');
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      status: user.status,
      email: user.email,
    });

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  // Get Current Authenticated User by ID
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: {
          include: {
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        recruiterProfile: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenError('Your account has been suspended.');
    }

    return sanitizeUser(user);
  }
}
