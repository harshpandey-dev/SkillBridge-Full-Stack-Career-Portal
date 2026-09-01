import { Router } from 'express';
import { Role } from '@prisma/client';
import { StudentProfileController } from '../controllers/studentProfile.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All student profile routes require STUDENT role
router.use(authenticate, authorize(Role.STUDENT));

// Profile management
router.get('/profile', StudentProfileController.getProfile);
router.patch('/profile', StudentProfileController.updateProfile);
router.get('/profile/completion', StudentProfileController.getProfileCompletion);

// Skills management
router.get('/skills', StudentProfileController.getSkills);
router.post('/skills', StudentProfileController.addSkill);
router.delete('/skills/:skillId', StudentProfileController.removeSkill);

export default router;
