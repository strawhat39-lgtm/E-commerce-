"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.requireAuth = void 0;
const supabaseClient_1 = require("../utils/supabaseClient");
const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or malformed Authorization header' });
        }
        const token = authHeader.split(' ')[1];
        // Step 4: Verify token with Supabase Admin
        const { data: { user }, error } = await supabaseClient_1.supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Invalid or expired token', details: error?.message });
        }
        // Step 5 & 6: Extract user info & Profile Sync Logic
        const { data: profile, error: profileError } = await supabaseClient_1.supabaseAdmin
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
            const { data: newProfile, error: insertError } = await supabaseClient_1.supabaseAdmin
                .from('profiles')
                .insert([newProfileInfo])
                .select()
                .single();
            if (insertError) {
                console.error('Error creating profile during sync:', insertError);
                return res.status(500).json({ error: 'Failed to create user profile' });
            }
            req.user = user;
            req.profile = newProfile;
            return next();
        }
        else if (profileError) {
            console.error('Profile fetch error:', profileError);
            return res.status(500).json({ error: 'Database error fetching profile' });
        }
        // On subsequent logins: Attach existing profile to request
        req.user = user;
        req.profile = profile;
        next();
    }
    catch (err) {
        console.error('Auth middleware error:', err);
        res.status(500).json({ error: 'Internal Server Error during authentication' });
    }
};
exports.requireAuth = requireAuth;
// Role Handling wrapper middleware
const requireAdmin = (req, res, next) => {
    if (!req.profile || req.profile.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
