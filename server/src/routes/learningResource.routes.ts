import { Router } from 'express';
import { LearningResourceController } from '../controllers/learningResource.controller';

const router = Router();

// Public routes for learning resource browsing
router.get('/', LearningResourceController.getAllResources);
router.get('/featured', LearningResourceController.getFeaturedResources);
router.get('/:resourceId', LearningResourceController.getResourceById);

export default router;
