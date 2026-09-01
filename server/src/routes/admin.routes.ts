import { Router } from 'express';
import { Role } from '@prisma/client';
import { AdminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Protect all admin routes with authentication and ADMIN role check
router.use(authenticate, authorize(Role.ADMIN));

// Platform Dashboard & Analytics
router.get('/dashboard', AdminController.getDashboardStats);
router.get('/analytics', AdminController.getPlatformAnalytics);
router.get('/analytics/growth', AdminController.getGrowthAnalytics);

// User Management
router.get('/users', AdminController.getUsers);
router.get('/users/:userId', AdminController.getUserById);
router.patch('/users/:userId/status', AdminController.updateUserStatus);
router.delete('/users/:userId', AdminController.deleteUser);

// Job Management
router.get('/jobs', AdminController.getJobs);
router.get('/jobs/:jobId', AdminController.getJobById);
router.patch('/jobs/:jobId/status', AdminController.updateJobStatus);
router.delete('/jobs/:jobId', AdminController.deleteJob);

// Application Management
router.get('/applications', AdminController.getApplications);
router.get('/applications/:applicationId', AdminController.getApplicationById);

export default router;
