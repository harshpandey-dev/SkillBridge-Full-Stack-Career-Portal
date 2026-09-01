import { Request, Response } from 'express';
import { SkillService } from '../services/skill.service';
import { skillQuerySchema } from '../validators/skill.validator';

export class SkillController {
  // GET /api/v1/skills (Public / Authenticated)
  static async searchSkills(req: Request, res: Response): Promise<void> {
    const query = skillQuerySchema.parse(req.query);
    const result = await SkillService.searchSkills(query);

    res.status(200).json({
      success: true,
      data: result,
    });
  }
}
