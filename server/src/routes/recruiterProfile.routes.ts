import { Router } from 'express';
import { Role } from '@prisma/client';
import { RecruiterProfileController } from '../controllers/recruiterProfile.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All recruiter profile routes require RECRUITER role
router.use(authenticate, authorize(Role.RECRUITER));

// Recruiter Profile
router.get('/profile', RecruiterProfileController.getProfile);
router.patch('/profile', RecruiterProfileController.updateProfile);

// Recruiter Statistics & Job Summary
router.get('/profile/stats', RecruiterProfileController.getStats);
router.get('/profile/job-summary', RecruiterProfileController.getJobSummary);

// Notification Preferences
router.get(
  '/profile/notification-preferences',
  RecruiterProfileController.getNotificationPreferences
);
router.patch(
  '/profile/notification-preferences',
  RecruiterProfileController.updateNotificationPreferences
);

export default router;
