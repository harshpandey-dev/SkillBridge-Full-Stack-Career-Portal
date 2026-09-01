import { Request, Response } from 'express';
import { RecruiterProfileService } from '../services/recruiterProfile.service';
import {
  updateRecruiterProfileSchema,
  updateNotificationPreferencesSchema,
} from '../validators/recruiterProfile.validator';

export class RecruiterProfileController {
  // GET /api/v1/recruiter/profile (Recruiter only)
  static async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await RecruiterProfileService.getRecruiterProfile(req.user!);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }

  // PATCH /api/v1/recruiter/profile (Recruiter only)
  static async updateProfile(req: Request, res: Response): Promise<void> {
    const input = updateRecruiterProfileSchema.parse(req.body);
    const profile = await RecruiterProfileService.updateRecruiterProfile(req.user!, input);

    res.status(200).json({
      success: true,
      message: 'Recruiter profile updated successfully',
      data: profile,
    });
  }

  // GET /api/v1/recruiter/profile/stats (Recruiter only)
  static async getStats(req: Request, res: Response): Promise<void> {
    const stats = await RecruiterProfileService.getRecruiterStats(req.user!);

    res.status(200).json({
      success: true,
      data: stats,
    });
  }

  // GET /api/v1/recruiter/profile/job-summary (Recruiter only)
  static async getJobSummary(req: Request, res: Response): Promise<void> {
    const summary = await RecruiterProfileService.getRecruiterJobSummary(req.user!);

    res.status(200).json({
      success: true,
      data: summary,
    });
  }

  // GET /api/v1/recruiter/profile/notification-preferences (Recruiter only)
  static async getNotificationPreferences(req: Request, res: Response): Promise<void> {
    const preferences = await RecruiterProfileService.getNotificationPreferences(req.user!);

    res.status(200).json({
      success: true,
      data: preferences,
    });
  }

  // PATCH /api/v1/recruiter/profile/notification-preferences (Recruiter only)
  static async updateNotificationPreferences(req: Request, res: Response): Promise<void> {
    const input = updateNotificationPreferencesSchema.parse(req.body);
    const preferences = await RecruiterProfileService.updateNotificationPreferences(
      req.user!,
      input
    );

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences,
    });
  }
}
