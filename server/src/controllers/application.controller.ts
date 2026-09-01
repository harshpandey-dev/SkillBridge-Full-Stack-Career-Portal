import { Request, Response } from 'express';
import { ApplicationService } from '../services/application.service';
import {
  applyJobSchema,
  updateApplicationStatusSchema,
  myApplicationsQuerySchema,
  jobApplicantsQuerySchema,
} from '../validators/application.validator';

export class ApplicationController {
  // POST /api/v1/jobs/:jobId/applications (Student only)
  static async applyForJob(req: Request, res: Response): Promise<void> {
    const input = applyJobSchema.parse(req.body);
    const application = await ApplicationService.applyForJob(
      req.params.jobId,
      req.user!,
      input
    );

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application },
    });
  }

  // GET /api/v1/applications (Student only)
  static async getMyApplications(req: Request, res: Response): Promise<void> {
    const query = myApplicationsQuerySchema.parse(req.query);
    const result = await ApplicationService.getMyApplications(req.user!, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/applications/:applicationId (Student owner, Recruiter job owner, or Admin)
  static async getApplicationById(req: Request, res: Response): Promise<void> {
    const application = await ApplicationService.getApplicationById(
      req.params.applicationId,
      req.user!
    );

    res.status(200).json({
      success: true,
      data: { application },
    });
  }

  // GET /api/v1/jobs/:jobId/applications (Recruiter job owner or Admin)
  static async getJobApplicants(req: Request, res: Response): Promise<void> {
    const query = jobApplicantsQuerySchema.parse(req.query);
    const result = await ApplicationService.getJobApplicants(
      req.params.jobId,
      req.user!,
      query
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // PATCH /api/v1/applications/:applicationId/status (Recruiter job owner or Admin)
  static async updateApplicationStatus(req: Request, res: Response): Promise<void> {
    const input = updateApplicationStatusSchema.parse(req.body);
    const application = await ApplicationService.updateApplicationStatus(
      req.params.applicationId,
      req.user!,
      input
    );

    res.status(200).json({
      success: true,
      message: `Application status updated to ${application.status}`,
      data: { application },
    });
  }
}
