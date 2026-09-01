import { Router } from 'express';
import { Role } from '@prisma/client';
import { SavedJobController } from '../controllers/savedJob.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Student only: List all saved jobs
router.get('/', authenticate, authorize(Role.STUDENT), SavedJobController.getMySavedJobs);

export default router;
