import { Router } from 'express';
import { SkillController } from '../controllers/skill.controller';
import { optionalAuthenticate } from '../middleware/auth.middleware';

const router = Router();

// Search and list skills for suggestion palette
router.get('/', optionalAuthenticate, SkillController.searchSkills);

export default router;
