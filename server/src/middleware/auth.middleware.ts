import { Request, Response, NextFunction } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { verifyToken, AUTH_COOKIE_NAME } from '../lib/jwt';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';
import { prisma } from '../lib/prisma';

// Authenticate middleware — validates JWT from HTTP-only cookie or Bearer header
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  // 1. Check HTTP-only cookie first
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  }
  // 2. Fall back to Authorization Bearer header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    throw new UnauthorizedError('Authentication required. Please log in.');
  }

  // Verify JWT token
  const payload = verifyToken(token);

  // Load user from database to ensure the account still exists and is in good standing
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      profileImage: true,
      phone: true,
      location: true,
      studentProfile: {
        select: {
          id: true,
          university: true,
          major: true,
          graduationYear: true,
          gpa: true,
          bio: true,
          resumeUrl: true,
          resumePublicId: true,
        },
      },
      recruiterProfile: {
        select: {
          id: true,
          companyId: true,
          position: true,
          company: {
            select: {
              id: true,
              name: true,
              website: true,
              logo: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('User account not found');
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new ForbiddenError('Your account has been suspended. Please contact support.');
  }

  req.user = user;
  next();
}

// Optional authentication middleware — attaches user if valid token exists, proceeds as guest otherwise
export async function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  let token: string | undefined;

  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    token = req.cookies[AUTH_COOKIE_NAME];
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.substring(7);
  }

  if (!token) {
    return next();
  }

  try {
    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        profileImage: true,
        phone: true,
        location: true,
        studentProfile: {
          select: {
            id: true,
            university: true,
            major: true,
            graduationYear: true,
            gpa: true,
            bio: true,
            resumeUrl: true,
            resumePublicId: true,
          },
        },
        recruiterProfile: {
          select: {
            id: true,
            companyId: true,
            position: true,
            company: {
              select: {
                id: true,
                name: true,
                website: true,
                logo: true,
              },
            },
          },
        },
      },
    });

    if (user && user.status !== UserStatus.SUSPENDED) {
      req.user = user;
    }
  } catch {
    // If token invalid, proceed as guest
  }

  next();
}

// Role-based authorization middleware
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError('Access denied: insufficient permissions');
    }

    next();
  };
}

// Account status middleware
export function requireActiveStatus(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    throw new UnauthorizedError('Authentication required');
  }

  if (req.user.status !== UserStatus.ACTIVE) {
    throw new ForbiddenError('Access restricted: your account is not currently active');
  }

  next();
}
