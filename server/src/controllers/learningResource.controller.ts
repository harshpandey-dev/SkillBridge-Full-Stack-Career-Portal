import { Request, Response } from 'express';
import { LearningResourceService } from '../services/learningResource.service';
import {
  createLearningResourceSchema,
  updateLearningResourceSchema,
  resourceQuerySchema,
  featuredResourceQuerySchema,
  toggleFeaturedSchema,
} from '../validators/learningResource.validator';

export class LearningResourceController {
  // GET /api/v1/resources (Public)
  static async getAllResources(req: Request, res: Response): Promise<void> {
    const query = resourceQuerySchema.parse(req.query);
    const result = await LearningResourceService.getAllResources(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/resources/featured (Public)
  static async getFeaturedResources(req: Request, res: Response): Promise<void> {
    const query = featuredResourceQuerySchema.parse(req.query);
    const result = await LearningResourceService.getFeaturedResources(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }

  // GET /api/v1/resources/:resourceId (Public)
  static async getResourceById(req: Request, res: Response): Promise<void> {
    const resource = await LearningResourceService.getResourceById(req.params.resourceId);

    res.status(200).json({
      success: true,
      data: { resource },
    });
  }

  // POST /api/v1/admin/resources (Admin only)
  static async createResource(req: Request, res: Response): Promise<void> {
    const input = createLearningResourceSchema.parse(req.body);
    const resource = await LearningResourceService.createResource(input);

    res.status(201).json({
      success: true,
      message: 'Learning resource created successfully',
      data: { resource },
    });
  }

  // PATCH /api/v1/admin/resources/:resourceId (Admin only)
  static async updateResource(req: Request, res: Response): Promise<void> {
    const input = updateLearningResourceSchema.parse(req.body);
    const resource = await LearningResourceService.updateResource(
      req.params.resourceId,
      input
    );

    res.status(200).json({
      success: true,
      message: 'Learning resource updated successfully',
      data: { resource },
    });
  }

  // DELETE /api/v1/admin/resources/:resourceId (Admin only)
  static async deleteResource(req: Request, res: Response): Promise<void> {
    const result = await LearningResourceService.deleteResource(req.params.resourceId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // PATCH /api/v1/admin/resources/:resourceId/featured (Admin only)
  static async toggleFeatured(req: Request, res: Response): Promise<void> {
    const input = toggleFeaturedSchema.parse(req.body);
    const resource = await LearningResourceService.toggleFeatured(
      req.params.resourceId,
      input
    );

    res.status(200).json({
      success: true,
      message: `Resource featured status set to ${resource.featured}`,
      data: { resource },
    });
  }

  // GET /api/v1/admin/resources/stats (Admin only)
  static async getResourceStats(_req: Request, res: Response): Promise<void> {
    const stats = await LearningResourceService.getResourceStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  }
}
