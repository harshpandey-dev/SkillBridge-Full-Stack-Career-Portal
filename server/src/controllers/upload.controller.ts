import { Request, Response } from 'express';
import { UploadService } from '../services/upload.service';

export class UploadController {
  // POST /api/v1/student/profile/resume
  static async uploadResume(req: Request, res: Response): Promise<void> {
    const result = await UploadService.uploadResume(req.user!, req.file!);

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: result,
    });
  }

  // DELETE /api/v1/student/profile/resume
  static async deleteResume(req: Request, res: Response): Promise<void> {
    const result = await UploadService.deleteResume(req.user!);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // POST /api/v1/profile/image
  static async uploadProfileImage(req: Request, res: Response): Promise<void> {
    const result = await UploadService.uploadProfileImage(req.user!, req.file!);

    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: result,
    });
  }

  // DELETE /api/v1/profile/image
  static async deleteProfileImage(req: Request, res: Response): Promise<void> {
    const result = await UploadService.deleteProfileImage(req.user!);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // POST /api/v1/recruiter/company/logo
  static async uploadCompanyLogo(req: Request, res: Response): Promise<void> {
    const result = await UploadService.uploadCompanyLogo(req.user!, req.file!);

    res.status(200).json({
      success: true,
      message: 'Company logo uploaded successfully',
      data: result,
    });
  }

  // DELETE /api/v1/recruiter/company/logo
  static async deleteCompanyLogo(req: Request, res: Response): Promise<void> {
    const result = await UploadService.deleteCompanyLogo(req.user!);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }
}
