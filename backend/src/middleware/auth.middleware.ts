import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../utils/supabaseClient';
import { User } from '@supabase/supabase-js';

// Extend the Express Request to hold our auth data securely
export interface AuthRequest extends Request {
  user?: User;
  profile?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    
    // Step 4: Verify token with Supabase Admin
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
    }

    // Step 5 & 6: Extract user info & Profile Sync Logic
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code === 'PGRST116') {
      // On first login: If profile does not exist, insert it using OAuth metadata
      const newProfileInfo = {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || 'Anonymous User',
        avatar_url: user.user_metadata?.avatar_url || null,
        role: 'user' // Default to user
      };

      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .upsert([newProfileInfo], { onConflict: 'id' })
        .select()
        .single();
        
      if (insertError) {
        console.error('Error creating profile during sync:', insertError);
        return res.status(500).json({ error: 'Failed to create user profile' });
      }

      req.user = user;
      req.profile = newProfile;
      return next();
    } else if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Database error fetching profile' });
    }

    // On subsequent logins: Attach existing profile to request
    req.user = user;
    req.profile = profile;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Internal Server Error during authentication' });
  }
};

// Role Handling wrapper middleware
export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.profile || req.profile.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Admin role required.' });
  }
  next();
};
