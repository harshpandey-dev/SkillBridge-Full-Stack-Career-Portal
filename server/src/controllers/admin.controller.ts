import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import {
  adminUserQuerySchema,
  updateUserStatusSchema,
  adminJobQuerySchema,
  updateJobStatusSchema,
  adminApplicationQuerySchema,
  growthQuerySchema,
} from '../validators/admin.validator';

export class AdminController {
  // GET /api/v1/admin/dashboard
  static async getDashboardStats(_req: Request, res: Response): Promise<void> {
    const stats = await AdminService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }

  // GET /api/v1/admin/users
  static async getUsers(req: Request, res: Response): Promise<void> {
    const query = adminUserQuerySchema.parse(req.query);
    const result = await AdminService.getUsers(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/admin/users/:userId
  static async getUserById(req: Request, res: Response): Promise<void> {
    const user = await AdminService.getUserById(req.params.userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  }

  // PATCH /api/v1/admin/users/:userId/status
  static async updateUserStatus(req: Request, res: Response): Promise<void> {
    const input = updateUserStatusSchema.parse(req.body);
    const user = await AdminService.updateUserStatus(
      req.user!.id,
      req.params.userId,
      input
    );

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: { user },
    });
  }

  // DELETE /api/v1/admin/users/:userId
  static async deleteUser(req: Request, res: Response): Promise<void> {
    const result = await AdminService.deleteUser(req.user!.id, req.params.userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  // GET /api/v1/admin/jobs
  static async getJobs(req: Request, res: Response): Promise<void> {
    const query = adminJobQuerySchema.parse(req.query);
    const result = await AdminService.getJobs(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/admin/jobs/:jobId
  static async getJobById(req: Request, res: Response): Promise<void> {
    const job = await AdminService.getJobById(req.params.jobId);

    res.status(200).json({
      success: true,
      data: { job },
    });
  }

  // PATCH /api/v1/admin/jobs/:jobId/status
  static async updateJobStatus(req: Request, res: Response): Promise<void> {
    const input = updateJobStatusSchema.parse(req.body);
    const job = await AdminService.updateJobStatus(req.params.jobId, input);

    res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      data: { job },
    });
  }

  // DELETE /api/v1/admin/jobs/:jobId
  static async deleteJob(req: Request, res: Response): Promise<void> {
    const result = await AdminService.deleteJob(req.params.jobId);

    res.status(200).json({
      success: true,
      ...result,
    });
  }

  // GET /api/v1/admin/applications
  static async getApplications(req: Request, res: Response): Promise<void> {
    const query = adminApplicationQuerySchema.parse(req.query);
    const result = await AdminService.getApplications(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/admin/applications/:applicationId
  static async getApplicationById(req: Request, res: Response): Promise<void> {
    const application = await AdminService.getApplicationById(req.params.applicationId);

    res.status(200).json({
      success: true,
      data: { application },
    });
  }

  // GET /api/v1/admin/analytics
  static async getPlatformAnalytics(_req: Request, res: Response): Promise<void> {
    const analytics = await AdminService.getPlatformAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  }

  // GET /api/v1/admin/analytics/growth
  static async getGrowthAnalytics(req: Request, res: Response): Promise<void> {
    const { days } = growthQuerySchema.parse(req.query);
    const growth = await AdminService.getGrowthAnalytics(days);

    res.status(200).json({
      success: true,
      data: growth,
    });
  }
}
