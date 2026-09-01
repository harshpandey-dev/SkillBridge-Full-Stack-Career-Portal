import { Router } from 'express';
import { Role } from '@prisma/client';
import { ApplicationController } from '../controllers/application.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Student routes
router.get('/', authenticate, authorize(Role.STUDENT), ApplicationController.getMyApplications);

// Shared / authorized application detail route
router.get('/:applicationId', authenticate, ApplicationController.getApplicationById);

// Recruiter status update route
router.patch(
  '/:applicationId/status',
  authenticate,
  authorize(Role.RECRUITER, Role.ADMIN),
  ApplicationController.updateApplicationStatus
);

export default router;
