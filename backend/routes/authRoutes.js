import express from 'express';
import { registerUser, loginUser, getMe, refreshAccessToken, logout } from '../controllers/authController.js';
import { sendVerification, verifyEmail, resendVerification } from '../controllers/verificationController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authLimiter, verificationLimiter } from '../middlewares/rateLimitMiddleware.js';

const router = express.Router();

/**
 * Authentication Routes
 * 
 * POST /api/auth/register - Register new user
 * POST /api/auth/login - Login user
 * GET  /api/auth/me - Get current user (protected)
 * POST /api/auth/refresh - Refresh access token
 * POST /api/auth/logout - Logout (invalidate refresh token)
 */

// Public routes with rate limiting
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.post('/refresh', refreshAccessToken);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

/**
 * Email Verification Routes
 * 
 * POST /api/auth/send-verification - Send verification code
 * POST /api/auth/verify-email - Verify email with code
 * POST /api/auth/resend-verification - Resend verification code
 */
router.post('/send-verification', protect, verificationLimiter, sendVerification);
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-verification', protect, verificationLimiter, resendVerification);

/**
 * Google OAuth Routes
 * 
 * GET /api/auth/google
 * - Initiates Google OAuth flow
 * - Redirects to Google consent screen
 * 
 * GET /api/auth/google/callback
 * - Google redirects here after authentication
 * - Handles login/signup and generates JWT
 */
import passport from '../config/passport.js';
import { googleAuthCallback } from '../controllers/googleAuthController.js';

// Initiate Google OAuth
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        session: false,
    })
);

// Google OAuth callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
    }),
    googleAuthCallback
);

// Phase-3 routes (placeholders):
// router.post('/verify-email', verifyEmail);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);

export default router;
