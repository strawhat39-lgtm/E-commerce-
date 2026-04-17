import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';

export const getMe = (req: AuthRequest, res: Response) => {
  if (!req.profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  // Return current user profile along with raw session info
  res.json({
    message: 'Authentication successful',
    profile: req.profile,
    auth_provider_metadata: req.user?.app_metadata
  });
};
