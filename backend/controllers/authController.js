import asyncHandler from 'express-async-handler';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import { generateVerificationCode, hashCode } from './verificationController.js';
import { sendVerificationEmail } from '../services/emailService.js';

/**
 * Generate refresh token
 * @param {string} userId - User ID
 * @returns {string} - Refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d',
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * Response:
 * {
 *   "_id": "...",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "token": "jwt_token_here"
 * }
 */
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // Create user (password will be hashed by pre-save middleware)
    const user = await User.create({
        name,
        email,
        password,
        authProvider: 'credentials',
    });

    if (user) {
        // Generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token
        user.refreshTokens.push({ token: refreshToken });

        // Email verification disabled (Resend free tier limitation)
        // Users can login immediately without verification
        user.isVerified = true; // Auto-verify all users
        await user.save();

        // Generate and send OTP for email verification (DISABLED)
        // const verificationCode = generateVerificationCode();
        // const hashedCode = hashCode(verificationCode);
        // const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // user.verificationCode = hashedCode;
        // user.verificationCodeExpiry = expiry;
        // await user.save();
        // Send verification email (DISABLED)
        // try {
        //     await sendVerificationEmail(user.email, verificationCode, user.name);
        //     console.log(`Verification email sent to ${user.email}`);
        // } catch (error) {
        //     console.error('Failed to send verification email:', error);
        // }

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
            isVerified: user.isVerified,
            token: accessToken,
            refreshToken,
            requiresVerification: true,
            message: 'Registration successful! Please check your email for verification code.',
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 * 
 * Request Body:
 * {
 *   "email": "john@example.com",
 *   "password": "password123"
 * }
 * 
 * Response: Same as register
 */
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    // Find user and include password field (normally excluded)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
        // Generate tokens
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        // Store refresh token
        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
            isVerified: user.isVerified,
            token: accessToken,
            refreshToken,
        });
    } else {
        res.status(401);
        throw new Error('Wrong credentials');
    }
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private (requires token)
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Response:
 * {
 *   "_id": "...",
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "authProvider": "credentials",
 *   "isVerified": false
 * }
 */
const getMe = asyncHandler(async (req, res) => {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
            isVerified: user.isVerified,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 * 
 * Request Body:
 * {
 *   "refreshToken": "refresh_token_here"
 * }
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400);
        throw new Error('Refresh token required');
    }

    try {
        // Verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        // Find user and check if token exists
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401);
            throw new Error('Invalid refresh token');
        }

        // Check if refresh token exists in database
        const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);

        if (!tokenExists) {
            res.status(401);
            throw new Error('Refresh token not found or expired');
        }

        // Generate new tokens
        const newAccessToken = generateToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Remove old refresh token and add new one (rotation)
        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
        user.refreshTokens.push({ token: newRefreshToken });
        await user.save();

        res.json({
            token: newAccessToken,
            refreshToken: newRefreshToken,
        });
    } catch (error) {
        res.status(401);
        throw new Error('Invalid or expired refresh token');
    }
});

/**
 * @desc    Logout (invalidate refresh token)
 * @route   POST /api/auth/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    const user = await User.findById(req.user._id);

    if (refreshToken) {
        // Remove specific refresh token
        user.refreshTokens = user.refreshTokens.filter((t) => t.token !== refreshToken);
    } else {
        // Remove all refresh tokens (logout from all devices)
        user.refreshTokens = [];
    }

    await user.save();

    res.json({ message: 'Logged out successfully' });
});

/**
 * @desc    Login as Guest (create temporary account)
 * @route   POST /api/auth/guest-login
 * @access  Public
 */
const guestLogin = asyncHandler(async (req, res) => {
    // Generates a random guest identity
    const guestId = crypto.randomBytes(4).toString('hex');
    const name = `Guest User ${guestId}`;
    const email = `guest_${Date.now()}_${guestId}@guest.com`;
    const password = crypto.randomBytes(16).toString('hex');

    const user = await User.create({
        name,
        email,
        password,
        authProvider: 'credentials',
        isGuest: true,
        isVerified: true
    });

    if (user) {
        const accessToken = generateToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        user.refreshTokens.push({ token: refreshToken });
        await user.save();

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            authProvider: user.authProvider,
            isGuest: true,
            isVerified: user.isVerified,
            token: accessToken,
            refreshToken,
        });
    } else {
        res.status(400);
        throw new Error('Failed to create guest session');
    }
});

export { registerUser, loginUser, getMe, refreshAccessToken, logout, guestLogin };
