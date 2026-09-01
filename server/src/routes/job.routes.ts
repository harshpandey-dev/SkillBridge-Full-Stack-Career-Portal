import { Router } from 'express';
import { Role } from '@prisma/client';
import { JobController } from '../controllers/job.controller';
import { authenticate, optionalAuthenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (with optional user context for draft/owner detection)
router.get('/', optionalAuthenticate, JobController.getAllJobs);
router.get('/my-jobs', authenticate, authorize(Role.RECRUITER, Role.ADMIN), JobController.getMyJobs);
router.get('/:jobId', optionalAuthenticate, JobController.getJobById);

// Recruiter management routes
router.post('/', authenticate, authorize(Role.RECRUITER, Role.ADMIN), JobController.createJob);
router.patch('/:jobId', authenticate, authorize(Role.RECRUITER, Role.ADMIN), JobController.updateJob);
router.patch('/:jobId/close', authenticate, authorize(Role.RECRUITER, Role.ADMIN), JobController.closeJob);
router.patch('/:jobId/reopen', authenticate, authorize(Role.RECRUITER, Role.ADMIN), JobController.reopenJob);
router.delete('/:jobId', authenticate, authorize(Role.RECRUITER, Role.ADMIN), JobController.deleteJob);

export default router;
