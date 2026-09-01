import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadProfileImageMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Profile image routes require authenticated user (any role)
router.use(authenticate);

router.post('/image', uploadProfileImageMiddleware, UploadController.uploadProfileImage);
router.delete('/image', UploadController.deleteProfileImage);

export default router;
