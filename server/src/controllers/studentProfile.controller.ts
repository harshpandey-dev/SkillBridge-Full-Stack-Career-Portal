import { Request, Response } from 'express';
import { StudentProfileService } from '../services/studentProfile.service';
import {
  updateStudentProfileSchema,
  addStudentSkillSchema,
} from '../validators/studentProfile.validator';

export class StudentProfileController {
  // GET /api/v1/student/profile (Student only)
  static async getProfile(req: Request, res: Response): Promise<void> {
    const profile = await StudentProfileService.getStudentProfile(req.user!);

    res.status(200).json({
      success: true,
      data: profile,
    });
  }

  // PATCH /api/v1/student/profile (Student only)
  static async updateProfile(req: Request, res: Response): Promise<void> {
    const input = updateStudentProfileSchema.parse(req.body);
    const profile = await StudentProfileService.updateStudentProfile(req.user!, input);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: profile,
    });
  }

  // GET /api/v1/student/skills (Student only)
  static async getSkills(req: Request, res: Response): Promise<void> {
    const skills = await StudentProfileService.getStudentSkills(req.user!);

    res.status(200).json({
      success: true,
      data: { skills },
    });
  }

  // POST /api/v1/student/skills (Student only)
  static async addSkill(req: Request, res: Response): Promise<void> {
    const input = addStudentSkillSchema.parse(req.body);
    const skill = await StudentProfileService.addStudentSkill(req.user!, input);

    res.status(201).json({
      success: true,
      message: 'Skill added to profile successfully',
      data: { skill },
    });
  }

  // DELETE /api/v1/student/skills/:skillId (Student only)
  static async removeSkill(req: Request, res: Response): Promise<void> {
    const result = await StudentProfileService.removeStudentSkill(
      req.user!,
      req.params.skillId
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }

  // GET /api/v1/student/profile/completion (Student only)
  static async getProfileCompletion(req: Request, res: Response): Promise<void> {
    const completion = await StudentProfileService.getProfileCompletion(req.user!);

    res.status(200).json({
      success: true,
      data: completion,
    });
  }
}
