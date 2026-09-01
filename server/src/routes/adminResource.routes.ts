import { Router } from 'express';
import { Role } from '@prisma/client';
import { LearningResourceController } from '../controllers/learningResource.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// All admin resource management routes require ADMIN role
router.use(authenticate, authorize(Role.ADMIN));

router.post('/', LearningResourceController.createResource);
router.get('/stats', LearningResourceController.getResourceStats);
router.patch('/:resourceId/featured', LearningResourceController.toggleFeatured);
router.patch('/:resourceId', LearningResourceController.updateResource);
router.delete('/:resourceId', LearningResourceController.deleteResource);

export default router;
