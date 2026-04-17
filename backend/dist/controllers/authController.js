"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = void 0;
const getMe = (req, res) => {
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
exports.getMe = getMe;
