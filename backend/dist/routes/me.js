"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected route example
// Handled by our requireAuth middleware extracting bearer token
router.get('/', auth_middleware_1.requireAuth, authController_1.getMe);
exports.default = router;
