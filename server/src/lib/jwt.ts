import jwt from 'jsonwebtoken';
import { Response, CookieOptions } from 'express';
import { Role, UserStatus } from '@prisma/client';
import { UnauthorizedError } from './errors';

export interface JwtPayload {
  userId: string;
  role: Role;
  status: UserStatus;
  email: string;
}

const DEV_FALLBACK_SECRET = 'skillbridge_default_jwt_secret_dev';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret === DEV_FALLBACK_SECRET || secret.trim() === '') {
      throw new Error(
        'FATAL: JWT_SECRET environment variable must be explicitly defined and cannot use the development fallback in production.'
      );
    }
    return secret;
  }
  return secret || DEV_FALLBACK_SECRET;
}

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const AUTH_COOKIE_NAME = 'sb_token';

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    throw new UnauthorizedError('Invalid or expired authentication token');
  }
}

export function getCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  // Configurable SameSite: 'lax' (default for same-site / unified root), 'strict', or 'none' (for cross-site)
  const rawSameSite = process.env.COOKIE_SAME_SITE?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined;
  const sameSite: 'lax' | 'strict' | 'none' =
    rawSameSite && ['lax', 'strict', 'none'].includes(rawSameSite)
      ? rawSameSite
      : 'lax';

  // Secure is required in production and mandatory whenever sameSite is 'none'
  const secure = isProduction || sameSite === 'none';

  const options: CookieOptions = {
    httpOnly: true,
    secure,
    sameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  };

  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(res: Response): void {
  const cookieOpts = getCookieOptions();
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    domain: cookieOpts.domain,
    path: '/',
  });
}
