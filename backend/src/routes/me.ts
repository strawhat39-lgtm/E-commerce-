import { Router } from 'express';
import { getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Protected route example
// Handled by our requireAuth middleware extracting bearer token
router.get('/', requireAuth, getMe);

export default router;
