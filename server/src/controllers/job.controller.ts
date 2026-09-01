import { Request, Response } from 'express';
import { JobService } from '../services/job.service';
import {
  createJobSchema,
  updateJobSchema,
  jobQuerySchema,
  myJobsQuerySchema,
} from '../validators/job.validator';

export class JobController {
  // POST /api/v1/jobs (Recruiter only)
  static async createJob(req: Request, res: Response): Promise<void> {
    const input = createJobSchema.parse(req.body);
    const job = await JobService.createJob(req.user!, input);

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: { job },
    });
  }

  // PATCH /api/v1/jobs/:jobId (Owner recruiter or Admin)
  static async updateJob(req: Request, res: Response): Promise<void> {
    const input = updateJobSchema.parse(req.body);
    const job = await JobService.updateJob(req.params.jobId, req.user!, input);

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: { job },
    });
  }

  // DELETE /api/v1/jobs/:jobId (Owner recruiter or Admin)
  static async deleteJob(req: Request, res: Response): Promise<void> {
    const result = await JobService.deleteJob(req.params.jobId, req.user!);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // PATCH /api/v1/jobs/:jobId/close (Owner recruiter or Admin)
  static async closeJob(req: Request, res: Response): Promise<void> {
    const job = await JobService.closeJob(req.params.jobId, req.user!);

    res.status(200).json({
      success: true,
      message: 'Job closed successfully',
      data: { job },
    });
  }

  // PATCH /api/v1/jobs/:jobId/reopen (Owner recruiter or Admin)
  static async reopenJob(req: Request, res: Response): Promise<void> {
    const job = await JobService.reopenJob(req.params.jobId, req.user!);

    res.status(200).json({
      success: true,
      message: 'Job reopened successfully',
      data: { job },
    });
  }

  // GET /api/v1/jobs (Public with optional auth context)
  static async getAllJobs(req: Request, res: Response): Promise<void> {
    const query = jobQuerySchema.parse(req.query);
    const result = await JobService.getAllJobs(query, req.user);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/jobs/my-jobs (Recruiter only)
  static async getMyJobs(req: Request, res: Response): Promise<void> {
    const query = myJobsQuerySchema.parse(req.query);
    const result = await JobService.getMyJobs(req.user!, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/jobs/:jobId (Public with optional auth context)
  static async getJobById(req: Request, res: Response): Promise<void> {
    const job = await JobService.getJobById(req.params.jobId, req.user);

    res.status(200).json({
      success: true,
      data: { job },
    });
  }
}
