import { Request, Response } from 'express';
import { SavedJobService } from '../services/savedJob.service';
import { savedJobsQuerySchema } from '../validators/savedJob.validator';

export class SavedJobController {
  // POST /api/v1/jobs/:jobId/save (Student only)
  static async saveJob(req: Request, res: Response): Promise<void> {
    const savedJob = await SavedJobService.saveJob(req.params.jobId, req.user!);

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: { savedJob },
    });
  }

  // DELETE /api/v1/jobs/:jobId/save (Student only)
  static async removeSavedJob(req: Request, res: Response): Promise<void> {
    const result = await SavedJobService.removeSavedJob(req.params.jobId, req.user!);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // GET /api/v1/saved-jobs (Student only)
  static async getMySavedJobs(req: Request, res: Response): Promise<void> {
    const query = savedJobsQuerySchema.parse(req.query);
    const result = await SavedJobService.getMySavedJobs(req.user!, query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/jobs/:jobId/save-status (Student only)
  static async checkSaveStatus(req: Request, res: Response): Promise<void> {
    const result = await SavedJobService.checkSaveStatus(req.params.jobId, req.user!);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
}
