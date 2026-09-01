import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { setAuthCookie, clearAuthCookie } from '../lib/jwt';
import {
  studentRegisterSchema,
  recruiterRegisterSchema,
  loginSchema,
} from '../validators/auth.validator';

export class AuthController {
  // POST /api/v1/auth/register/student
  static async registerStudent(req: Request, res: Response): Promise<void> {
    const validatedInput = studentRegisterSchema.parse(req.body);
    const { user, token } = await AuthService.registerStudent(validatedInput);

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Student account registered successfully',
      data: { user },
    });
  }

  // POST /api/v1/auth/register/recruiter
  static async registerRecruiter(req: Request, res: Response): Promise<void> {
    const validatedInput = recruiterRegisterSchema.parse(req.body);
    const { user, token } = await AuthService.registerRecruiter(validatedInput);

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Recruiter account registered successfully',
      data: { user },
    });
  }

  // POST /api/v1/auth/register (unified endpoint supporting role or delegating)
  static async register(req: Request, res: Response): Promise<void> {
    const role = req.body.role;

    if (role === 'RECRUITER') {
      return AuthController.registerRecruiter(req, res);
    }

    // Default to student registration
    return AuthController.registerStudent(req, res);
  }

  // POST /api/v1/auth/login
  static async login(req: Request, res: Response): Promise<void> {
    const validatedInput = loginSchema.parse(req.body);
    const { user, token } = await AuthService.login(validatedInput);

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user },
    });
  }

  // POST /api/v1/auth/logout
  static async logout(_req: Request, res: Response): Promise<void> {
    clearAuthCookie(res);

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  }

  // GET /api/v1/auth/me
  static async me(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  }
}
