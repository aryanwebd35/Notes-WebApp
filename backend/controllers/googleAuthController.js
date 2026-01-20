import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

/**
 * Google OAuth Controller
 * 
 * Handles Google OAuth login/signup flow
 * Flow:
 * 1. User clicks "Continue with Google" on frontend
 * 2. Frontend redirects to /api/auth/google
 * 3. User authenticates with Google
 * 4. Google redirects to /api/auth/google/callback with code
 * 5. Backend exchanges code for user info
 * 6. Check if user exists → login, else → create account
 * 7. Generate JWT and redirect to frontend with token
 */

/**
 * @desc    Google OAuth callback handler
 * @route   GET /api/auth/google/callback
 * @access  Public
 * 
 * This function is called after Google authentication
 * It receives user profile from Passport and handles login/signup
 */
const googleAuthCallback = asyncHandler(async (req, res) => {
    try {
        // User profile from Passport Google Strategy
        const { id, displayName, emails, photos } = req.user;

        if (!emails || emails.length === 0) {
            return res.redirect(`${process.env.CLIENT_URL}/login?error=no_email`);
        }

        const email = emails[0].value;
        const name = displayName;
        const googleId = id;
        const avatar = photos && photos.length > 0 ? photos[0].value : null;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // User exists - LOGIN
            // Update Google ID if not set
            if (!user.googleId) {
                user.googleId = googleId;
                user.authProvider = 'google';
                await user.save();
            }
        } else {
            // User doesn't exist - SIGNUP
            user = await User.create({
                name,
                email,
                googleId,
                authProvider: 'google',
                isVerified: true, // Google users are auto-verified
                password: Math.random().toString(36).slice(-8), // Random password (won't be used)
            });
        }

        // Generate JWT token
        const token = generateToken(user._id);

        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL}/auth/google/callback?token=${token}`);
    } catch (error) {
        console.error('Google OAuth error:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
});

/**
 * @desc    Initiate Google OAuth
 * @route   GET /api/auth/google
 * @access  Public
 * 
 * This route is handled by Passport middleware
 * It redirects to Google's OAuth consent screen
 */
// This is handled by passport.authenticate('google') middleware in routes

export { googleAuthCallback };
